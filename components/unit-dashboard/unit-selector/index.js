import ProgressChart from "../../progress-chart";
import { InputText } from 'primereact/inputtext';
import {useState, useEffect, useContext} from 'react';
import GfUnitsContext from "../../gf-units-context";

import { Button } from "primereact/button";
import { Dialog } from 'primereact/dialog';
import { PickList} from 'primereact/picklist';
import FormativePickList from "../formative-pick-list";
import FormativePickDlg from "../formative-pick-dlg";

const UnitSelector = ({units, avgScores, handleSelectUnit, handleNewUnit}) => {

    const [filterTerm, setFilterTerm] = useState('');
    const [filterUnits, setFilterUnits] = useState(units);
    const [showEditFormatives, setShowEditFormatives] = useState(false);
    const [target, setTarget] = useState([]);
    const [source, setSource] = useState([{name:'Apple'}, {name:'Bannana'}, {name:'Cheries'}]);
    //const [selectedUnit, setSelectedUnit] = useState(unit);

    const {unitDlg, formativeDlg, classDlg} = useContext(GfUnitsContext);
    const {selectedUnit, selectUnit, unitNewDlgShow} = unitDlg;
    const {formativeEditDlgShow, formativeNewUnit} = formativeDlg;
    const {classEditDlgShow} = classDlg;

    //useEffect(()=> {
    //    setSelectedUnit(unit);
    // }, [unit]);


    const getAvgScoresForUnit = (unit) => {
        if (!unit)
            return [];
        
        return avgScores.filter( avg => unit.formativeTitles.includes(avg.formativeTitle) && unit.classes.includes(avg.className));
    }

    const calcAvgScore = (unit) => {
        

        if (!unit.classes || !unit.formativeTitles)
            return 0;

        const filteredAvgScores = getAvgScoresForUnit(unit)
        const maxPoints = 100 * unit.classes?.length * unit.formativeTitles?.length

        const sumOfAverageScores = filteredAvgScores.reduce((prev, curr)=> { return prev + curr.avg_score}, 0)
        
        //return sumOfAverageScores / filteredAvgScores.length
        return (sumOfAverageScores / maxPoints) * 100
    }
    
    useEffect(()=> {
        setFilterTerm('')
        setFilterUnits(units);
    }, [units])



    useEffect(()=> {

        if (filterTerm === '')
            setFilterUnits(units);
        else{
            const flt = units.filter(
                u => u.title.includes(filterTerm) || 
                u.subject.includes(filterTerm) ||
                (u.classes.map((c) => c.includes(filterTerm))).includes(true)
                )
            setFilterUnits(flt);
        }
    
    }, [
        filterTerm
    ]);

   

    

    const handleShowClassesDlg = async (u) => {
        classEditDlgShow(u);
    }

    const handleShowFormativesDlg = async (u) => {
        formativeEditDlgShow(u);
    }

    const handleShowNewUnitDlg = async () => {

        unitNewDlgShow();
    }

    

    if (!units) 
        return <h1>Loading</h1>

    return <div className="unit-selector">

    <div className="filter-box">   
        <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)} placeholder="Search" />
        </span>
        <Button icon="pi pi-plus" onClick={() => handleShowNewUnitDlg()}/>
    </div>
    <div className="units">
    {filterUnits
        .sort((a, b) => a.title > b.title ? 1 : -1)
        .map((u, i) => <div key={i} className={`unit-card ${u.id == selectedUnit?.id ? 'selected' : ''}`}>
        <div>
        <div className="subject">{u.subject}</div>
        <div className="title" onClick={() => selectUnit(u)}>{u?.title}</div>
        
        <div className="count" onClick={() => {handleShowClassesDlg(u)}}>{u.classes?.map((c, i) => <span key={i}>{(i > 0 ) ? ', ' : ' '} {c}  </span>)}</div>
        {u.classes.length == 0 && <div className="count" onClick={() => {handleShowClassesDlg(u)}}>No Classes</div>}
        
        <div className="count" onClick={() => {handleShowFormativesDlg(u)}}>{u.formativeTitles?.length} Formatives</div>
        <div className="avgScore">Avg Score: {calcAvgScore(u).toFixed(2)}%</div>
        </div>
        <div className="progress-chart-container">
            <ProgressChart progress={calcAvgScore(u)}/>
        </div>
        </div>)}
        </div>

        
            
        
        <style jsx="true">{`
        
            .units {
                height: 80vh;
                overflow-y: scroll;
            }

            .unit-card {
                border : solid 1px silver;
                border-radius: 1rem;
                margin: 0.2rem;
                padding: 1rem;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                max-width: 500px;
            }

            .selected {
                background-color : #e6f1ff;
            }

            .subject {
                color: #404040;
                font-size: 0.7rem;
            }

            .title {
                font-size: 1.5rem;
            }

            .count {
                color: #404040;
                font-size: 0.7rem;
            }

            .progress-chart-container {
                height: 4rem;
                width: 4rem;
            }

            .filter-box {
                margin: 0.1rem;
            }
        `}</style>
    </div>
}


const ItemTemplate = (item) => {

    return <pre>{JSON.stringify(item.name, null, 2)}</pre>

}

export default UnitSelector;