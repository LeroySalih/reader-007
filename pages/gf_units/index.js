import {supabase} from '../../config/supabase';

import {useState, useEffect} from 'react';
import { DateTime } from 'luxon';

import ProgressChart from '../../components/progress-chart';

import UnitSelector from '../../components/unit-dashboard/unit-selector';
import UnitDisplayScores from '../../components/unit-dashboard/unit-display-scores';

import FormativeDetails from '../../components/unit-dashboard/formative-details';
import GfUnitsContext from '../../components/gf-units-context';
import FormativePickDlg from '../../components/unit-dashboard/formative-pick-dlg';
import ClassPickDlg from '../../components/unit-dashboard/class-pick-dlg';
import NewUnitDlg from '../../components/unit-dashboard/new-unit-dlg';
import { CallEnd } from '@mui/icons-material';
import PupilScoresForUnit from '../../components/unit-dashboard/pupil-scores-for-unit';
import { Sidebar } from 'primereact/sidebar';
import { Button } from '@mui/material';

const loadUnits = async (setUnits, setSelectedUnit) => {

    const {data, error} = await supabase
                        .from("gf_units")
                        .select()
                        

    setUnits(data.sort((a, b) => a.title > b.title ? 1 : -1));
    data.length > 0 && setSelectedUnit(data.sort((a, b) => a.title > b.title ? 1 : -1)[0])
}


const transformCompletion = (data) => {
    const tmp = data.reduce((prev, curr) => {

        prev[curr.formativetitle] = prev[curr.formativetitle] || {}
        prev[curr.formativetitle][curr.classes] = 1 - curr.not_completed_pct;

        return prev;
    }, {});

    return tmp;
}

const load_pupil_completion_for_unit = async (unit, setPupilCompletion) => {

    
    if (!unit)
        return;

    const {data, error} = await supabase.rpc("gf_pupil_completion_for_unit", { classnames: unit?.classes, formativetitles: unit?.formativeTitles });

    error && console.error("error", error);

    setPupilCompletion(transformCompletion(data));

}

const loadAvgScores = async (setUnits) => {

    const {data, error} = await supabase
                        .from("vw_formative_avg_score")
                        .select()
                        

    setUnits(data);
}

const GfUnitsPages = () => {

    const [units, setUnits] = useState([]);
    const [avgScores, setAvgScores] = useState([])
    const [avgScore, setAvgScore] = useState(0);
    const [pupilCompletionForUnit, setPupilCompletionForUnit] = useState([]);

    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedFormativeTitle, setSelectedFormativeTitle] = useState(null);
    const [selectedClassId, setSelectedClassId] = useState(null)

    const [showFormativeEditDlg, setShowFormativeEditDlg] = useState(false);
    const [showClassEditDlg, setShowClassEditDlg] = useState(false);
    const [showNewUnitDlg, setShowNewUnitDlg] = useState(false);

    const [sideBarVisible, setSideBarVisible] = useState(false);

    const [unitDisplayKey, setUnitDisplayKey] = useState(0);

    useEffect(()=>{

        (async () => {
            await loadUnits(setUnits, setSelectedUnit);
            await loadAvgScores(setAvgScores);

            
        })()
        

    },[]);

    useEffect(()=> {

        (async () => {

            // await load_pupil_completion_for_unit(selectedUnit, setPupilCompletionForUnit);

        })()

    }, [selectedUnit]);

    const getAvgScoresForUnit = (unit) => {
        if (!unit)
            return [];
        
        return avgScores.filter( avg => unit.formativeTitles?.includes(avg.formativeTitle) && unit.classes?.includes(avg.className));
    }

   
    
    const handleFormativeClick = ( formativeTitle, classId) => {

        setSelectedClassId(classId);
        setSelectedFormativeTitle(formativeTitle);
    }

    const selectUnit = (unit) => {
        setSelectedUnit(unit)
    }

    const formativeEditDlgShow = (unit) => {
        setSelectedUnit(unit);
        setShowFormativeEditDlg(true);
    }

    const formativeEditDlgOK = async (unit, formatives) => {
        setShowFormativeEditDlg(false);

        const updateObj = Object.assign({}, unit, {formativeTitles: formatives})

        
        const {data, error} = await supabase.from("gf_units")
                        .update(updateObj)
                        .eq("id", updateObj.id);

        const tmpUnits = units.map(u => u.id === updateObj.id ? updateObj : u);
        
        setUnits(tmpUnits);

        selectUnit(updateObj);

        setUnitDisplayKey(prev => prev + 1)

        error && console.error(error);
    }

    const formativeEditDlgCancel = () => {
        setShowFormativeEditDlg(false)
    }

    const classEditDlgShow = (unit) => {

        setSelectedUnit(unit);
        setShowClassEditDlg(true);

    }

    const classEditDlgOK = async (unit, classes) => {

        setShowClassEditDlg(false);

        const updateObj = Object.assign({}, unit, {classes})

        
        const {data, error} = await supabase.from("gf_units")
                        .update(updateObj)
                        .eq("id", updateObj.id);

        const tmpUnits = units.map(u => u.id === updateObj.id ? updateObj : u);
        
        setUnits(tmpUnits);

        selectUnit(updateObj);

        setUnitDisplayKey(prev => prev + 1)

        error && console.error(error);
    }

    const classEditDlgCancel = () => {
        setShowClassEditDlg(false)
    }


    const unitNewDlgShow = () => {
        setShowNewUnitDlg(true);
    }

    const unitNewDlgOK = async (newUnit) => {
        
        const {data, error} = await supabase.from("gf_units")
                                            .insert({...newUnit, classes: [], formativeTitles: []})
                                            .select();


        error && console.error(error);


        //close the dlg
        setShowNewUnitDlg(false);

        setUnits([data[0], ...units]);
        setSelectedUnit(data[0]);
    }

    const unitNewDlgCancel = () => {
        setShowNewUnitDlg(false);
    }

    return <>
        <GfUnitsContext.Provider value={
            {   
                unitDlg : {
                    selectUnit,
                    selectedUnit,
                    unitNewDlgShow,
                    unitNewDlgOK,
                    unitNewDlgCancel
                },
                formativeDlg: {
                    
                    formativeEditDlgShow, 
                    formativeEditDlgOK, 
                    formativeEditDlgCancel
                },
                classDlg: {
                    classEditDlgShow, 
                    classEditDlgOK, 
                    classEditDlgCancel
                }
            }
        }>
        <div className="page">
        <h1>Units Dashboard for {selectedUnit?.title}
            <Button onClick={()=> {setSideBarVisible(true)}} >Change</Button>
        </h1>
        <div className="page-layout">
            
            <div>
                <h3>History + Current Charts</h3>
            </div>
            <div>

            <h3>% Scores for Unit</h3>
            <UnitDisplayScores
                testProp="hello"
                seed={unitDisplayKey} 
                unit={selectedUnit} 
                avgScores={getAvgScoresForUnit(selectedUnit)} 
                handleFormativeClick={handleFormativeClick}/>
            </div>

            
            
            </div>
            <div>

            <div>
                <h3>Pupil Scores for Unit</h3>
                <PupilScoresForUnit />
            </div>
            

            <FormativePickDlg header="Header" 
                visible={showFormativeEditDlg} 
                style={{ width: '70vw' }} />


            <ClassPickDlg header="Header"
                visible={showClassEditDlg} 
                style={{ width: '70vw' }} />
            
            <NewUnitDlg header="Header"
                visible={showNewUnitDlg}
                style={{ width: "70vw"}} />    


            <Sidebar 
                visible={sideBarVisible} 
                onHide={() => setSideBarVisible(false)}>
                <UnitSelector 
                units={units} 
                avgScores={avgScores}
                unit={selectedUnit}
                
                />
            </Sidebar>    

        </div>

        
        <style jsx="true">{`

            .page {
                width: 80%;
                margin: auto;

            }

            .page-layout {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-gap: 3rem;
            }

            

        
        `}</style>   
    </div>
    </GfUnitsContext.Provider>
    </>
}











export default GfUnitsPages;