import {useRouter} from 'next/router'
import { supabase } from '../../config/supabase';


const AssignmentPage = ({assignment, levels, criteria}) => {

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
                                {Object.values(criteria)[0].map((c, i) => <td key={i}>{c.description}</td>)}
                            </tr>
                            
                            )
                        }
                        
        
                    </tbody>
                </table>
                <pre>{JSON.stringify(criteria, null, 2)}</pre>
                <pre>{JSON.stringify(assignment, null, 2)}</pre>
                <pre>{JSON.stringify(levels, null, 2)}</pre>
                
                
                
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

    let qualityIds = Array.from(new Set( criteria.map(c => c.qualityId) ))
    

    return {
      props: {
        assignment, 
        levels,
        criteria: translateQualityCriteria(criteria)
        }, 
    }
  }