import { useEffect, useState, useContext } from "react";
import { supabase } from "../../../config/supabase";
import { TabView, TabPanel } from 'primereact/tabview';
import GfUnitsContext from "../../gf-units-context";
import { Tooltip } from 'primereact/tooltip';

const PupilScoresForUnit = () => {

    const [pupilScores, setPupilScores] = useState([]);
    const [formativeTitles, setFormativeTitles] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    const {unitDlg} = useContext(GfUnitsContext);
    const {selectedUnit} = unitDlg;

    useEffect(()=> {
        const loadData = async () => {
            if (!selectedUnit) return;

            const {data, error} = await supabase.from("gf_pupil_scores_for_unit")
                                                .select()
                                                .in("className", selectedUnit.classes)
                                                .in("formativeTitle", selectedUnit.formativeTitles)        
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
    }, [selectedUnit])


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
    return <>
    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
            
            {Object.keys(pupilScores).map((ps, i) => <TabPanel key={i} header={ps}>
            <div className="display-grid">
            <DisplayClass key={i} classData={{title: ps, data: pupilScores[ps]}} formativeTitles={formativeTitles}/>
            </div>
            </TabPanel>)}
            
            
        </TabView>

        
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
        
        
        <div key={`${classData.title}_1`}>Name:</div>,
        <div key={`${classData.title}_2`}>Score:</div>,
        Object.keys(formativeTitles).map((ft, i) => <div  key={i} >{ft.slice(0,7)}</div>),

        
        ...(Object.keys(pupils)
            .sort((a, b) => pupilScore(pupils[a]) > pupilScore(pupils[b]) ? 1 : -1)
            .map((cd, i) => [
            <div key={`pupil_name_${i}`} className="pupil-name">{cd}</div>,
            <div key="pupil-name" className="pupil-name">[{pupilScore(pupils[cd]).toFixed(0)}%]</div>,
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