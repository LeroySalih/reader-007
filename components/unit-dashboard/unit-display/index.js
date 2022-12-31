import { useState, useEffect } from "react";

const UnitDisplay = ({unit, avgScores, handleFormativeClick}) => {

    const [displayObj, setDisplayObj] = useState({})
    const [selectedFormativeTitle, setSelectedFormativeTitle] = useState(null);
    const [selectedClassId, setSelectedClassId] = useState(null);

    const createDisplayObject = (unit, avgScores) => {
        if (!unit || !avgScores)
            return {}

        return unit.formativeTitles.reduce((prev, curr) => {prev[curr] = (
            unit.classes.map((c, i) => ({[c]: (avgScores.filter(avg => avg.className == c && avg.formativeTitle == curr)[0]?.avg_score)}))
        ); return prev; }, {})
    };

    useEffect(()=> {

        setDisplayObj(createDisplayObject(unit, avgScores));

    }, [unit, avgScores])


    const handleClick = (formativeTitle, classId) => {
        setSelectedFormativeTitle(formativeTitle)
        setSelectedClassId(classId)

        handleFormativeClick(formativeTitle, classId);

    }

    

    if (!unit)
        return <h1>Loading</h1>

    return <div>
       
        <table>
            <tr>
                <th></th>
                {displayObj && Object.values(displayObj)[0]?.map((c, i) => <th className="class-title" key={i}>{Object.keys(c)[0]}</th>)}
            </tr>
            {
                // display the formative scores for each class
                displayObj && Object.keys(displayObj)
                    .sort((a, b) => a.title > b.title ? -1 : 1)
                    .map((k, i) => <tr key={`c${i}`}>
                    <td className="formative-title" key={i}>{k}</td> 
                    {displayObj[k].map((avg, i) => <td key={i} className={`avg-score ${selectedFormativeTitle == k && selectedClassId == Object.keys(avg)[0] ? 'selected' : ''}`} onClick={()=> {handleClick( k,Object.keys(avg)[0] )}}>{Object.values(avg)[0]?.toFixed(2)}</td>)}  
                    </tr>)
            }
            
        </table>

        
        <style jsx="true">{`

            .class-title {
                font-size: 0.8rem;
            }

            .formative-title {
                font-size: 0.8rem;
                padding-top: 0.5rem;
                padding-bottom: 0.5rem;
            }

            .avg-score {
                text-align: right;
                font-size: 0.8rem;
            }

            .selected {
                background-color :#e6f1ff;
            }
        `}
        </style>

    </div>
}

export default UnitDisplay;