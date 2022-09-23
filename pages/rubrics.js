import {useEffect, useState} from 'react'
import { supabase }  from "../config/supabase"

const Rubrics = () => {

    const [rubrics, setRubrics] = useState(null);
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

        const getRubrics = async () => {

            const {data, error} = await supabase
                                    .from("Rubrics")
                                    .select()

            setRubrics(data);

        }

        getRubrics()
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


const Rubric = ({rubric}) => {
    if (rubric === undefined)
        return <h1>Loading</h1>
    return  <div className="rubric-card">
                <div className="title"><h1>{rubric.displayName}</h1></div>
                <table>
                    <tbody>
                        
                        
                        {
                            rubric.qualities.map((q, i) => (
                                <tr key={i} className="loRow">
                                    <td className="LO">{q.description.content}</td>
                                    {
                                        q.criteria.map((c, i) => (
                                            <td key={i} className="criteria">{c.description.content}</td>
                                        ))
                                    }
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                <style jsx="true">{`
                
                .rubric-card {
                    background-color: white;
                    border: solid silver 1px;
                    margin: 2rem;
                    border-radius: 1rem;
                    padding: 1rem;
                    box-shadow: 0px 3px 10px #b0b0b0;
                }

                .title {
                    color: #626262;
                    border-bottom: solid 1px silver;
                    margin-bottom: 1rem;
                }

                .loRow {
                    border-bottom: silver dashed 1px;
                }

                .loRow:last-child {
                    border-bottom: none;
                }


                .LO {
                    font-weight: 900;
                    font-size: 0.7rem;
                    border-right: dashed silver 1px;
                    padding: 1rem;    
                }

                .criteria {
                    font-size: 0.7rem;
                    padding: 1rem;
                    border-right: dashed 1px silver;
                    
                }

                .criteria:last-child {
                    border-right: none;
                }


                `}</style>
            </div>
}


export default Rubrics;