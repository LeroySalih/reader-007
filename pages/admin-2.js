import Switch from "@mui/material/Switch";
import {useEffect, useState} from 'react';
import { fetchData } from '../libs/fetchData';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { DateTime } from "luxon";

import { loginRequest } from "../config/index";
import { supabase } from "../config/supabase";

const Admin2 = () => {
    const [enabled, setEnabled] = useState(true);
    const [allAssignments, setAllAssignments] = useState(true);

    const [fetching, setFetching] = useState('');

    const [assignments, setAssignments] = useState([]);

    const { instance, accounts } = useMsal();

    const writeAssignment = async (assignment) => {

        const {data, error} = await supabase
          .from("Assignments")
          .upsert(sliceAssigment(assignment))
        
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

    const fetchMyAssignments = async (instance, account, loginRequest)  => {

        try {
          setFetching('assignments')
          const assignments = (await fetchData(instance, account, loginRequest, {key: "getAssignments"})) || [];
      
          console.log(`Fetched ${assignments.length} Assignments from Graph`)
      
          setFetching('')
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

    useEffect(()=> {


        const getData = async () => {
            const result = await fetchMyAssignments(instance, accounts[0])
            setAssignments(result);
        }
        
        getData();

    },[]);


    useEffect(()=> {

        let filteredAssignments = [];

        if (allAssignments) {
            console.log("Processing all assignments")
            filteredAssignments = assignments
        } else {
            console.log("Processing last 30 days assignments")
            filteredAssignments = assignments.filter(a => DateTime.fromISO(a.createdDateTime) >= DateTime.now().minus({days: 30}));
            console.log(`Processing ${filteredAssignments.length} of ${assignments.length}`);
        }

        for (const assignment of filteredAssignments){

            console.log("Writing Assignment")
            writeAssignment(assignment);

            console.log(`Writing rubric for ${assignment.id}`);
            setFetching(`Rubric for ${assignment.id}`);
            const rubricResult = fetchRubricsForAssignment(instance, accounts[0], loginRequest, {classId: assignment.classId, assignmentId:assignment.id});

        }



    }, [assignments, allAssignments])

    return <>
        <div className="app">
            <h1>Admin 2</h1>
            <div className="stages">
                <div className="stage">
                    <div className="title">Assignments</div>
                    <div className="progress">Progress</div>
                    <div className="options">
                        30 Days<Switch checked={allAssignments} onChange={(e) => setAllAssignments(e.target.checked)}/>All
                    </div>
                </div>
                <div className="stage">
                    <div className="title">Submissions</div>
                    <div className="progress">Progress</div>
                    <div className="options">Options</div>
                </div>
                <div className="stage">
                    <div className="title">Outcomes</div>
                    <div className="progress">Progress</div>
                    <div className="options">Options</div>
                </div>
            </div>
            <div>
                
                <pre>{JSON.stringify({allAssignments}, null, 2)}</pre>
                <pre>{JSON.stringify({fetching}, null, 2)}</pre>
                <pre>{JSON.stringify({assignmentCount: assignments && assignments.length}, null, 2)}</pre>
            </div>
        </div>
        
        <style jsx="true">{`
            .app {
                width: 80vw;
                margin: auto;
            }


            .stages {
                display: flex;
                justify-content: space-around
            }

            .stage {
                border : silver 1px solid;
                width : 200px;
                height: 100px;
                border-radius: 1rem;
                padding: 1rem;
            }

            .title {
                border-bottom: solid silver 1px;
            }
        `}</style>
        </>
}


export default Admin2;