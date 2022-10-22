import {useState} from 'react'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import {supabase} from '../../../config/supabase';

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
                        assignment.map((a, i) => (
                            <div  key={i} className="titleBlock">
                            <div>
                            <HtmlTooltip
                               onOpen={handleOpen}
                                title={<>
                                        <Typography color="inherit">{a.assignmentTitle}</Typography>
                                        {tooltipText}
                                    </>}
                            >
                                <>
                                <Link href={`/assignment/${a.assignmentId}`} className="assignmentTitle">
                                    <span >{a.assignmentTitle}</span>
                                </Link>
                                <span>({a.dueDate.substring(0, 10)})</span>
                                </>
                            </HtmlTooltip>
                            </div>
                            <div>
                            
                                {a.hasRubric == "true" &&  <Link href={`/assignment/${a.assignmentId}`} >
                                    <img className="imageLink" width="30px" height="30px" src="/images/rubric-logo.png"/>
                                    </Link>
                                    } 
                            
                            <Link href={a.webUrl} target="_new">
                                <img className="imageLink" width="30px" height="30px" src="/images/teams-logo.png">
                                </img>
                            </Link>
                            </div>
                        </div>))
                    }
                </div>

            </div>
            <style jsx="true">{`

                    .titleBlock {
                        display: flex;
                        align-items: center;
                        width: 100%;
                        justify-content: space-between;
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

export default Assignment;