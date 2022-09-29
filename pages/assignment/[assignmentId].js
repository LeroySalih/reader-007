import {useRouter} from 'next/router'
import { supabase } from '../../config/supabase';


const AssignmentPage = ({assignment, levels, criteria, rubricOutcomes}) => {

    const router = useRouter();
    
    // const {assignmentId} = router.query 

    console.log("Assignment", assignment);

    if (!assignment)
        return <div>Loading</div>


    

   

    return <>
        <div className="pageLayout">
            <header>
                <h1>Assignment {assignment.displayName}</h1> 
                <table>
                    <tbody>
                        <tr>
                            <td>Description</td>
                            {
                                levels.map((l, i) => <td key={i}>{l.displayName}</td>)
                            }
                        </tr>
                        <tr>
                            <td></td>
                            {
                                levels.map((l, i) => <td key={i}>{l.levelId}</td>)
                            }
                        </tr>
                       
                        {
                            Object.values(criteria).map((c, i) => 
                            
                            <tr key={i}>
                                <td>{Object.values(criteria)[0][0].qualityDescription}</td>
                                {Object.values(criteria)[0].map((c, i) => <td key={i}>{c.description}({c.count})</td>)}
                            </tr>
                            
                            )
                        }
                        
        
                    </tbody>
                </table>


                

                <h1>Assignment Rubric Information</h1>
                <pre>{JSON.stringify(criteria, null, 2)}</pre>
                
                <h1>Levels Information</h1>
                <pre>{JSON.stringify(levels, null, 2)}</pre>

                {rubricOutcomes && <h1>Outcome Information{rubricOutcomes.length}</h1>}
                <pre>{JSON.stringify(rubricOutcomes, null, 2)}</pre>
                
                
                
            </header>
        </div>
        <style jsx="true">{`
        
        .pageLayout {
                width : 80vw;
                margin : auto;

            }

        header {
            border-bottom: solid 1px silver;
        }

        `}
        </style>
    </>
}

export default AssignmentPage;

export async function getServerSideProps(context) {

    const {assignmentId} = context.query;

    const {data: assignment, error} = await supabase.from('Assignments').select().eq('id', assignmentId).maybeSingle();
    error != undefined && console.error("Assignment Error", error);

    const {data: levels, error: levelsError} = await supabase.from('AssignmentRubricLevels').select().eq('assignmentId', assignmentId);
    levelsError != undefined && console.error("Error Levels", levelsError);

    const {data: criteria, error: criteriaError} = await supabase.from('AssignmentRubricQualityCriteria').select().eq('assignmentId', assignmentId);
    criteriaError != undefined && console.error("Error Levels", criteriaError);

    const {data: rubricOutcomes, error: rubricError} = await supabase.from("RubricOutcomes").select().eq('assignmentId', assignmentId);
    rubricError != undefined && console.error("Rubric Error", rubricError);

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

    const addCounts = (criteria, levels, rubricOutcomes) => {

        console.log("Criteria", criteria);

        rubricOutcomes.forEach(ro => {
            //console.log("ro", ro)
            if (criteria[ro.qualityId] === undefined) {
                console.error("Quality Id not found", ro.qualityId)

            } else {
                
                if (ro.columnId != null) {
                    const index = levels.map(l => l.levelId).indexOf(ro.columnId)
                    index == -1 && console.log("Not Found", ro.columnId) 

                    if (index != -1){
                        criteria[ro.qualityId][index]['count'] === undefined ? criteria[ro.qualityId][index]['count'] = 0 : criteria[ro.qualityId][index]['count'] = criteria[ro.qualityId][index]['count'] + 1;
                    }
                }
                
                // criteria[ro.qualityId]['levelId']['count'] = criteria[ro.qualityId]['l']['count'] || 0;
            }
            
        });

        return criteria
    }

    let qualityIds = Array.from(new Set( criteria.map(c => c.qualityId) ))
    
    const newCriteria = addCounts(translateQualityCriteria(criteria), levels, rubricOutcomes);

    console.log(newCriteria);

    return {
      props: {
        assignment, 
        levels,
        criteria: newCriteria,
        rubricOutcomes

        }, 
    }
  }