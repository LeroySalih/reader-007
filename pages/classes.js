import {useEffect, useState} from 'react'
import { supabase }  from "../config/supabase"
import spacetime from 'spacetime';



const startOfWeek = (dt) => {
    return spacetime(dt)
    .weekStart("Sunday")
    .startOf('week')
    .format("yyyy-mmm-dd")
}

export const Classes =  () => {
    
    const [classAssignments, setClassAssignments] = useState([]);
    const [currentClass, setCurrentClass] = useState('')
    const [classAssignmentsByDate, setClassAssignmentsByDueDate] = useState(null);
    const [assignmentSubmissionCount, setAssignmentSubmissionCount] = useState(null);

    const allDueDates = (classAssignments) => {

        const allDates = classAssignments.reduce((prev, curr) => {
            
            prev[startOfWeek(curr["dueDate"])] = 0
    
            return prev
        }, {});
    
        return Object.keys(allDates).sort((a, b) => a < b ? 1 : -1)
    }

    const fetchClassAsignments = async () => {
        const {data, error} = await supabase
                                    .rpc("getclassassignments")

        error && console.error(error)
        // console.log("DATA", data);
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

    const getClassAssignmentsByClass = () => {
        return classAssignments.reduce((prev, curr) => {
            if (prev[curr.className] === undefined)
                prev[curr.className] = []
            
            prev[curr.className].push(curr)

            return prev
        }, {})
    }

    useEffect( ()=> {
        fetchClassAsignments()
        fetchAssignmentSubmissionCount();
    },
    [])

    useEffect ( ()=> {

        if (classAssignments === null || currentClass === null)
            return;

        const allDD = allDueDates(classAssignments);

        //console.log("AllDD", allDD);

        const result = {}

        allDD.forEach(dd => {
            //result[dd] = 1
            //console.log(currentClass, classAssignments.filter(ca => startOfWeek(ca["Due Date"]) == dd && ca.className == currentClass))

            result[dd] = classAssignments
                                .filter(ca => { 
                                    // console.log("Start of Week", startOfWeek(ca["dueDate"]), dd, ca.className, currentClass)
                                    return startOfWeek(ca["dueDate"]) == dd && ca.className == currentClass
                                }
                                
                                )
            
        });

        console.log("Result", result);
        setClassAssignmentsByDueDate(result);

    }, [classAssignments, currentClass])

    return <>
            <div className="pageHeader">
                <h1>Classes ({currentClass})</h1>
                <div>{assignmentSubmissionCount && assignmentSubmissionCount.length} assignment data</div>
                <select onChange={(e) => setCurrentClass(e.target.value)} value={currentClass    }>
                    {getClasses().map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
            
            </div>
            
            
            {
                classAssignmentsByDate && 
                    
                        <AssignmentsForClass   assignments={classAssignmentsByDate} asc={assignmentSubmissionCount}/>
                    
                
            }

           
            </>
}


const Assignment = ({assignment, week}) => {
    console.log("Assignment", assignment)
    return <><div className="display">
                <div className="weekTitle">{week}</div>
                
                <div>
                    {
                        assignment.map(a => (<div>{a.assignmentTitle}</div>))
                    }
                </div>

            </div>
            <style jsx="true">{`

                    
                    .weekTitle {
                        font-weight : 800;
                        padding-right: 2rem;
                    }

                    .display {
                        display :flex;
                        flex-direction : row;
                        border: solid 1px silver;
                        margin: 2rem;
                        padding: 1rem;
                        border-radius: 1rem;
                        box-shadow: 0px 10px 10px #c0c0c0;
                    }

            `}
            </style>
            </>
}


const AssignmentsForClass = ({assignments, asc}) => {
    console.log("Object.values(assignments)", Object.values(assignments))
    return  <>
                Assignments
                <div>{Object.keys(assignments).map((a, i) => <Assignment key={i} week={a} assignment={assignments[a]}/>)}</div>
                <style jsx="true">{`

                    .assignment-card {
                        border: silver 1px solid;
                    }

                `}</style>
            </>
}

/*

const AssignmentsForClass = ({assignments, asc}) => {
   // console.log("week", week)
   // console.log("assignments", assignments)
   // console.log("asc", asc)

   const week = "not set"
   console.log("Assignments", assignments)
    return <>
        <div className="assignmentCard">
            
        <table>
            <tbody>
                <tr>
                    <td className="week">{week}</td>
                    <td className="assignmentTitleCell">
                        {
                            Object.keys(assignments)
                                .filter(a => assignments[a]["dueWeek"] == week)
                                .map((a,i) => (
                                <div key={i} className="assignmentTitle">
                                        
                                       <a href={assignments[a]["webUrl"]} target="_new">{assignments[a]["assignmentTitle"]}</a> 
                                       {/* Display Assignment Status Count}
                                       <div>
                                            <span>{
                                                    asc && asc.filter(item => item.assignmentId == assignments[a]["assignmentId"])
                                                              .map((item,i) => <span key={i}>{item.status}:{item.count}</span>)
                                                  }</span>
                                       </div>
                                       
                                       
                                </div>
                            ))
                        } 
                        </td>
                </tr>
   
            </tbody>
        </table>
        </div>
        <style jsx="true"> {`
            .pageHeader {
                display: flex;
                justify-content: space-between;
            }

            .assignmentCard {
                background-color: white;
                border: solid 1px silver;
                margin: 2rem;
                padding: 1rem;
                border-radius: 1rem;
                box-shadow: 0px 10px 10px #e0e0e0;
            }

           .week {
                color: #584a4a;
                font-weight: 600;
                /* margin-right: 4rem; 
            }

            .assignmentTitle {
                color: black;
                padding-left: 1rem;
            }

            .assignmentTitleCell {
                background-color: white;
            }
        `}
        </style>
    </>
}

*/


export default Classes;