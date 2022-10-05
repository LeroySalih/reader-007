import {useEffect, useState} from 'react'
import { supabase }  from "../config/supabase"
import spacetime from 'spacetime';
import Typography from '@mui/material/Typography';

import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';


import { styled } from '@mui/material/styles';
import Image from 'next/image';
import Link from 'next/link';

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

       

        const result = {}

        allDD.forEach(dd => {
            //result[dd] = 1
            
            result[dd] = classAssignments
                                .filter(ca => { 
                                    return startOfWeek(ca["dueDate"]) == dd && ca.className == currentClass
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

     //   data != undefined && console.log("data", data)
        error != undefined && console.error("Assignemnt", assignment[0], error);

        setCounter(prev => prev + 1)
        setTooltipText(data[0]["dueDateTime"])
    }

    const handleClose = async () => {
        setTooltipText('')
    }

    return <><div className="display">
                <div className="weekTitle">{week}</div>
                
                <div style={{width: "80%"}}>
                    {
                        assignment.map((a, i) => (<div  key={i} className="titleBlock">
                            <HtmlTooltip
                               onOpen={handleOpen}
                                title={<>
                                        <Typography color="inherit">{a.assignmentTitle}</Typography>
                                        {tooltipText}
                                    </>}
                            >
                                
                                <Link href={`/assignment/${a.assignmentId}`} className="assignmentTitle">
                                    <span style={{width:"100%"}}>{a.assignmentTitle}</span>
                                </Link>
                               
                            </HtmlTooltip>

                            
                                {a.hasRubric == "true" &&  <Link href={`/assignment/${a.assignmentId}`} >
                                    <img className="imageLink" width="30px" height="30px" src="/images/rubric-logo.png"/>
                                    </Link>
                                    } 
                            
                            <Link href={a.webUrl} target="_new">
                                <img className="imageLink" width="30px" height="30px" src="/images/teams-logo.png">
                                </img>
                            </Link>
                        </div>))
                    }
                </div>

            </div>
            <style jsx="true">{`

                    .titleBlock {
                        display: flex;
                        align-items: center;
                        width: 100%;
                    }

                    .imageLink {
                        cursor: pointer;
                        margin-left: 2rem;
                        filter: saturate(0%);
                        opacity: 30%
                        
                    }

                    .imageLink:hover {
                        cursor: pointer;
                        margin-left: 2rem;
                        border: silver 1px solid;
                        border-radius : 25%;
                        filter: saturate(100%);
                        opacity: 100%;
                        
                    }

                    .assignmentTitle {
                        pointer : cursor;
                    }
                    
                    .weekTitle {
                        font-weight : 800;
                        padding-right: 2rem;
                        display: flex;
                        align-items: center;
                    }

                    .display {
                        display :flex;
                        flex-direction : row;
                        border: solid 1px silver;
                        margin: 2rem;
                        padding: 1rem;
                        border-radius: 1rem;
                        box-shadow: 0px 10px 10px #c0c0c0;
                        width: 80%;
                    }

            `}
            </style>
            </>
}


const AssignmentsForClass = ({assignments, asc}) => {
    
    return  <>
                
                <div>{Object.keys(assignments).map((a, i) => <Assignment key={i} week={a} assignment={assignments[a]}/>)}</div>
                <style jsx="true">{`

                    .assignment-card {
                        border: silver 1px solid;
                    }

                `}</style>
            </>
}




export default Classes;