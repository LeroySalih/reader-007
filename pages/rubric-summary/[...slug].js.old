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

const AssignmentPage = ({assignment, levels, criteria, rubricOutcomes, groupedOutcomes, users, classData}) => {

    const router = useRouter();
    
    // const {assignmentId} = router.query 
    if (!assignment)
        return <div>Loading</div>


    const setBackgroundColor = (levelIndex, levels) => {
        if (levelIndex == 0)
            return 'green'
            
        if (levelIndex == (levels.length - 1))
            return 'red'
            
        return "yellow"
    }
   
   
    const userName = (users && Object.values(users)[0] && Object.values(users)[0].givenName || "Unknown Name") + (users && Object.values(users)[0] && Object.values(users)[0].surname || "")
    return <>
        <div className="pageLayout">
            <header>
                <h1>{classData && classData.displayName} :: <Link href={`/assignment/${assignment.id}`}><span>{assignment.displayName}</span></Link> </h1>
                <h2>For {userName}</h2> 
               
                <table width="100%" style={{marginBottom:"3rem"}}>
                    <tbody>
                        <tr>
                            <td>Description</td>
                            {
                                levels.map((l, i) => <td key={i}>{l.displayName}</td>)
                            }
                        </tr>
                        
                       
                        
                        {
                            Object.values(criteria).map((c, i) => 
                            
                            <tr key={i} >
                                {/* Get the QUality Description from the first item */}
                                <td className="description">{Object.values(criteria)[i][0].qualityDescription}</td>

                                {/* Loop through qualities for each row */}
                                {
                                    c.map((cell, i) => <td key={i} className={`level-detail ${cell.count == 0 ? 'green' : 'blank'}`}>
                                            <div className="level-pupil-details">
                                                <div className="level-pupil-details-description">{cell.description}</div> 
                                                <div className={`level-pupil-details-count `}>&nbsp;</div></div>
                                            </td>
                                            )

        
                                }
                                
                            </tr>
                            
                            )
                        }
                    </tbody>
                </table>

                
                
                
               


                <div className="pupilRubric">
                    <table>
                        <tbody>
                                    <tr>
                                         <th></th>   
                                         
                                         {
                                            Object.values(criteria)
                                                    .sort((a, b) => {
                                                         return a[0].qualityId > b[0].qualityId ? 1 : -1})
                                                    .map((c, i) => 
                                            <th key={i} className="pupilQualityHeader">
                                                <Tooltip title={c[0].qualityId}>
                                                    <span>{c[0].qualityDescription}</span>
                                                </Tooltip>
                                                {/* <div>{JSON.stringify(c[0].qualityId, null, 2)}</div> */}
                                            </th>)
                                         }
                                    </tr>
                    {groupedOutcomes && Object.values(groupedOutcomes).map((g,i) => (
                        
                            
                                    <tr key={i}>
                                        <td className="pupil">{users && users[g[0].userId] && `${users[g[0].userId].surname}, ${users[g[0].userId].givenName}`}</td>
                                        
                                        {
                                            g.sort((a, b) => a.qualityId > b.qualityId ? 1 : -1)
                                             .map((c,i) => <td key={c.qualityId}  >
                                                                <div className={`pupil-score ${setBackgroundColor(c.columnIndex, levels)}`}>&nbsp;</div>
                                                            </td>)
                                        }

                                    </tr>
                                
                       
                    ))
                    }
                        </tbody>
                    </table>
                            
                </div>
                
                
                
                
            </header>
        </div>
        <style jsx="true">{`

        .green {
            background: rgb(190,255,188);
background: linear-gradient(153deg, rgba(190,255,188,1) 0%, rgba(47,227,26,1) 61%);
        }
        .description {
            font-size: 0.9rem;
        }
        
        .pupilCount {
            text-align : right;
        }

        .level-detail {
            font-size : 0.8rem;
            border : silver solid 1px;
            height: 3rem;
            border-radius: 0.5rem;
            margin: 1rem;
            padding: 1rem;
            
        }

        .level-pupil-details {
            display: flex;
            flex-direction : row;
            justify-content:space-between;
        }


        .level-pupil-details-description {
            display: flex;
            flex-direction : row;
        }

        .level-pupil-details-count {
            display: flex;
            flex-direction : row;
            font-size: 2rem;
            padding-left: 1rem;
        }

        .pageLayout {
                width : 80vw;
                margin : auto;

            }

        header {
            border-bottom: solid 1px silver;
        }


        .pupilQualityHeader {
            color: black;
            font-size: 0.6rem;
        }

        pupilRubric {

        }


        .pupil{
            color: black;
            font-size: 0.6rem;
        }


        .pupil-score {
            color: black;
            font-size: 0.6rem;
            height: 1.4rem;
            border-radius : 1rem;;
        }

        .green {
            background-color : #3d9f1d;

        }

        .yellow {
            background-color : #e2e515;
        }

        .red {
            background-color : #ad2525;
        }

        .pill {

        }
        `}
        </style>
    </>
}

export default AssignmentPage;


export async function getStaticPaths() {


    const {data, error} = await supabase.from('RubricOutcomes').select()
    error != undefined && console.error("Assignments", error);
    const paths = data.map(a => {return {params: {slug: [a.assignmentId, a.userId]}}});
    
    return {
      paths,
      // paths: [{ params: { assignmentId: '5bd4eb36-ba95-48a3-aabc-12b5341d4209' } }
      fallback: false, // can also be true or 'blocking'
    }
  }

export async function getStaticProps(context) {

    
    const [assignmentId, userId] = context.params.slug;
    

    const {data: assignment, error} = await supabase.from('Assignments').select().eq('id', assignmentId).maybeSingle();
    error != undefined && console.error("Assignment Error", error);

    const {data: levels, error: levelsError} = await supabase.from('AssignmentRubricLevels').select().eq('assignmentId', assignmentId);
    levelsError != undefined && console.error("Error Levels", levelsError);

    const {data: criteria, error: criteriaError} = await supabase.from('AssignmentRubricQualityCriteria').select().eq('assignmentId', assignmentId);
    criteriaError != undefined && console.error("Error Levels", criteriaError);

    // restrict by userId
    const {data: rubricOutcomes, error: rubricError} = await supabase.from("RubricOutcomes").select().eq('assignmentId', assignmentId).eq("userId", userId);
    rubricError != undefined && console.error("Rubric Error", rubricError);

    const {data: users, error: userError} = await supabase.from("Users").select().eq("id", userId)
    userError != undefined && console.error("User Error", users)

    const {data: classData, error: classError} = await supabase.from("Classes").select().eq("id", assignment.classId).maybeSingle()
    classError != undefined && console.error("Class Error", classError);


    const translateQualityCriteria = (criteria) => {

        
        return criteria
        .sort((a, b) => a.index > b.index ? 1 : -1)
        .reduce((group, quality) => {
            const {qualityId} = quality;
            
            group[qualityId]= group[qualityId] ?? [];
            group[qualityId].push(quality);

            return group
        }, {});

    }

    const columnIdToIndex = (columnId) => {
        return columnId == null ? null : levels.findIndex(l => l.levelId == columnId)
    }

    const addCounts = (criteria, levels, rubricOutcomes) => {

        rubricOutcomes.forEach(ro => {
            if (criteria[ro.qualityId] === undefined) {
                console.error("Quality Id not found", ro.qualityId)

            } else {
                
                if (ro.columnId != null) {
                    const index = levels.map(l => l.levelId).indexOf(ro.columnId)
                    index == -1 && console.log("Not Found", ro.columnId) 

                    if (index != -1){
                        // Add Counts of times each column occures.
                        criteria[ro.qualityId][index]['count'] === undefined ? criteria[ro.qualityId][index]['count'] = 0 : criteria[ro.qualityId][index]['count'] = criteria[ro.qualityId][index]['count'] + 1;
                    }
                }
                
                // criteria[ro.qualityId]['levelId']['count'] = criteria[ro.qualityId]['l']['count'] || 0;
            }
            
        });

        return criteria
    }

    const groupedOutcomes = (rubricOutcomes, levels) => {
    //     return rubricOutcomes;
        return rubricOutcomes.reduce((group, outcome) => {
            group[outcome.userId] = group[outcome.userId] || [];
            group[outcome.userId].push(
                {   userId : outcome.userId, 
                    qualityId : outcome.qualityId, 
                    columnId : outcome.columnId,
                    columnIndex : columnIdToIndex(outcome.columnId)
                }) ;
            return group;
        }, {})
    }

    let qualityIds = Array.from(new Set( criteria.map(c => c.qualityId) ))
    
    const newCriteria = addCounts(translateQualityCriteria(criteria), levels, rubricOutcomes);

    const groupedUsers = users.reduce((group, user) => { group[user.id] = user; return group }, {})

    
    return {
      props: {
        assignment, 
        levels,
        criteria: newCriteria,
        // rubricOutcomes : rubricOutcomes,
        groupedOutcomes: groupedOutcomes(rubricOutcomes, levels), 
        users : groupedUsers,
        classData
        }, 
    }
  }

