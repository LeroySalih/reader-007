import {useEffect, useState} from 'react'
import { supabase }  from "../config/supabase"


import { dueWeek, dueWeekFromISO, workWeekFromISO } from '../libs/spacetime';
import AssignmentsForClass from '../components/sows/AssignmentsForClass';


export const Classes =  () => {
    
    const [classAssignments, setClassAssignments] = useState([]);
    const [currentClass, setCurrentClass] = useState('')
    const [classAssignmentsByDate, setClassAssignmentsByDueDate] = useState(null);
    const [assignmentSubmissionCount, setAssignmentSubmissionCount] = useState(null);

    const allDueDates = (classAssignments) => {

        const allDates = classAssignments.reduce((prev, curr) => {
            
            prev[dueWeekFromISO(curr["dueDate"]).toISODate()] = 0
    
            return prev
        }, {});
    
        return Object.keys(allDates).sort((a, b) => a < b ? 1 : -1)
    }

    const fetchClassAsignments = async () => {
        const {data, error} = await supabase
                                    .rpc("getclassassignments")

        error && console.error(error)
        
        setClassAssignments(data)
        setCurrentClass(data[0].className)

        return data
    }

    const fetchAssignmentSubmissionCount = async () => {
        const {data, error} = await supabase.rpc("getassignmentsubmissioncount")

        error != undefined && console.error(error);

        setAssignmentSubmissionCount(data);

    }

    const getClasses = () => {

        const classesObject = classAssignments.reduce((prev, curr) => {
            prev[curr.className] = 1
            return prev
        }, {})

        return Object.keys(classesObject).sort((a, b) => a > b ? 1 : -1)
    }

    /*
    const getClassAssignmentsByClass = () => {
        return classAssignments.reduce((prev, curr) => {
            if (prev[curr.className] === undefined)
                prev[curr.className] = []
            
            prev[curr.className].push(curr)

            return prev
        }, {})
    }
    */

    useEffect( ()=> {
        fetchClassAsignments()
        fetchAssignmentSubmissionCount();
    },
    [])

    useEffect ( ()=> {

        if (classAssignments === null || currentClass === null)
            return;

        const allDD = allDueDates(classAssignments);

       

        const result = {}

        allDD.forEach(dd => {
            //result[dd] = 1
            
            result[dd] = classAssignments
                                .filter(ca => { 
                                    return workWeekFromISO(ca["dueDate"]).toISODate() == dd && ca.className == currentClass
                                }
                                
                                )
            
        });

     
        setClassAssignmentsByDueDate(result);

    }, [classAssignments, currentClass])

    return <>
            <div className="pageHeader">

                <h1>Scheme of Work for  
                    <select onChange={(e) => setCurrentClass(e.target.value)} className="class-selector" value={currentClass }>
                        {getClasses().sort((a, b) => a > b ? 1 : -1).map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                </h1>
            </div>
            
            {
                classAssignmentsByDate && 
                <AssignmentsForClass  
                    assignments={classAssignmentsByDate} 
                    asc={assignmentSubmissionCount}/>
            }

            <style jsx="true">
                {`
                   .class-selector {
                        margin-left: 2rem;
                        padding: 1rem;
                        font-size: 1.5rem;
                        font-weight: 800;
                        border: none;
                    }

                    .class-selector:focus {
                        border: none
                    }

                    .pageHeader {
                       
                        margin: 2rem;
                        border-bottom: solid 1px silver;
                    }
                `}
            </style>
           
            </>
}


export default Classes;