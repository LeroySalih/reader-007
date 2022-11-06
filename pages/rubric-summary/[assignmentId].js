import {useRouter} from 'next/router'
import { supabase } from '../../config/supabase';
import {useState} from 'react';

import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { UndoRounded } from '@mui/icons-material';
import Link from 'next/link';
import numeral from 'numeral';
import { v4 as uuid } from 'uuid';
import { CSVLink, CSVDownload } from "react-csv";


import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';


const LightTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.white,
      color: 'rgba(0, 0, 0, 0.87)',
      boxShadow: theme.shadows[1],
      fontSize: 11,
    },
  }));

  const calcUserScore = (user) => {
    

    const score = Object.values(user.qualities).reduce((group, item) => {return group + item.index}, 0)
    const max = Object.values(user.qualities)?.length * 3
    const scorePct = 1 - (score / max)

    return scorePct;
}


function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <div>{children}</div>
          </Box>
        )}
      </div>
    );
  }
  

const AssignmentPage = ({
        assignment, 
        //levels, 
        //criteria, 
        //rubricOutcomes, 
        //users, 
        classData, 
        shapedCriteria,
        userCriteria
    }) => {

    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const router = useRouter();
    //console.log("Assignment", assignment)
    //console.log("levels", levels)  
    //console.log("criteria", criteria)
    //console.log("rubricOutcomes", rubricOutcomes)
    // console.log("groupedOutcomes", groupedOutcomes)
    //console.log("Users", users)
    ///onsole.log("classData", classData) 

    // const {assignmentId} = router.query 
    //if (!assignment)
     //   return <div>Loading</div>

    const studentCsv = () => {
        return [["class", "givenName", "surname", "score"], 
            ...Object.values(userCriteria).map((user, index) => 
            [
                classData.displayName,
                user.user?.givenName || user.user,
                user.user?.surname || "",
                (user.qualities && numeral(calcUserScore(user) * 100).format("00")) || null
            ]
        )]
    }

   
   
    
    return <>
        <div className="pageLayout">
                <div className="assignmentTitle">{assignment.displayName}</div>
                <div className="classTitle">{classData.displayName}</div>
                
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Class Summary"  />
                        <Tab label="Pupil Details"  />
                        
                        </Tabs>
                    </Box>
                    <TabPanel value={value} index={0}>
                    <div>
                    {shapedCriteria && <div>
                           

                            {Object.values(shapedCriteria)
                                    .sort((a, b) => a.qualityDescription > b.qualityDescription ? 1 : -1)
                                    .map(quality => (
                                <div key={uuid()}  className="quality">
                                    <div className="qualityDescription">{quality.qualityDescription}</div>
                                
                                    <div className="criteriaContainer">
                                        {Object.values(quality.criteria).map((c, i) => 
                                        <div key={uuid()} className="criteriaDescription"><div>{c.criteriaDescription}</div> 
                                            <div>{c.users ? c.users.length : 0} pupil(s)</div>
                                        </div>)}
                                    </div>
                                </div>
                            ))}
                        </div>}
                </div>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                    <div key={uuid()}>
                    
                    {userCriteria &&
                        <div key={uuid()}>
                             <div>
                                <CSVLink data={studentCsv()}>Download Class Details</CSVLink>
                            </div>
                            <div key={uuid()}>
                                
                                {Object.values(userCriteria)
                                    .sort((a, b) => a.user.givenName > b.user.givenName ?  1 : -1)
                                    .map(user => 
                                    <div key={uuid()}>
                                        
                                        <div key={uuid()}>
                                            {user.user.givenName ? `${user.user.givenName} ${user.user.surname} ${numeral(calcUserScore(user) * 100).format('00')}%` : `${user.user}`}
                                        </div>
                                        <ul>{
                                                Object.values(user.qualities)   
                                                    .sort((a, b) => a.qualityDescription > b.qualityDescription ? 1 : -1)
                                                    .map((quality) => <li key={`desc-${uuid()}`}>{quality.qualityDescription} <span key={`index-${uuid()}`}>{3 - quality.index}</span></li>)

                                            }
                                        </ul>
                                        
                                </div>)}
                            
                            </div>
                            
                        </div>
                    
                    }
                </div>
                    </TabPanel>
                    
                    </Box>

                
                
                
                
                
                
                
            
        </div>
        <style jsx="true">{`

                @import url('https://fonts.googleapis.com/css2?family=Oswald&family=Roboto:wght@300&display=swap');

                .page-layout {
                    width: 80vw;
                    margin: auto;

                }

                .assignmentTitle {
                    margin-top: 2rem;
                    font-family: 'Roboto', sans-serif;
                    font-size: 3rem;
                    padding-left: 2rem;
                    border-bottom: solid silver 1px;
                }

                .classTitle {
                    font-family: 'Roboto', sans-serif;
                    font-size: 2rem;
                    padding-left: 2rem;
                    margin-bottom: 3rem;
                }

                .quality {
                    
                }

                .qualityDescription {
                
                    font-family: 'Roboto', sans-serif;
                    font-size: 1.4rem;
                    padding-left: 2rem;
                    font-weight: bold;
                }

                .criteriaContainer{
                    display: flex;
                }


                .criteriaDescription {
                    width: 300px;
                    border: silver 1px solid;
                    margin: 1rem;
                    -webkit-border-radius: 1rem;
                    -moz-border-radius: 1rem;
                    border-radius: 1rem;
                    padding: 1rem;
                    font-family: "Oswald",sans-serif;
                    font-size: 0.8rem;
                    display: flex;
                    align-content: space-around;
                    flex-direction: column;
                    justify-content: space-between;
                    align-items: stretch;
                }
        
        `}
        </style>
    </>
}

export default AssignmentPage;


export async function getStaticPaths() {


    const {data, error} = await supabase.from('Assignments').select().eq("hasRubric", true);
    error != undefined && console.error("Assignments", error);
    const paths = data.map(a => {return {params: {assignmentId: a.id}}});
    //console.log(paths)
    return {
      paths,
      // paths: [{ params: { assignmentId: '5bd4eb36-ba95-48a3-aabc-12b5341d4209' } }
      fallback: false, // can also be true or 'blocking'
    }
  }


  

export async function getStaticProps(context) {

    const {assignmentId} = context.params;
    

    const {data: assignment, error} = await supabase.from('Assignments').select().eq('id', assignmentId).maybeSingle();
    error != undefined && console.error("Assignment Error", error);

    const {data: levels, error: levelsError} = await supabase.from('AssignmentRubricLevels').select().eq('assignmentId', assignmentId);
    levelsError != undefined && console.error("Error Levels", levelsError);

    const {data: criteria, error: criteriaError} = await supabase.from('AssignmentRubricQualityCriteria').select().eq('assignmentId', assignmentId);
    criteriaError != undefined && console.error("Error Levels", criteriaError);

    // console.log("assignmentId", assignmentId)
    const {data: rubricOutcomes, error: rubricError} = await supabase.from("RubricOutcomes").select().eq('assignmentId', assignmentId);
    rubricError != undefined && console.error("Rubric Error", rubricError);

    const {data: users, error: userError} = await supabase.from("Users").select()
    userError != undefined && console.error("User Error", users)

    const {data: classData, error: classError} = await supabase.from("Classes").select().eq("id", assignment.classId).maybeSingle()
    classError != undefined && console.error("Class Error", classError);


    // Shape criteria

    const shapedCriteria = {}

    for (const c of criteria){
        if (shapedCriteria[c.qualityId] === undefined) {
            shapedCriteria[c.qualityId] = {
                qualityId: c.qualityId, 
                qualityDescription: c.qualityDescription,
                userCount: 0, 
                criteria: {}}
        }

        shapedCriteria[c.qualityId].criteria[c.index] = {
            index: c.index, 
            criteriaDescription: c.description
        }
    }

    for (const ro of rubricOutcomes){
        if (ro.columnId != null){
            const index = levels.filter(l => l.levelId == ro.columnId)[0].index 

            if (shapedCriteria[ro.qualityId].criteria[index].users === undefined){
                shapedCriteria[ro.qualityId].criteria[index].users = []
            }

            shapedCriteria[ro.qualityId].userCount += 1
            shapedCriteria[ro.qualityId].criteria[index].users.push(ro.userId)
        }
        
    }

    const userCriteria = rubricOutcomes.reduce( ( group, item ) => {
        try{

            if (group[item.userId] === undefined){
                // user data
               const user = users.filter(u => u.id == item.userId)[0] || item.userId
   
               group[item.userId] = {user,  qualities: {}}
           }
           
           // index of applied level / column
           const index = levels.filter(l => l.levelId == item.columnId)[0].index
   
           // data for current quality
           const quality = criteria.filter(c => c.qualityId == item.qualityId && c.index == index)[0]
   
           group[item.userId].qualities[item.qualityId] = {
               qualityId : item.qualityId, 
               qualityDescription: quality.qualityDescription, 
               levelDescription: quality.description,
               columnId: item.columnId, 
               index}
      
           return group;
        }
        catch (error) {
            console.error("Error!", error.message, item)
            return group;
        }
        
    } , {})
    
    return {
      revalidate: 60,
      props: {
         assignment, 
       // levels,
       // criteria,
       // rubricOutcomes,
       // users : users,
        classData, 
        shapedCriteria,
        userCriteria 
        }, 
    }
  }

