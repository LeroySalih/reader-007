import {supabase} from '../../config/supabase';

import {useState, useEffect} from 'react';
import { DateTime } from 'luxon';

import ProgressChart from '../../components/progress-chart';

import UnitSelector from '../../components/unit-dashboard/unit-selector';
import UnitDisplay from '../../components/unit-dashboard/unit-display';
import FormativeDetails from '../../components/unit-dashboard/formative-details';

const loadUnits = async (setUnits) => {

    const {data, error} = await supabase
                        .from("gf_units")
                        .select()
                        

    console.log("data", data)
    setUnits(data);
}

const loadAvgScores = async (setUnits) => {

    const {data, error} = await supabase
                        .from("vw_formative_avg_score")
                        .select()
                        

    console.log("data", data)
    setUnits(data);
}

const GfUnitsPages = () => {

    const [units, setUnits] = useState([]);
    const [avgScores, setAvgScores] = useState([])
    const [avgScore, setAvgScore] = useState(0);

    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedFormativeTitle, setSelectedFormativeTitle] = useState(null);
    const [selectedClassId, setSelectedClassId] = useState(null)

    useEffect(()=>{

        (async () => {
            await loadUnits(setUnits);
            await loadAvgScores(setAvgScores);
        })()
        

    },[]);

    const getAvgScoresForUnit = (unit) => {
        if (!unit)
            return [];
        
        return avgScores.filter( avg => unit.formativeTitles.includes(avg.formativeTitle) && unit.classes.includes(avg.className));
    }

   

    

    


    const handleSelectUnit = (id) => {

        const tmpSelectedUnit = units.filter(u => u.id === id)[0];

        setSelectedUnit(tmpSelectedUnit);
    }

    const handleFormativeClick = ( formativeTitle, classId) => {

        setSelectedClassId(classId);
        setSelectedFormativeTitle(formativeTitle);
    }
    
    return <div className="page">
        <h1>The Gf Units Pages</h1>
        <div className="page-layout">
            
            <UnitSelector 
                units={units} 
                avgScores={avgScores}
                handleSelectUnit={handleSelectUnit} 
                unit={selectedUnit}/>

            
            <UnitDisplay 
                unit={selectedUnit} 
                avgScores={getAvgScoresForUnit(selectedUnit)} 
                handleFormativeClick={handleFormativeClick}/>
            
            <FormativeDetails 
                formativeTitle={selectedFormativeTitle} 
                classId={selectedClassId}/>
        

        </div>

        
        <style jsx="true">{`

            .page {
                width: 80%;
                margin: auto;

            }

            .page-layout {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-gap: 3rem;
            }

            

        
        `}</style>   
    </div>
}











export default GfUnitsPages;