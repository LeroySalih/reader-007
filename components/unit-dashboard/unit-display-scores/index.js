import { useState, useEffect, useContext } from "react";
import GfUnitsContext from "../../gf-units-context";

const UnitDisplay = ({seed, testProp, avgScores, handleFormativeClick}) => {

    const [displayObj, setDisplayObj] = useState({})
    const [selectedFormativeTitle, setSelectedFormativeTitle] = useState(null);
    const [selectedClassId, setSelectedClassId] = useState(null);

    const {unitDlg}  = useContext(GfUnitsContext);
    const {selectedUnit} = unitDlg;

    const createDisplayObject = (unit, avgScores) => {
        if (!unit || !avgScores)
            return {}

        return unit.formativeTitles?.reduce((prev, curr) => {prev[curr] = (
            unit.classes.map((c, i) => ({[c]: (avgScores.filter(avg => avg.className == c && avg.formativeTitle == curr)[0]?.avg_score)}))
        ); return prev; }, {})
    };

    useEffect(()=> {

        setDisplayObj(createDisplayObject(selectedUnit, avgScores));

    }, [seed, selectedUnit, avgScores])


    const handleClick = (formativeTitle, classId) => {
        setSelectedFormativeTitle(formativeTitle)
        setSelectedClassId(classId)

        handleFormativeClick(formativeTitle, classId);

    }

    const calcClassAvg = (avgScores) => {
        
        return avgScores.reduce((prev, curr) => {

            if (prev[curr.className] === undefined) {
                (prev[curr.className] = {sum: 0, count: 0})
            }
            
            prev[curr.className] = {
                    sum : prev[curr.className].sum + curr.avg_score, 
                    count : prev[curr.className].count + 1}

            console.log(prev)
            return prev;

        }, {})
         
    }

    
    if (!selectedUnit)
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
            <tr ><td className="totals"></td>
            {
                Object.keys(calcClassAvg(avgScores))
                      .sort((a, b) => a > b ? 1 : 1)
                      
                      .map((a, i) => <td key={i} className="avg-score totals">{(calcClassAvg(avgScores)[a].sum / calcClassAvg(avgScores)[a].count).toFixed(2)}%</td>)

            }</tr>
            
        </table>
       

        
        <style jsx="true">{`

            .class-title {
                font-size: 0.8rem;
            }

            .totals {
                border-style : double none none none;
                border-top :  solid 1px silver;
                
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