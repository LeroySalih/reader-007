
import {useState, useEffect} from 'react';
import { PickList} from 'primereact/picklist';
import { supabase } from '../../../config/supabase';

const ClassPickList = ({unit, onClassesChange}) => {
    
    const [target, setTarget] = useState(unit?.classes.map(c => ( {className: c}) ));
    const [source, setSource] = useState([]);

    
    const onChange = (e) =>{
        
        setSource(e.source);
        setTarget(e.target);
        onClassesChange(e.target?.map(c => c.className));
    }

    useEffect( ()=> {

        const loadFormatives = async () => {
            const {data, error} = await supabase
                                    .from("vw_class_list")
                                    .select()
            error && console.error(error);
            
            setSource(data.filter(f => 
                target?.filter(t => t.className === f.className).length === 0
                )
                )
        }

        loadFormatives();

        // notify parent of target formatives
        onClassesChange(target?.map(t => t.className))
    }, [])

    return <>
    <PickList source={source} 
                  target={target}
                  sourceHeader="Available"
                  targetHeader="Selected"
                  filterBy="className"
                  itemTemplate={ItemTemplate}
                  sourceFilterPlaceholder="Search by name"
                  onChange={onChange} />
    </>
}


const ItemTemplate = (item) => {

    return <div>{item.className}</div>

}


export default ClassPickList