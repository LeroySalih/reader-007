import {useRouter} from 'next/router'
import { supabase } from '../../config/supabase';

import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { UndoRounded } from '@mui/icons-material';
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

const AssignmentPage = ({
        assignment, 
        //levels, 
        //criteria, 
        //rubricOutcomes, 
        //users, 
        classData, 
        shapedCriteria}) => {

    const router = useRouter();
    //console.log("Assignment", assignment)
    //console.log("levels", levels)  
    //console.log("criteria", criteria)
    //console.log("rubricOutcomes", rubricOutcomes)
    // console.log("groupedOutcomes", groupedOutcomes)
    //console.log("Users", users)
    ///onsole.log("classData", classData) 

    // const {assignmentId} = router.query 
    //if (!assignment)
     //   return <div>Loading</div>


    
   
    
    return <>
        <div className="pageLayout">
                <div className="assignmentTitle">{assignment.displayName}</div>
                <div className="classTitle">{classData.displayName}</div>
                <div>
                    {shapedCriteria && <div>
                        
                            {Object.values(shapedCriteria)
                                    .sort((a, b) => a.qualityDescription > b.qualityDescription ? 1 : -1)
                                    .map(quality => (
                                <div key={quality.id}  className="quality">
                                <div className="qualityDescription">{quality.qualityDescription}</div>
                                
                                <div className="criteriaContainer">
                                    {Object.values(quality.criteria).map((c, i) => <div key={i} className="criteriaDescription"><div>{c.criteriaDescription}</div> 
                                    <div>{c.users ? c.users.length : 0} pupil(s)</div></div>)}</div>
                                </div>
                            ))}
                        </div>}
                </div>
                
            
                
            
        </div>
        <style jsx="true">{`

                @import url('https://fonts.googleapis.com/css2?family=Oswald&family=Roboto:wght@300&display=swap');


                .assignmentTitle {
                    margin-top: 2rem;
                    font-family: 'Roboto', sans-serif;
                    font-size: 3rem;
                    padding-left: 2rem;
                    border-bottom: solid silver 1px;
                }

                .classTitle {
                    font-family: 'Roboto', sans-serif;
                    font-size: 2rem;
                    padding-left: 2rem;
                    margin-bottom: 3rem;
                }

                .quality {
                    
                }

                .qualityDescription {
                
                    font-family: 'Roboto', sans-serif;
                    font-size: 2rem;
                    padding-left: 2rem;
                    font-weight: bold;
                }

                .criteriaContainer{
                    display: flex;
                }


                .criteriaDescription {
                    width: 300px;
                    border: silver 1px solid;
                    margin: 1rem;
                    -webkit-border-radius: 1rem;
                    -moz-border-radius: 1rem;
                    border-radius: 1rem;
                    padding: 1rem;
                    font-family: "Oswald",sans-serif;
                    display: flex;
                    align-content: space-around;
                    flex-direction: column;
                    justify-content: space-between;
                    align-items: stretch;
                }
        
        `}
        </style>
    </>
}

export default AssignmentPage;


export async function getStaticPaths() {


    const {data, error} = await supabase.from('Assignments').select().eq("hasRubric", true);
    error != undefined && console.error("Assignments", error);
    const paths = data.map(a => {return {params: {assignmentId: a.id}}});
    //console.log(paths)
    return {
      paths,
      // paths: [{ params: { assignmentId: '5bd4eb36-ba95-48a3-aabc-12b5341d4209' } }
      fallback: false, // can also be true or 'blocking'
    }
  }

export async function getStaticProps(context) {

    const {assignmentId} = context.params;
    

    const {data: assignment, error} = await supabase.from('Assignments').select().eq('id', assignmentId).maybeSingle();
    error != undefined && console.error("Assignment Error", error);

    const {data: levels, error: levelsError} = await supabase.from('AssignmentRubricLevels').select().eq('assignmentId', assignmentId);
    levelsError != undefined && console.error("Error Levels", levelsError);

    const {data: criteria, error: criteriaError} = await supabase.from('AssignmentRubricQualityCriteria').select().eq('assignmentId', assignmentId);
    criteriaError != undefined && console.error("Error Levels", criteriaError);

    // console.log("assignmentId", assignmentId)
    const {data: rubricOutcomes, error: rubricError} = await supabase.from("RubricOutcomes").select().eq('assignmentId', assignmentId);
    rubricError != undefined && console.error("Rubric Error", rubricError);

    const {data: users, error: userError} = await supabase.from("Users").select()
    userError != undefined && console.error("User Error", users)

    const {data: classData, error: classError} = await supabase.from("Classes").select().eq("id", assignment.classId).maybeSingle()
    classError != undefined && console.error("Class Error", classError);


    // Shape criteria

    const shapedCriteria = {}

    for (const c of criteria){
        if (shapedCriteria[c.qualityId] === undefined) {
            shapedCriteria[c.qualityId] = {
                qualityId: c.qualityId, 
                qualityDescription: c.qualityDescription,
                userCount: 0, 
                criteria: {}}
        }

        shapedCriteria[c.qualityId].criteria[c.index] = {
            index: c.index, 
            criteriaDescription: c.description
        }
    }

    for (const ro of rubricOutcomes){
        if (ro.columnId != null){
            const index = levels.filter(l => l.levelId == ro.columnId)[0].index 

            if (shapedCriteria[ro.qualityId].criteria[index].users === undefined){
                shapedCriteria[ro.qualityId].criteria[index].users = []
            }

            shapedCriteria[ro.qualityId].userCount += 1
            shapedCriteria[ro.qualityId].criteria[index].users.push(ro.userId)
        }
        
    }
    
    return {
      props: {
         assignment, 
       // levels,
       // criteria,
       // rubricOutcomes,
       // users : users,
        classData, 
        shapedCriteria 
        }, 
    }
  }

