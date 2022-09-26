import {useEffect, useState} from 'react'
import { supabase }  from "../config/supabase"
import spacetime from 'spacetime';
import Typography from '@mui/material/Typography';

import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';


import { styled } from '@mui/material/styles';

const LightTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.white,
      color: 'rgba(0, 0, 0, 0.87)',
      boxShadow: theme.shadows[1],
      fontSize: 11,
    },
  }));
  


const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 220,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
    },
  }));


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

                <h1>Scheme of Work for  
                    <select onChange={(e) => setCurrentClass(e.target.value)} className="class-selector" value={currentClass }>
                        {getClasses().map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                </h1>
                
                
            
            </div>
            
            
            {
                classAssignmentsByDate && 
                    
                        <AssignmentsForClass   assignments={classAssignmentsByDate} asc={assignmentSubmissionCount}/>
                    
                
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


const Assignment = ({assignment, week}) => {
    

    const [counter, setCounter] = useState(0);
    const [tooltipText, setTooltipText] = useState('')

    const handleOpen = async () => {
        const {data, error} = await supabase.from("Assignments").select().eq("id", assignment[0].assignmentId)

        data != undefined && console.log("data", data)
        error != undefined && console.log("Assignemnt", assignment[0]);

        setCounter(prev => prev + 1)
        setTooltipText(data[0]["dueDateTime"])
    }

    const handleClose = async () => {
        setTooltipText('')
    }

    return <><div className="display">
                <div className="weekTitle">{week}</div>
                
                <div>
                    {
                        assignment.map(a => (<div>
                            <HtmlTooltip
                                onOpen={handleOpen}
                                title={
                                <>
                                    <Typography color="inherit">{a.assignmentTitle}</Typography>
                                    {
                                        tooltipText
                                    }
                                </>
                                }
                            >
                                
                                <a href={a.webUrl} className="assignmentTitle">{a.assignmentTitle}</a>
                            </HtmlTooltip>
                            
                            </div>))
                    }
                </div>

            </div>
            <style jsx="true">{`

                    .assignmentTitle {
                        pointer : cursor;
                    }
                    
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