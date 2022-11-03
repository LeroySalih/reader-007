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

const fetchClasses = async (instance, account, loginRequest)  => {

    const classes = await fetchData(instance, account, loginRequest, {key: "getClasses"});

    return onlyMyClasses(classes);
}

const fetchMyAssignments = async (instance, account, loginRequest)  => {

  try {
    const assignments = (await fetchData(instance, account, loginRequest, {key: "getAssignments"})) || [];

    console.log(`Fetched ${assignments.length} Assignments from Graph`)

    return assignments.filter(a => a.createdDateTime > '2022-09-01');
    
  } catch(e) {
    console.error("fetchMyAssignments", e)
    return null;
  }
    
}

const fetchRubricsForAssignment = async (instance, account, loginRequest, ctx) => {
    
    try{

        const assignmentRubrics = await fetchData(instance, account, loginRequest, 
            {
                key: "getAssignmentRubrics", 
                classId: ctx.classId, 
                assignmentId: ctx.assignmentId
            }
            );

        return assignmentRubrics.hasOwnProperty('error') ? null : assignmentRubrics
    } catch(e)
    {
        return null;
    }

}

/*
const fetchAssignmentData = async (instance, account, loginRequest, ctx)  => {

    const assignments = await fetchData(instance, account, loginRequest, {key: "getAssignment", ...ctx});

    return assignments;
}
*/

const fetchClassMembersForClass = async (instance, account, loginRequest, ctx) => {

    
    const cm = await fetchData(instance, account, loginRequest, {key: "getClassMembers", classId: ctx.classId});

    return cm.map(c => {return {...c, classId: ctx.classId}});
}

const fetchRubricData = async (instance, account, loginRequest)  => {

    const rubrics = await fetchData(instance, account, loginRequest, {key: "getRubrics"});

    return rubrics;
}

const fetchSubmissionsForAssignment = async (instance, account, loginRequest, ctx) => {

    const submissions = await fetchData(instance, account, loginRequest, {key: 'getSubmissions', ...ctx})

    

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

  

  return outcome.length == 1 ? outcome[0].points.points : null;
  
}


// Fetches the Outcomes for a submission and the consolidates to a single object.
const fetchOutcomeForSubmission = async (instance, account, loginRequest, ctx) => {

    
    const o = await fetchData(instance, account, loginRequest, {key: 'getOutcomes', ...ctx})
    

    const result = {
        submissionId: ctx.submissionId,
        classId: ctx.classId,
        assignmentId: ctx.assignmentId,
        feedback : o !== undefined ? getFeedbackFromOutcome(o) : '',
        points : o != undefined ? getPointsFromOutcome(o) : 0,
        // maxPoints : getMaxPointsFromOutcome(o)
    }


    
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

       // data !== undefined && console.log("Data", data)
        error !== undefined && console.error("Error", error)
      })
      
    
  } catch(e) {
    console.error(e);
  }
  

}

const writeAssignmentDataToDb = async (assignmentData) => {


  
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
  

}

const writeClassMembersToDb = async (classsMemberData, classId) => {

  if (classsMemberData === null || classsMemberData.length == 0){
    return;
  }

  classsMemberData.forEach(async (cm) => {
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
      
}


const AdminPage = () => {

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
        
        const result = await fetchClasses(instance, accounts[0], loginRequest)
        
        
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

        console.log(`Result`, result)
        for (const r of result){

            const rubricResult = await fetchRubricsForAssignment(instance, accounts[0], loginRequest, {classId: r.classId, assignmentId:r.id});

            if (rubricResult != null){
                console.log("Writing Rubric Levels for Assignment", r.id);

                
                for (const index = 0; index < rubricResult.levels.length; index++) {
                    
                    const level = rubricResult.levels[index];
                    // Write the rubric levels
                    console.log("Level", level)
                    const {data:writeLevelData, error: writeLevelError} = await supabase.from("AssignmentRubricLevels")
                                                                                        .upsert({   assignmentId: r.id,
                                                                                                    levelId: level.levelId,
                                                                                                    index,
                                                                                                    displayName: level.displayName
                                                                                        });

                    writeLevelError != undefined && console.error("Error", writeLevelError);

                    const {data: updateData, error: updateError} = await supabase.from("Assignments")
                                                                                 .update({"hasRubric": true})
                                                                                 .eq("id", r.id);

                    updateError != undefined && console.error("Update Error", updateError)

                }

                console.log("Writing Rubric Qualities for Assignment", r.id);
            
                for (const index = 0; index < rubricResult.qualities.length; index++) {
                    
                    const quality = rubricResult.qualities[index];
                    // Write the rubric quality
                    
                    
                    for (var criteriaIndex = 0; criteriaIndex < quality.criteria.length; criteriaIndex++){
                        const criteria = quality.criteria[criteriaIndex]
                        console.log("Quality Criteria", criteria)

                        const {data:writeQualityData, error: writeQualityError} = await supabase.from("AssignmentRubricQualityCriteria")
                                                                                        .upsert({   assignmentId: r.id,
                                                                                                    qualityId: quality.qualityId,
                                                                                                    index: criteriaIndex,
                                                                                                    description: criteria.description.content,
                                                                                                    qualityDescription: quality.description.content
                                                                                        });

                        writeQualityError != undefined && console.error("Error", writeQualityError);
                    
                    }
                    /*
                    */
                }
            }
            
        
            // 0.5 sec delay to account for throttling
            await new Promise(r => setTimeout(r, 1000));
        }
        
        

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

    const loadClassMembers = async () => {

        const {data: classes, error: classesError} = await supabase.from("Classes").select();
        const {data: currentUsers, error: usersError} = await supabase.from("Users").select();

        const userIds = currentUsers.map(u => u.id);

        let allClasses = []


        for (const c of classes) {

            console.log("Getting members for", c.displayName)
            const cm = await fetchClassMembersForClass(instance, accounts[0], loginRequest, {classId: c.id});

            
            allClasses = allClasses.concat(cm);

        }

    
        console.log("All ClassMembers", allClasses);

        console.log("Writing Class Members")
        
        
        for (const c of allClasses){

            console.log("Upserting to ClassMember", {userId: c.id, classId:c.classId, ...c});

            const {data: classMemberWrite, erorr: classMemberError} = await supabase.from("ClassMembers").upsert({
            userId: c.id, 
            classId:c.classId});

            classMemberError !== undefined && console.error(classMemberError); 

            if (!userIds.includes(c.id)){
                const {data: userWrite, erorr: userError} = await supabase.from("Users").upsert(
                    {
                        id:         c.id, 
                        givenName:  c.givenName,
                        surname:    c.surname,
                        email:      c.userPrincipalName
                    }
                    );
    
                userError !== undefined && console.error(userError);
            } else {
                console.log("Skipping ", c.surname)
            }
            
    
        }

        
    

       






       
    }

    const resetAssignments = async () => {
        const {data: resetResult, error: resetError} = await supabase
                            .from("Assignments")
                            .update({'submissionLastUpdated' : spacetime([2020, 1, 1]).format('iso')})
                            .neq("id", 0)
    
        resetError != undefined && console.error(resetError);
    
    }

    const [index, setIndex] = useState(0)

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
            
            <button onClick={loadClassMembers}>Load Class Members</button>
            
        </AuthenticatedTemplate>

    </>
}

export default AdminPage;