import Link from 'next/link'

const Rubric = ({rubric}) => {
    console.log(rubric)
    
    if (rubric === undefined || rubric === null)
        return <h1>Loading</h1>

    
    return  <div className="rubric-card">
                <div className="title">
                    <h1>
                        <Link  href={`/rubric/${rubric.id}`}>
                            <a className="linkTitle">{rubric.displayName}</a>
                        </Link>
                    </h1>
                    </div>
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
                
                .linkTitle {
                   cursor : pointer;
                }

                .linkTitle:hover {
                    color: blue;
                    
                 }


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


export default Rubric;