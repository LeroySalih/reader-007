import { useEffect, useState } from 'react';
import {supabase} from '../config/supabase';

import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";

import { loginRequest } from "../config/index";
import { callMsGraph, getUrlFromContext, graphConfig, graphContext } from '../libs/callMsGraph';

import {Link} from 'next/link'
import {DeptClasses} from '../config/index';

import spacetime from "spacetime"

import { fetchData } from '../libs/fetchData';

const onlyMyClasses = (classData) => {
    // console.table(classData.sort((a, b) => a.displayName > b.displayName ? 1 : -1))
    
    return classData
            .filter(c => DeptClasses.includes(c.displayName))
            .sort((a, b) => a.displayName > b.displayName ? 1 : -1)
}






const fetchClassData = async (instance, account, loginRequest)  => {

    const classes = await fetchData(instance, account, loginRequest, {key: "getClasses"});

    return onlyMyClasses(classes);
}

const fetchMyAssignments = async (instance, account, loginRequest)  => {

    const assignments = await fetchData(instance, account, loginRequest, {key: "getAssignments"});

    return assignments.filter(a => a.createdDateTime > '2022-09-01');
}

const fetchAssignmentData = async (instance, account, loginRequest, ctx)  => {

    const assignments = await fetchData(instance, account, loginRequest, {key: "getAssignment", ...ctx});

    return assignments;
}

const fetchRubricData = async (instance, account, loginRequest)  => {

    const rubrics = await fetchData(instance, account, loginRequest, {key: "getRubrics"});

    return rubrics;
}

const fetchSubmissionsForAssignment = async (instance, account, loginRequest, ctx) => {

    const submissions = await fetchData(instance, account, loginRequest, {key: 'getSubmissions', ...ctx})

    //console.log("Submissions", submissions);

    return submissions.map(s => ({
        id: s.id,
        status: s.status,
        returnedDate: s.returnedDateTime,
        assignmentId: ctx.id,
        classId: ctx.classId, 
        submittedDate : s.submittedDateTime,
        userId: s.recipient.userId
    }));
    
}



const getFeedbackFromOutcome = (o) => {

    const outcome = o.filter(o => o['@odata.type'] === "#microsoft.graph.educationFeedbackOutcome") 

    return outcome && outcome[0] && outcome[0].feedback ? outcome[0].feedback.text : ''
    
}

const getPointsFromOutcome = (o) => {

    const outcome = o.filter(o => o['@odata.type'] === "#microsoft.graph.educationPointsOutcome") 

    return outcome && outcome[0] && outcome[0].points ? outcome[0].points.points : null;
    
}


  const getMaxPointsFromOutcome = (o) => {

    const outcome = o.filter(o => o['@odata.type'] === "#microsoft.graph.educationPointsOutcome") 

    console.log("Max Points", o);

    return outcome.length == 1 ? outcome[0].points.points : null;
    
  }


// Fetches the Outcomes for a submission and the consolidates to a single object.
const fetchOutcomeForSubmission = async (instance, account, loginRequest, ctx) => {

    //console.log("ctx", ctx)
    const o = await fetchData(instance, account, loginRequest, {key: 'getOutcomes', ...ctx})
    

    const result = {
        submissionId: ctx.submissionId,
        classId: ctx.classId,
        assignmentId: ctx.assignmentId,
        feedback : o !== undefined ? getFeedbackFromOutcome(o) : '',
        points : o != undefined ? getPointsFromOutcome(o) : 0,
        // maxPoints : getMaxPointsFromOutcome(o)
    }


    // console.log("Result", result);
    // console.log("mergedOutcomes",result)
    return result;

}




const sliceAssigment = (a) => {
  return {
    id: a.id,
    classId: a.classId,
    displayName: a.displayName, 
    webUrl: a.webUrl, 
    createdDateTime: a.createdDateTime,
    dueDateTime: a.dueDateTime,
    // submissionLastUpdated : spacetime([2020, 1, 1]).format('iso')
  }
}


const writeClassDataToDb = async (classData) => {

  //console.log("Writting Data to DB", classData)
  if (classData === null)
    return 

  

  const insertClasses = classData
                          .map(c => ({
                            id: c.id,
                            description :  c.description,
                            displayName :  c.displayName,
                            mailNickname : c.mailNickname
                          }));

  try{

    
      insertClasses.forEach(async (c) => {

        const {data, error} = await supabase
        .from("Classes")
        .upsert(c)

        data !== undefined && console.log("Data", data)
        error !== undefined && console.error("Error", error)
      })
      
    
  } catch(e) {
    console.error(e);
  }
  

}

const writeAssignmentDataToDb = async (assignmentData) => {


  //console.log("Writting Assignment Data to DB", assignmentData)
  if (assignmentData === null)
    return
    
  
    
    assignmentData.forEach(async (a) => {
      const {data, error} = await supabase
          .from("Assignments")
          .upsert(sliceAssigment(a))

     //     data !== undefined && console.log("Data", data)
     //     error !== undefined && console.error("Error", error)

    })
  
}

const writeRubricDataToDb = async (rubrics) => {
  if (rubrics === undefined)
    return;


  const writeRubrics = rubrics.map((r, i) => ({
    id: r.id,
    displayName: r.displayName,
    description: r.description.content,
    qualities: r.qualities,
    levels: r.levels
  }));

  writeRubrics.forEach(async (wr) => {

    const {data, error} = await supabase.from("Rubrics").upsert(wr);

    //data != undefined && console.log(data)
    error != undefined && console.error(error)

  })
}


const writeClassMemberToDb = async (cm, classId) => {
  
  const { data, error} = await supabase
  .from('ClassMembers')
  .upsert({classId: classId, userId: cm.id})
  // .insert([{ classId: classId, userId: cm.id}]);

  error != undefined && console.error(error)
  //console.log("Added User ", cm.id, " to ", classId);

}

const writeUserToDb = async (cm) => {
  
  const { data, error} = await supabase
  .from('Users')
  .upsert({
      id: cm.id, 
      givenName: cm.givenName,
      surname: cm.surname,
      email: cm.userPrincipalName
    })
  // .insert([{ classId: classId, userId: cm.id}]);

  error != undefined && console.error(error)
  //console.log("Added User", cm.id);

}

const writeClassMembersToDb = async (classsMemberData, classId) => {

  if (classsMemberData === null || classsMemberData.length == 0){
    return;
  }

  classsMemberData.forEach(async (cm) => {
    
    //console.log( "Writting ClassMember", cm);

    
    /*
    const {result: data, error} = await supabase.rpc('upsertmember', {
      iclassid: cm.classId,
      iuserid: cm.id,
      igivenname: cm.givenName,
      isurname: cm.surname,
      iemail: cm.email
    });
    */
    await writeClassMemberToDb(cm, classId);
    await writeUserToDb(cm);
  });

  
}

const writeSubmissionToDb = async(submission, classId, assignmentId) => {

    if (submission === undefined)
      return;

    const {data, error} = await supabase
        .from("Submissions")
        .upsert({
          id: submission.id,
          classId,
          assignmentId,
          status: submission.status,
          submittedDate: submission.submittedDateTime,
          returnedDate: submission.returnedDateTime
        });

      error != undefined && console.error(error)
      //console.log("Added Submission ", submission.id);
}


const writeSubmissionsToDb = async (submissions, classId, assignmentId) => {

  //console.log("Submission", submissions, classId, assignmentId);
  //console.table(submissions);
  submissions.forEach(async (s) => {
    await writeSubmissionToDb(s, classId, assignmentId)
  })
}




export default () => {

    const [classData, setClassData ] = useState(null);
   
    const { instance, accounts } = useMsal();

    const msgTypes = {
      "class" : "class",
      "assignment" : "assignment",
      "user" : "user",
      "submission" : "submission"
    }
    
    
    // Can be block loaded through the graph api!
    // also doesn't support the delta api, so we need to call all and only process most recent (by default)
    const loadClassData = async () => {
        //console.log("Loading Class Data")
        const result = await fetchClassData(instance, accounts[0])
        
        // result.forEach(t => pushItemToQueue(msgTypes.class,  {classId: t.id}));

        await writeClassDataToDb(result)
    }

    

    const loadAssignmentData = async () => {
        
        const {data: countUpdate, error:countError} = await supabase
                                        .from("Assignments")
                                        .select()
                                        .neq("id", 0)

        countError != undefined && console.error(countError)

      
        console.log("Fetching assignments")
        console.log(`There are currently ${countUpdate.length} assignments in the database.`)

        const result = await fetchMyAssignments(instance, accounts[0])
        console.log(`Fetched ${result.length} assignments from the database`)
              
        await writeAssignmentDataToDb(result)

        // Give the serve 1 sec to refresh
        setTimeout(async ()=> {

            const {data: checkUpdate, error:checkError} = await supabase
                                        .from("Assignments")
                                        .select()
                                        .eq("submissionLastUpdated", "2022-01-01 00:00:00")

            console.log(`Added ${checkUpdate.length} new assignments`)
            checkError != undefined && console.error(checkError)

        }, 1000)

        
        
    }


    const loadRubricData =async () => {
      //console.log("Loading Rubric Data")
      
      // remove existing rubrics
      await supabase.from("Rubrics").delete().neq("id", "0");

      // get rubrics from MS Graph
      const result = await fetchRubricData(instance, accounts[0])
      //result.forEach(r => pushItemToQueue("assignment", {classId: r.classId, assignmentId: r.id}))

      // console.table(result)
      // setClassData(result);
      writeRubricDataToDb(result)

      //enqueueSnackbar(`Loaded ${result.length} Rubrics`)
    }



    const getNextAssignmentForSubmissions = async () => {
        //get assignments
        const {data, error} = await supabase
                                    .from("Assignments")
                                    .select(`id, classId`)
                                    .order("submissionLastUpdated", { ascending: true, nullsFirst: true})
                                    .limit(1)
                                    .single()
        
        data!= undefined && console.table(data);
        error != undefined && console.error(error);

        return data;
    }

    const loadNextSubmissionsData = async () => {
    
        const nextAssignment = await getNextAssignmentForSubmissions();

        const submissions = fetchSubmissionsData(instance, accounts[0], loginRequest, nextAssignment);


    }


    const loadAssignment2 = async (classId, assignmentId) => {

        // fetch the assignment for id, assignmentId
        // fetch submissions for assignmentId, 
        // fetch the outcomes for each submission
        const assignment = await fetchAssignmentData(instance, accounts[0], loginRequest, {classId, assignmentId})

        //console.log("Assignment:", assignment);

        const submissions = await fetchSubmissionsForAssignment(instance, accounts[0], loginRequest, {classId, assignmentId})

        //console.log("Submissions", submissions)

        const outcomes = [];

        await submissions
                .filter(s => s.status != "working")
                .forEach(async (s) => {
            const o = await fetchOutcomeForSubmission (instance, accounts[0], loginRequest, {classId, assignmentId, submissionId : s.id});

            outcomes.push(o);
        });

        console.log("Outcomes", outcomes);


        // Update the db that this assignment has been calculated.
        const {error} = await supabase
            .from("Assignments")
            .update({submissionLastUpdated: spacetime().format("iso") })
            .match({id: assignment.id});

        error != undefined && console.error(error)

        return {
            assignment, submissions, outcomes
        }
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));

    const loadMyAssignments = async () => {

        console.log("Fetching all assignments")
        const assignments = await fetchMyAssignments(instance, accounts[0], loginRequest)

        console.log(`Loaded ${assignments.length} assignments` );

        [assignments[0]]
            .map(async (a,i) => {
                await delay(5000);
                console.log(`Processing ${i}`);
                const result = await loadAssignment2(a.classId, a.id);
                
                console.log(result);
        });



    }

    const loadAssignment3 = async () => {
        
        // get the next assignment to fetch
        const {data : assignment, error} = await supabase
                                .from("Assignments")
                                .select("id, classId")
                                .eq('submissionLastUpdated', spacetime([2020, 1, 1]).format('iso'))
                                .limit(1)
                                .maybeSingle();


        console.log(assignment);
        error != undefined && console.error(error)

        if (assignment != undefined){

            setIndex(assignment.id)

            // get the submissions for the assignment
            const submissions = await fetchSubmissionsForAssignment(
                    instance, 
                    accounts[0], 
                    loginRequest, 
                    {classId: assignment.classId, assignmentId: assignment.id}
                    )
            console.log("Submissions", submissions);
        }
        
        // get the outcomes for each submission 

        // update the fact that we've processed this assignment
        const {data: result, error: updateError} = await supabase
                                 .from("Assignments")
                                 .update({'submissionLastUpdated': spacetime().format('iso')})
                                 .match({id: assignment.id})
    
    }

    const resetAssignments = async () => {
        const {data: resetResult, error: resetError} = await supabase
                            .from("Assignments")
                            .update({'submissionLastUpdated' : spacetime([2020, 1, 1]).format('iso')})
                            .neq("id", 0)
    
        resetError != undefined && console.error(resetError);
    
    }

    const [index, setIndex] = useState(0)

    useEffect( ()=>{

        

 //       const timer = setInterval(loadAssignment3, 2000)

 //       return ()=> {
 //           clearInterval(timer);
 //       }
    }, []);


    return <>
        <h1>Admin Page {index}</h1>

        <UnauthenticatedTemplate>
          You must be signed in to access this page.
          
        </UnauthenticatedTemplate>
        <AuthenticatedTemplate>
            
            <button onClick={loadClassData}>Load Class Data</button>
            <button onClick={loadAssignmentData}>Load Assignment Data</button>
            <button onClick={() => resetAssignments()}>Reset Assignments Data</button>
            <button onClick={loadRubricData}>Load Rubric Data</button>
            <button onClick={loadNextSubmissionsData}>Load Submissions Data</button>
            
        </AuthenticatedTemplate>
        
    
    </>
}