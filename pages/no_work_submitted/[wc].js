
import {supabase} from '../../config/supabase';
import spacetime from "spacetime"
import { GroupOutlined } from '@mui/icons-material';

const NoWorkSubmitted = ({query, data}) => {

    const groupedPupils = data
                            .reduce((group, pupil) => {
                              group[pupil.classname] = group[pupil.classname] || []
                              group[pupil.classname].push(pupil)
                              return group;
                            }, {})

    return <>
    
    
    { query && <h1>No Work Submitted from: {query.from} to {query.to}</h1>}
    { !groupedPupils && <h1>Loading.</h1>}
   
    <div className="layout">
    {
      groupedPupils && <h3>Found data for {Object.keys(groupedPupils).length} classes for {JSON.stringify(query, null, 2)}</h3>
    }
    {
      groupedPupils && <table>
                <tbody>
                  <tr className="header">
                    
                    <th>Assignment</th>
                    <th>Name</th>
                    <th>Comment</th>
                    <th>Points</th>
                  </tr>
                  {
                    
                      Object.keys(groupedPupils).map((k, i) => ( 
                        [
                        <tr key={`$A${i}`} className="startClass"><td className="classTitle">{k}</td></tr>, 
                        groupedPupils[k].map((r,i) => 
                        <tr key={`$B${i}`}>
                          <td>{r.assignmentname}</td>
                          <td className='pupilName'>{r.givenname} {r.surname}</td>
                          <td>{r.feedback}</td>
                          <td>{r.points}</td>
                          
                        </tr>)
                        

                        ]
                      )
                      )
                  }
                </tbody>
              </table>
    }
    </div>

    <style jsx="true">{`

      .layout {
        width : 80vw;
        margin : auto;
        display : flex;
        flex-direction : column;
        justify-content: center;
      }

      .header {
        border : solid 1px silver;
      }

      .startClass {
        border : solid 1px silver;
      }

      table {
        border-spacing: 50px 0;
      }

      td {
        font-family : Verdana;
        font-size: 0.7rem;
        line-height: 1.2rem;
      }

      .classTitle {
        font-weight : 800;
      }

      .pupilName {
        font-weight : 800;
      }
    
    `}</style>
    
    </>
}





export default NoWorkSubmitted


export async function getServerSideProps(context) {

    const {wc} = context.params

    let { data, error } = await supabase.rpc('get_no_work_submitted', {
          ifrom: wc, 
          ito: spacetime(wc).add(7,"days").format('iso')
        });

    if (error) console.error(error)
    else console.log(data)
    
    return {
      props: {
        from: wc,
        to: spacetime(wc).add(7,"days").format('iso'),
        data
      }, // will be passed to the page component as props
    }
}