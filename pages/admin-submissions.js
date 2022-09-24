
import { useState } from 'react';
import { useEffect } from 'react';
import {supabase} from '../config/supabase';
import spacetime from 'spacetime';

import { fetchData } from '../libs/fetchData';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config';

import Switch from '@mui/material/Switch';

const threeWeeksAgo = spacetime()
                            .subtract(3, "weeks")
                            .weekStart("Sunday")
                            .startOf("weeks")
                            .format("iso");

const oneDayAgo = spacetime()
                            .subtract(1, "days")
                            .format("iso");


const neverUpdated = spacetime([2022, 0, 1]).format('iso');

const getAllAssignments = async () => {

    

    console.log(`Loading assignments since ${threeWeeksAgo} or ${neverUpdated}`)
    
    // we want to reprocess assignments for the last three weeks incase of changes to 
    // submissions
    const {data: assignments, error: assignmentsError} = await supabase
                .from("Assignments")
                .select("id, submissionLastUpdated, createdDateTime")
                .gt(`createdDateTime`, threeWeeksAgo)
                .lt(`submissionLastUpdated`, oneDayAgo)
                // .and(`createdDateTime.gt.${threeWeeksAgo},submissionLastUpdated.lt.${oneDayAgo}`)
                // .or(`createdDateTime.gt.${threeWeeksAgo},submissionLastUpdated.eq.${neverUpdated}` )

    assignmentsError != undefined && console.error(assignmentsError);
    
    return assignments
}

const fetchSubmissionsForAssignment = async (instance, account, loginRequest, ctx) => {

    const submissions = await fetchData(instance, account, loginRequest, {key: 'getSubmissions', ...ctx})

    return submissions.map(s => ({
        id: s.id,
        status: s.status,
        returnedDate: s.returnedDateTime,
        classId: ctx.classId, 
        submittedDate : s.submittedDateTime,
        assignmentId: ctx.assignmentId,
        userId: s.recipient.userId
    }));
    
}

const AdminSubmissionsPage = () => {

    const [assignments, setAssignments] = useState(null);
    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState(null);
    const [count, setCount] = useState(0)
    const [running, setRunning] = useState(false);
    const [timer, setTimer] = useState(null);

    const {instance, accounts} = useMsal()

    const getNextAssignment = async() => {
        
            
        const {data: assignment, error: assignmentError} = await supabase
                                .from("Assignments")
                                .select("id, classId, submissionLastUpdated")
                                //.eq('submissionLastUpdated', spacetime([2022, 0, 1]).format('iso'))
                                .gt(`createdDateTime`, threeWeeksAgo)
                                .lt(`submissionLastUpdated`, oneDayAgo)
                                // .or(`submissionLastUpdated.lt.${threeWeeksAgo},submissionLastUpdated.eq.${neverUpdated}` )
                                .limit(1)
                                .maybeSingle()


        assignmentError != undefined && console.error(assignmentError)

        setAssignment(assignment)

        if (assignmentError){
            setRunning(false)
        }

    }

    

    useEffect(()=> {
        
        const loadAssignments = async (running) => {

            const ass = await getAllAssignments()
            
            setAssignments(ass)
        };

        loadAssignments(running);

        

    }, [])


    const handleSwitchChange = (e) => {
        console.log("Setting running to", e.target.checked)
        setRunning(e.target.checked)
    }


    useEffect(()=> {

        if (running){
            console.log("Setting Interval")
            const t = setInterval( getNextAssignment, 2000);
            setTimer(t)
        } else {
            console.log("Clearing Interval")
            clearInterval(timer);
            setTimer(null);
        }

    }, [running])


    useEffect (()=>{
        console.log("Assignment", assignment)
        if (assignment === null || assignment === undefined)
            return

        console.log("Getting Submissions for assignment")

        const loadSubmission = async () =>{
            const subs = await fetchSubmissionsForAssignment(instance, accounts[0], loginRequest, {classId: assignment.classId, assignmentId: assignment.id});
            
            await subs.forEach(async (s) => {
                const {data, error } = await supabase.from('Submissions').upsert(s)
                error  != undefined && console.error(error)
            })

            console.log(`Upserted ${subs.length} submissions`)

            const {data: updateData, error: updateError} = await supabase.from("Assignments")
                                                                        .update({"submissionLastUpdated" : spacetime().format("iso")})
                                                                        .eq("id", assignment.id);


            updateError != undefined && console.error(updateError)
            updateData != undefined && console.log(updateData)

            // setCount(prev => prev + 1)
        }

        loadSubmission()
        setCount(prev => prev + 1)

    }, [assignment])

    return <>
        {assignments && <h1>{count} of {assignments.length}</h1>}
        <button onClick={getNextAssignment}>Next</button>
        <div onChange={handleSwitchChange} value={running}>Running: <Switch></Switch></div>
        <pre>{assignment && JSON.stringify(assignment, null, 2)}</pre>
        <pre>{submissions && JSON.stringify(submissions, null, 2)}</pre>
        <pre>{JSON.stringify(assignments, null, 2)}</pre>
    </>
}


export default AdminSubmissionsPage;