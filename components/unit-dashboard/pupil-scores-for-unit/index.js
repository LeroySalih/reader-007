import { useEffect, useState } from "react";
import { supabase } from "../../../config/supabase";

const PupilScoresForUnit = () => {

    const [pupilScores, setPupilScores] = useState([]);


    useEffect(()=> {
        const loadData = async () => {
            const {data, error} = await supabase.from("gf_pupil_scores_for_unit")
                                                .select()
                                                .in("className", ['8A-Science', '8B-Science', '8C-Science'])
                                                .like("formativeTitle", '8J%')        
            error && console.error(error);

            setPupilScores(data)
            }

        loadData();
    }, [])
    return <>Pupil Scores for Unit
        <pre>{JSON.stringify(pupilScores, null, 2)}</pre>
    </>
}

export default PupilScoresForUnit;