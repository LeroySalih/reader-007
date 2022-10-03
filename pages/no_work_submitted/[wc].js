
import {supabase} from '../../config/supabase';
import spacetime from "spacetime"
import { GroupOutlined } from '@mui/icons-material';

const NoWorkSubmitted = ({query, data}) => {

    const groupedPupils = data
                            .reduce((group, pupil) => {
                              group[pupil.classname] = group[pupil.classname] || []
                              group[pupil.classname].push(pupil)
                              return group;
                            })

    return <>
    { query && <h1>No Work Submitted from: {query.from} to {query.to}</h1>}
    
    {
      data && <table>
                <tbody>
                  {
                    
                      Object.keys(groupedPupils).map((k, i) => ( 
                        [
                        <tr key={`$A${i}`}><td>{k}</td></tr>, 
                        <tr key={`$B${i}`}>
                            <td>{groupedPupils[k].assignmentTitle}</td>
                            <td>{groupedPupils[k].givenname}</td>
                            <td>{groupedPupils[k].surname}</td>
                            <td>{groupedPupils[k].feedback}</td>
                            <td>{groupedPupils[k].points}</td>
                        </tr>
                        ]
                      )
                      )
                  }
                </tbody>
              </table>
    }
    
    </>
}





export default NoWorkSubmitted


export async function getServerSideProps(context) {

    console.log("Context", context.params);

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