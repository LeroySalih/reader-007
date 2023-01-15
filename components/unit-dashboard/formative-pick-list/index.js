
import {useState, useEffect} from 'react';
import { PickList} from 'primereact/picklist';
import { supabase } from '../../../config/supabase';

const FormativePickList = ({unit, onFormativesChanged}) => {


    console.log("unit", unit)
    const [target, setTarget] = useState(unit?.formativeTitles?.map(t => ( {formativeTitle: t}) ));
    const [source, setSource] = useState([]);

    
    const onChange = (e) =>{
        console.log(e);
        setSource(e.source);
        setTarget(e.target);
        onFormativesChanged(e.target?.map(t => t.formativeTitle));
    }

    useEffect( ()=> {

        const loadFormatives = async () => {
            const {data, error} = await supabase
                                    .from("vw_formative_list")
                                    .select()
            error && console.error(error);
            console.log(data)
            setSource(data.filter(f => 
                target?.filter(t => t.formativeTitle === f.formativeTitle).length === 0
                )
                )
        }

        loadFormatives();

        // notify parent of target formatives
        onFormativesChanged(target?.map(t => t.formativeTitle))
    }, [])

    return <>
    <PickList source={source} 
                  target={target}
                  sourceHeader="Available"
                  targetHeader="Selected"
                  filterBy="formativeTitle"
                  itemTemplate={ItemTemplate}
                  sourceFilterPlaceholder="Search by name"
                  onChange={onChange} />
    </>
}


const ItemTemplate = (item) => {

    return <div>{item.formativeTitle}</div>

}


export default FormativePickList