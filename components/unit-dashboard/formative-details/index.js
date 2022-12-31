import {supabase} from '../../../config/supabase';

import {useState, useEffect} from 'react';
import { DataTable, Column} from 'primereact/datatable';

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
        <DataTable value={formativeData}>
            <Column field="pupilname" header="Pupil" sortable></Column>
            <Column field="score" header="Score" sortable filter></Column>
        </DataTable>

       
        <style jsx="true">{`
        
            .display-formative {
                display: grid;
                grid-template-columns: 1fr 1fr;
            }

            .header {
                font-weight : heavy
            }

            

        `}</style>

    </div>
}

export default FormativeDetails;