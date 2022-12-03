import {supabase} from '../../config/supabase';
import spacetime from "spacetime"
import { Construction, GroupOutlined } from '@mui/icons-material';
import { dueWeek, dueWeekFromISO } from '../../libs/spacetime';
import {DateTime} from 'luxon';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';


const NoWorkSubmitted = ({ data, from, to, dueDates, created}) => {

    const router = useRouter();

    const [emailList, setEmailList] = useState({})


    useEffect(()=> {
      
      const tmpEmailList = {}
      data.forEach((s) => tmpEmailList[s.submissionid] = false);

      setEmailList(tmpEmailList);

    }, [data])

    const handleSubmissionClick = (submissionId) => {

      setEmailList(prev => ({...prev, [submissionId]: !prev[submissionId]}))
    }

    const handleChangeDate = (e) => {
      router.push(`/no_work_submitted/${e.target.value}`);
    }

    const sendEmail = async (url, body) => {
        const response = await fetch(url, {
          method: 'POST',
          headers : {
            'Content-Type' : 'application/json'
          },      
          body : JSON.stringify(body)
      })
      
      const data = await response.json()
      
      return data;    
    } 
    
    const handleOnSendTest = async () => {

      const result = await sendEmail('/api/email', {
        to: 'leroysalih@bisak.org', 
        subject: 'No Homework', 
        textBody: 'This is the text of the body',
        htmlBody: 'This is the <u>text</u> of the body'
      })


    

      console.log("result", result);
    }


    const handleOnSendNoHomework = async () => {

      for (const submissionid of Object.keys(emailList).filter(k => k == true)){
        
        // get submission

        const submissions = data.filter(d => d.submissionid == submissionid)
        
        if (!submissions || !submissions.length == 1 )
          return;

        const submission = submissions[0];

        console.log("Submission", submission);

        const subject = `No Homework for ${submission.classname}`
        const htmlBody =  ` ${submission.givenname} has not submitted the homework "${submission.assignmentname}" for ${submission.classname}`

        const response = await sendEmail('/api/email', {
          to: 'leroysalih@bisak.org',
          subject ,
          textBody: htmlBody,
          htmlBody
        });

        console.log("response", response)


        

      }
      

    }

    const groupedPupils = data
                            .reduce((group, pupil) => {
                              group[pupil.classname] = group[pupil.classname] || []
                              group[pupil.classname].push(pupil)
                              return group;
                            }, {})

    if ( data == undefined || dueDates == undefined) {
      return <h1>Loading</h1>
    }

    return <>
    
    
    { <h1>No Work Submitted from: {from} to {to}</h1>}
    { !groupedPupils && <h1>Loading.</h1>}
   
   <div onClick={handleOnSendTest}><Button>Send Test Email</Button></div>
   <div onClick={handleOnSendNoHomework}><Button>Send Live No Homework Email</Button></div>
   
    
    <div className="layout">
    {
      groupedPupils && 
      <>
      <div>Page Created:{JSON.stringify(created, null, 2)}</div>
        <span>Homework due between 
          <b> 
             <select onChange={handleChangeDate}value={from}>{dueDates.map((d, i) => <option key={i} value={d}>{d}</option>)}</select></b> and 
          <b>{to.substring(0,10)}</b>
        </span>
      </>
    }
    {
      groupedPupils && <table>
                <tbody>
                  <tr className="header">
                    <th>Submission Id</th>
                    <th>Assignment</th>
                    <th>DueDate</th>
                    <th>Name</th>
                    <th>Comment</th>
                    <th>Points</th>
                  </tr>
                  {
                    
                      Object.keys(groupedPupils).map((k, i) => ( 
                        [
                        <tr key={`$A${i}`} className="startClass"><td className="classTitle">{k}</td></tr>, 
                        groupedPupils[k].map((r,i) => 
                        [<tr key={`$B${i}`}>
                          <td><input type="checkbox" checked={emailList && emailList[r.submissionid]} onClick={() => handleSubmissionClick(r.submissionid)}></input></td>
                          <td>{r.assignmentname}</td>
                          <td>{r.duedatetime.substring(0,10)}</td>
                          <td className='pupilName'>{r.givenname != null ? r.givenname + " " +r.surname : r.userid}</td>
                          <td>{r.feedback}</td>
                          <td>{r.points}</td>
                          
                        </tr>,
                        
                        ]),
                        <tr key={`C${i}`}><td colSpan="4">&nbsp;</td></tr>
                        

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
  console.log('wc', wc, spacetime(wc).add(7,"days").format('iso'))

  const assignments = await readAssignmentsFromDb();
  const dueDates = allDueDates(assignments)
  console.log('dd', dueDates)

  let { data, error } = await supabase.rpc('get_no_work_submitted', {
        ifrom: wc, 
        ito: spacetime(wc).add(7,"days").format('iso')
      });

  error != undefined && console.error(error)
  //else console.log(data)


  
  return {
  
    props: {
      from: wc,
      to: spacetime(wc).add(7,"days").format('iso'),
      data,
      dueDates,
      created: DateTime.now().toObject()
    }, // will be passed to the page component as props
  }
   
}


const startOfWeek = (dt) => {
  return spacetime(dt)
  .weekStart("Sunday")
  .startOf('week')
  .format("yyyy-mmm-dd")
}

const allDueDates = (assignments) => {

  const allDates = assignments.reduce((group, item) => {
      
      group[startOfWeek(item["dueDateTime"])] = 0

      return group
  }, {});

  return Object.keys(allDates).sort((a, b) => a < b ? 1 : -1)
}

const readAssignmentsFromDb = async() => {
  
  const {data: assignments, error} = await supabase.from('Assignments').select();
  error != undefined && console.error("Assignments", error);

  return assignments;

}


/*
export const  getStaticProps = async (context) => {

  const {wc} = context.params
  console.log('wc', wc, spacetime(wc).add(7,"days").format('iso'))

  const assignments = await readAssignmentsFromDb();
  const dueDates = allDueDates(assignments)
  console.log('dd', dueDates)

  let { data, error } = await supabase.rpc('get_no_work_submitted', {
        ifrom: wc, 
        ito: spacetime(wc).add(7,"days").format('iso')
      });

  error != undefined && console.error(error)
  //else console.log(data)


  
  return {
    revalidate: 60,
    props: {
      from: wc,
      to: spacetime(wc).add(7,"days").format('iso'),
      data,
      dueDates,
      created: DateTime.now().toObject()
    }, // will be passed to the page component as props
  }

}

export async function getStaticPaths() {

  console.log("getStaticPaths called")

  const assignments = await readAssignmentsFromDb()

  const dueDates = allDueDates(assignments)
  
  const paths = dueDates.map(dd => ({params: {wc: dd}}))

  return {
    paths,
    // paths: [{ params: { assignmentId: '5bd4eb36-ba95-48a3-aabc-12b5341d4209' } }
    fallback: false, // can also be true or 'blocking'
  }
}
*/