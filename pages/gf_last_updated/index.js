import {supabase} from '../../config/supabase';

import {useState, useEffect} from 'react';
import { DateTime } from 'luxon';

import { AutoComplete } from 'primereact/autocomplete';



const loadClassList = async (setClassList, setCurrentClass) => {
    
    const {data, error} = await supabase
        .from("vw_class_list")
        .select();

    error && console.error(error);
    
    setClassList(data);
    setCurrentClass((data.len > 0 && data[0]) || "")

}


const loadData = async(setData, currentClass) => {

    const {data, error} = await supabase
        .from("vw_pupil_last_updated")
        .select()
        .eq("className", currentClass)

    error && console.error(error);

    setData(data)
}

const LastUpdated = () => {
    const [data, setData] = useState([]);
    const [currentClass, setCurrentClass] = useState(null);
    const [classList, setClassList] = useState([])
    const [filteredClasses, setFilteredClasses] = useState([]);

    useEffect(()=> {
        
        const init = async() => {await loadClassList(setClassList, setCurrentClass);}

        init();

    }, [])

    useEffect(()=>{
        const init = async () => {await loadData(setData, currentClass)}

        init();
    }, [
        currentClass
    ])


    const handleCurrentClassChange =(e)=> {
        setCurrentClass(e.target.value)
    }   

    const searchClasses = (event) => {
        
        console.log("searchClasses", event.query);

        let fc = classList
                    .map((c) => c.className)
                    .filter(c => c.startsWith(event.query))

        setFilteredClasses(fc);
    }

    return <div className="page">
        <h1> Last Updated for <AutoComplete 
            value={currentClass} 
            suggestions={filteredClasses} 
            completeMethod={searchClasses} 
            onChange={(e) => setCurrentClass(e.value)} />
        </h1>
        
        
 
        <hr></hr>
        <div className="description">The date that pupils last updated a formative for this class.</div>

        <div className="last-updated-grid">
            <div className="header">Pupil</div>
            <div className="header">Last Updated</div>
            <div className="header">Duration</div>
        {data.map((p, i) => [
            <div key={`pName${i}`} className="item">{p.pupilName}</div>, 
            <div key={`pLastUpdated${i}`}  className="item">
                {DateTime.fromISO(p.lastUpdated).toISODate()}
            </div>,
            <div key={`pRelative`}  className={`item ${(DateTime.fromISO(p.lastUpdated).diffNow('days').days) < -10 ? 'late' : ''}`}>
                {DateTime.fromISO(p.lastUpdated).toRelative()}
                
            </div>,
            
            ])}
        </div>
        
        <style jsx="true">{`
            .page {
                width: 80%;
                margin: auto;
            }

            .description{
                color: #767171;
                margin-bottom: 1rem;
            }

            .last-updated-grid {
                display : grid;
                grid-template-columns: 1fr 1fr 1fr;
                width: 80%;
                margin: auto;
            }

            .header {
                background-color: silver;
                padding: 0.3rem;
            }

            .item {
                padding: 0.3rem;
            }

            .late {
                color: red;
            }

        `}</style>
    </div>
}

export default LastUpdated;