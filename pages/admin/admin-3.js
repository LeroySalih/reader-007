
import Button from '@mui/material/Button';
import { fetchData } from '../../libs/fetchData';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { loginRequest } from '../../config';
import { supabase } from '../../config/supabase';

import { cleanDb, cleanTable, cleanAssignmentFromDb, processAssignment, processSingleAssignment } from '../../libs/admin';
import { v4 as uuidv4 } from 'uuid';
import {useState} from 'react'
import { CountertopsOutlined, Star } from '@mui/icons-material';
import {DateTime, Interval} from 'luxon';








const Admin3 = () => {

    const { instance, accounts } = useMsal();
    const [message, setMessage] = useState('')

    


    

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


    const processAllMyAssignments = async () => {
        const start = DateTime.now()

        console.clear();
        

        setMessage(`Clearing Db`)
        await cleanDb();

        const cases= await fetchMyAssignments(instance, accounts[0], loginRequest);

        console.log(cases)
        
        

        const index = 0
        for (const c of cases){
            index += 1
            setMessage(`processing ${index} of ${cases.length}`)
            console.log("%c Processing", c.displayName)
            await processAssignment(c.classId, c.id, {instance, account: accounts[0], loginRequest})

            
        }
        

        console.log("Test Data Processed")
        const end = DateTime.now()
        const {minutes, seconds} = Interval.fromDateTimes(start, end).toDuration(['minutes', 'seconds']).toObject()
        setMessage(`Completed ${index } assignments in ${minutes}: ${seconds}`)



    }

    const processNewAssignments = async () => {
        
        const start = DateTime.now()

        console.clear();
        
        // setMessage(`Clearing Db`)
        // await cleanDb();
        setMessage('Getting Assignments')

        const cases= await fetchMyAssignments(instance, accounts[0], loginRequest);

        const {data: assignmentsInDb, error: assignmentInDbError} = await supabase.from('Assignments').select();

        const assignentIds = assignmentsInDb.map(a => a.id);

        const filteredCases = cases.filter(c => assignentIds.includes(c.id) == false);

        console.log(`Assignments filtered from ${cases.length} to ${filteredCases.length}`);
        

        const index = 0
        for (const c of filteredCases){
            index += 1
            setMessage(`processing ${index} of ${filteredCases.length}`)
            console.log(`%c Processing ${c.displayName}`, "color: green; font-size: 2rem;")
            await processAssignment(c.classId, c.id, {instance, account: accounts[0], loginRequest});
        }
        

        console.log("Filtered Data Processed")
        const end = DateTime.now()
        const {minutes, seconds} = Interval.fromDateTimes(start, end).toDuration(['minutes', 'seconds']).toObject()
        setMessage(`Completed ${index } assignments in ${minutes}: ${seconds}`)



    }


    const testData = async () => {
        
        const start = DateTime.now()

        console.clear();
        

        setMessage(`Clearing Db`)
        await cleanDb();

        const cases= [
            {label: 'Has Rubric', classId: "624c8699-6e85-40ba-99dd-b750bd821add", assignmentId: "e5994e3f-bcdd-410d-821e-076e7a42bcc2"},
            {label: 'Has No Rubric', classId: "6dd9d864-caed-4905-845c-8bd7a8bdb957", assignmentId: "c7a482e8-9fe1-47dc-835a-348a4547bb63"}
        ]

        const index = 0
        for (const c of cases){
            index += 1
            setMessage(`processing ${index} of ${cases.length}`)
            console.log("Testing", c.label)
            await processAssignment(c.classId, c.assignmentId, {instance, account: account[0], loginRequest})

            
        }

        console.log("Test Data Processed")
        const end = DateTime.now()
        const {minutes, seconds} = Interval.fromDateTimes(start, end).toDuration(['minutes', 'seconds']).toObject()
        setMessage(`Completed ${index } assignments in ${minutes}: ${seconds}`)

    }
    return <>
        <h1>Admin (3)</h1>
        <div className="button-panel">
        <Button onClick={testData}>Process Test Data</Button>
        <Button onClick={processAllMyAssignments}>Process All Assignments</Button>
        <Button onClick={processNewAssignments}>Process New Assignments</Button>
        <Button onClick={() => processSingleAssignment("f9a0bf0d-d316-492c-a4c3-4c81b2afcab2", {instance, account: accounts[0], loginRequest})}>Update Single Assignment</Button>

        </div>
    <div>{message}</div>
    <style jsx="true">
        {`
            .button-panel {
                display: flex;
                flex-direction: column;
                align-content: flex-start;
                align-items: flex-start;
            }
        `}
    </style>
    </>
}

export default Admin3