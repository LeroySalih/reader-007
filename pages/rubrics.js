import {useEffect, useState} from 'react'
import { supabase }  from "../config/supabase"
import Link from 'next/link'

import Rubric from '../components/rubric';

import { getRubrics } from '../libs/getRubrics';



const Rubrics = ({rubrics}) => {

    // const [rubrics, setRubrics] = useState(null);
    const [filter, setFilter] = useState('');


    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    }

    const filterRubric = (r) => {
        if (filter === '')
            return true
        
            return r.displayName.includes(filter)
    }

    useEffect (()=>{

        /*
        const getRubrics = async () => {

            const {data, error} = await supabase
                                    .from("Rubrics")
                                    .select()

            setRubrics(data);

        }

        getRubrics()
        */
    },[] )

    return <>
            
            <div className="page-header">
                <h1>Rubrics Page</h1>
                <input onChange={handleFilterChange} value={filter}></input>
            </div>
            
            
            {
                rubrics && rubrics
                            .filter(filterRubric)
                            .map((r, i) => <Rubric key={i} rubric={r}/>)
            }
            
            
            <style jsx="true">{`
                .page-header {
                
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                }
            `}</style>
           </>
}





export default Rubrics;


export async function getStaticProps(context) {

    const rubrics = await getRubrics();

    return {
      props: {
        rubrics
      }, // will be passed to the page component as props
    }
}