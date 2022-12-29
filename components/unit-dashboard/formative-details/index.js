import {supabase} from '../../../config/supabase';

import {useState, useEffect} from 'react';

const loadFormativeData = async (setFormativeData, formativetitle, classid) => {

    console.log({formativetitle, classid});

    if (!formativetitle || !classid)
        setFormativeData(null);

    const {data, error} = await supabase.rpc("gf_formative_score_by_pupil", {classid, formativetitle })

    error && console.error("loadFormativeData", error);

    console.log("Data", data)
    setFormativeData(data);

    return data;
}

const FormativeDetails = ({formativeTitle, classId}) => {

    const [formativeData, setFormativeData] = useState([])

    useEffect(()=> {
        loadFormativeData(setFormativeData, formativeTitle, classId)
    }, [formativeTitle, classId])
    return <div>
        
        <div className="display-formative">
            <div className="pupil-name header">Name:</div>
            <div className="pupil-score header">Score:</div>
            {formativeData && formativeData.map(f => [<div className="pupil-name">{f.pupilname}</div>, <div className="pupil-score">{f.score}</div>]) }
        </div>    
        <style jsx="true">{`
        
            .display-formative {
                display: grid;
                grid-template-columns: 1fr 1fr;
            }

            .header {
                font-weight : heavy
            }

            .pupil-name {
                font-size: 0.8rem;
                padding-top: 0.5rem;
                padding-bottom: 0.5rem;
            }
            


            .pupil-score {
                font-size: 0.8rem;
                padding-top: 0.5rem;
                padding-bottom: 0.5rem;
            }


        `}</style>

    </div>
}

export default FormativeDetails;