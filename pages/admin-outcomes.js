
import { useState } from 'react';
import { useEffect } from 'react';
import {supabase} from '../config/supabase';
import spacetime from 'spacetime';

import { fetchData } from '../libs/fetchData';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config';

import Switch from '@mui/material/Switch';

import { threeWeeksAgo, oneDayAgo, neverUpdated } from '../libs/spacetime';
import { ContactSupportOutlined } from '@mui/icons-material';
import { getPaginationItemUtilityClass } from '@mui/material';


const getSubmissionsToBeUpdated = async () => {

    console.log(`Loading Submissions with a returned date since ${threeWeeksAgo} `)
    
    // we want to reprocess assignments for the last three weeks incase of changes to 
    // submissions
    const {data: submissions, error: submissionsError} = await supabase
                .from("Submissions")
                .select("id, assignmentId, classId, userId, returnedDate")
                .neq('status', 'working')
                .gt(`returnedDate`, threeWeeksAgo)
                .lt(`outcomeLastUpdated`, oneDayAgo)
                
    submissionsError != undefined && console.error(submissionsError);
    
    return submissions
}

const getFeedback = (os) => {
    try{
        return os.filter(o =>o['@odata.type'] === "#microsoft.graph.educationFeedbackOutcome")[0]['feedback']['text']['content']
    } catch (e) {
        return ''
    }
}

const getPoints = (os) => {
    try{
        return os.filter(o =>o['@odata.type'] === "#microsoft.graph.educationPointsOutcome")[0]['points']['points']
    } catch (e) {
        return null
    }
}

const getPublishedPoints = (os) => {
    try{
        return os.filter(o =>o['@odata.type'] === "#microsoft.graph.educationPointsOutcome")[0]['publishedPoints']['points']
    } catch (e) {
        return null
    }
}

const fetchOutcomesForSubmisison = async (instance, account, loginRequest, ctx) => {

    const outcomes = await fetchData(instance, account, loginRequest, {key: 'getOutcome', ...ctx})

    // console.log("outcomes", outcomes)

    const returnedOutcome = {
        classId: ctx.classId, 
        assignmentId: ctx.assignmentId,
        submissionId: ctx.submissionId,
        userId: ctx.userId,
        feedback : getFeedback(outcomes),
        points : getPoints(outcomes),
        publishedPoints : getPublishedPoints(outcomes)
    }

    
    return returnedOutcome;
    
}

const AdminOutcomesPage = () => {

    const [submissions, setSubmissions] = useState(null);
    const [submission, setSubmission] = useState(null);

    const [outcomes, setOutcomes] = useState(null);

    const [count, setCount] = useState(0)
    const [running, setRunning] = useState(false);
    const [timer, setTimer] = useState(null);

    const {instance, accounts} = useMsal()

    const getNextSubmission = async() => {
        
        // Get Next Matching Submission
        /*
         const {data: submission, error: submissionError} = await supabase
                                .from("Submissions")
                                .select("id, classId, assignmentId, userId, outcomeLastUpdated")
                                .neq('status', 'working')
                                .lt(`outcomeLastUpdated`, threeWeeksAgo)                            
                                .limit(1)
                                .maybeSingle()

        console.log("submission", submission);
        submissionError != undefined && console.error(submissionError)

        */
       
        if (submissions.length == 0){
            setSubmission(null)
            setRunning(false)
            return 
        }

        const nextSubmission = submissions.shift()

        // set the active submission.
        setSubmission(nextSubmission)
        setSubmissions(submissions)

    }

    

    // when the page loads, attempt to load all submissions that will be uploaded.
    useEffect(()=> {
        
        const loadSubmissions = async (running) => {

            const subs = await getSubmissionsToBeUpdated()
            
            setSubmissions(subs)
        };

        loadSubmissions(running);

    }, [])


    const handleSwitchChange = (e) => {
       // console.log("Setting running to", e.target.checked)
        setRunning(e.target.checked)
    }


    useEffect(()=> {

        if (running){
            console.log("Setting Interval")
            const t = setInterval( getNextSubmission, 500);
            setTimer(t)
        } else {
            console.log("Clearing Interval")
            clearInterval(timer);
            setTimer(null);
        }

    }, [running])


    
    useEffect (()=>{
        
        //console.log("Submission", submission);

        if (submission === null || submission === undefined)
            return

        //console.log("Getting Outcomes for Submission")

        const loadOutcomes = async () =>{
            
            const outcome = await fetchOutcomesForSubmisison(instance, accounts[0], loginRequest, {
                    submissionId: submission.id, 
                    classId: submission.classId, 
                    assignmentId: submission.assignmentId,
                    userId: submission.userId
                });

            // console.log("Fetched Outcome", outcome)

            if (outcome == undefined || outcome.length == 0)
            {
                console.log('No outcomes returned, exiting')
                return;   
            }
            
            // console.log("Writing Outcome to DB", outcome);

            const {data: writeData, error: writeError} = await supabase.from("Outcomes").upsert(outcome);

            writeError && console.error(writeError);


            const {data: updateData, error: updateError} = await supabase.from("Submissions")
                                                                        .update({"outcomeLastUpdated" : spacetime().format("iso")})
                                                                        .eq("id", submission.id);


            //updateError != undefined && console.error(updateError)
            //updateData != undefined && console.log(updateData)
            
            // setCount(prev => prev + 1)
        }

        loadOutcomes()
        setCount(prev => prev + 1)

    }, [submission])
    
    return <>
        { submissions && <h1>{submissions.length} remaining</h1> }
        { submission && <h3>{submission.id}</h3>}
        { /*<button onClick={getNextAssignment}>Next</button> */}
        <div >Running: <Switch onChange={handleSwitchChange} checked={running}></Switch></div>
        {/*<pre>{assignment && JSON.stringify(assignment, null, 2)}</pre>*/}
        
        <pre>{submissions && JSON.stringify(submissions, null, 2)}</pre>
        {/* < pre>{JSON.stringify(assignments, null, 2)}</pre>*/}
    </>
}


export default AdminOutcomesPage;