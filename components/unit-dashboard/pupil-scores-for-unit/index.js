import { useEffect, useState } from "react";
import { supabase } from "../../../config/supabase";

const PupilScoresForUnit = () => {

    const [pupilScores, setPupilScores] = useState([]);
    const [formativeTitles, setFormativeTitles] = useState([]);


    useEffect(()=> {
        const loadData = async () => {
            const {data, error} = await supabase.from("gf_pupil_scores_for_unit")
                                                .select()
                                                .in("className", ['8A-Science', '8B-Science', '8C-Science'])
                                                .like("formativeTitle", '8J%')        
            error && console.error(error);

            const tData = transformData(data)
            setPupilScores(tData);

            const firstClassKey = Object.keys(tData)[0]
            const firstPupilKey = Object.keys(tData[firstClassKey])[0]
            console.log("fTitles",firstClassKey, firstPupilKey, tData[firstClassKey][firstPupilKey])
            const formativeTitles = tData[firstClassKey][firstPupilKey];

            setFormativeTitles(formativeTitles);

            
            }

        loadData();
    }, [])


    const transformData = (data) => {

        const result = data.reduce((prev, curr) => {

            if (!prev[curr.className])
            {
                prev[curr.className] = {}
            }

            if (!prev[curr.className][curr.pupilName]){
                prev[curr.className][curr.pupilName] = {}
            }

            prev[curr.className][curr.pupilName][curr.formativeTitle] = curr.score;

            return prev;

        }, {});


        return result;


    }
    return <>Pupil Scores for Unit
        <div className="display-grid">
            {/* Display Top Row */}
            <div>Name:</div>
            <div>Score:</div>
            {Object.keys(formativeTitles).map((ft, i) => <div key={i}>{ft}</div>)}
            
            {
                Object.keys(pupilScores).map((c, i) => <DisplayClass key={i} classData={{title: c, data: pupilScores[c]}} formativeTitles={formativeTitles}/>)
            }
            
            
            
        </div>

        
        <style jsx="true">{`
        
            .display-grid {
                display: grid;
                grid-template-columns: 1fr 1fr repeat(${Object.keys(formativeTitles).length}, 1fr);
            }

            .class-title {
                color : red;
            }

        `}</style>
    </>
}


const DisplayClass = ({classData, formativeTitles}) => {

    const pupilScore = (pupil) => {
        const sum = (Object.values(pupil).reduce((prev, curr) => prev + parseInt(curr), 0))
        const count = Object.values(pupil).length
        console.log(pupil, sum , count)
        return sum /  count;
    }

    const {title, data: pupils} = classData;
    return <>{[
        <div className="class-title" key="title">{title}</div>,
        <div className="class-title" key="title-spacer">&nbsp;</div>,
        ...(Object.keys(formativeTitles).map((ft, i) => <><div className="class-title">&nbsp;</div></>)),
        
        ...(Object.keys(pupils)
            .sort((a, b) => pupilScore(pupils[a]) > pupilScore(pupils[b]) ? 1 : -1)
            .map((cd, i) => [
            <div key={`pupil_name_${i}`} className="pupil-name">{cd}</div>,
            <div key="pupil-name" className="pupil-name">[{pupilScore(pupils[cd])}%]</div>,
            ...(Object.values(pupils[cd]).map((p, i) => <div key={i} className="pupil-score">{p}</div>))
        ])),
    ]}
    <style jsx="true">{`

        .class-title {
            color:black;
            font-size: 1.4rem;
            margin-top: 2rem;
            margin-bottom: 0.5rem;
            border-bottom: solid 1px silver;
        }

        .pupil-name {
            font-size: 0.7rem;
            line-height: 1.4rem;
        }

        .pupil-score {
            font-size: 0.7rem;
        }
    
    `}</style>
    </>
}

export default PupilScoresForUnit;