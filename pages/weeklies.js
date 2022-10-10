
import { useState, useEffect } from "react"
import { supabase }  from "../config/supabase"

import spacetime from 'spacetime'


import {DeptClasses} from "../config"
import styled from "styled-components";
import { dueWeek, dueWeekFromISO } from "../libs/spacetime";


const ClassId = styled.div`
background-color: ${props => props.status ? "#7cbb7c" : "#f1b0b0"};
border-radius: 1rem;
width: 4rem;
line-height: 2rem;
display: flex;
justify-content: center;
font-weight: 700;

`
const AssignmentTitle = styled.div`
    font-family: 'Poppins', sans-serif;

`
const DueDate = styled.div`
    font-family: 'Roboto', sans-serif;
`
export const Weeklies = () => {

    const [classAssignemnts, setClassAssignments] = useState(null);
    const [currentWeek, setCurrentWeek] = useState(null);

    const getClassAsignments = async () => {
        const {data, error} = await supabase
                                    .rpc("getclassassignments")

        error && console.error(error)
        
        setClassAssignments(data)

        return data
    }

    useEffect(()=>{
        getClassAsignments()
        
    }, [])

    useEffect(()=>{
        classAssignemnts && setCurrentWeek(weeks()[0])
    }, 
    [classAssignemnts])


    const configureClassAssignments = (classAssignemnts) => {
        
        if (classAssignemnts === null){
            return
        }
        return classAssignemnts
                    .map(ca => {
                        /*const dueWeek = spacetime(ca["dueDate"])
                                            .weekStart("Sunday")
                                            .startOf('week')
                                            .format("yyyy-mmm-dd")
                        */


                        

                        return {...ca, 
                                assignmentTitle:ca["assignmentTitle"], 
                                dueDate: ca["dueDate"],
                                dueWeek: dueWeekFromISO(ca["dueDate"]).toISODate()}
                        }
                    )
                    .reduce( (prev, curr) => { 

                        if (prev[curr.dueWeek] == null){
                            prev[curr.dueWeek] = {}
                        }
                            
                        prev[curr.dueWeek][curr.className] = {
                            assignmentTitle: curr["assignmentTitle"], 
                            dueWeek: curr["dueWeek"],
                            dueDate: curr.dueDate,
                            webUrl : curr.webUrl
                        }
                        
                        return prev;

                    }, {})
    }


    const handleSelectWeek = (value) => {
        setCurrentWeek(value)
    }

    const weeks = () => {

        if (classAssignemnts === null) {
            return []
        }

        return Object.keys(configureClassAssignments(classAssignemnts))
                        .sort( (a,b) => a < b ? 1 : -1)

    }
 
    return <>
        <h1>Weeklies for W/C {classAssignemnts && currentWeek && <SelectWeek weeks={weeks()} onChange={handleSelectWeek} value={currentWeek}/>}</h1> 
        
        {
                classAssignemnts !== null && 
                currentWeek && 
                <table>
                    <tbody>
                    <tr>
                        <td>
                            <table>
                                <ClassAssignments 
                                    classAssignemnts={configureClassAssignments(classAssignemnts)} 
                                    currentWeek={currentWeek}/>
                            </table>
                        </td>
                        <td style={{verticalAlign: "baseline"}}>
                            <ClassAssignmentsSummary 
                                    classAssignemnts={configureClassAssignments(classAssignemnts)} 
                                    currentWeek={currentWeek}/>
                        </td>
                    </tr>
                    </tbody>
                </table>
                
        } 
        </>
}



const SelectWeek = ({weeks, onChange, value}) => {
    
    return weeks ? <select onChange={(e) => onChange(e.target.value)} value={value}>
        {weeks && weeks.map(w => <option key={w} value={w}>{w}</option>)}
    </select> : <></>
}

const ClassAssignments = ({classAssignemnts, currentWeek}) => {
    
    if (classAssignemnts === null)
        return <pre></pre>

    return <>
        <tbody>
            {DeptClasses.map((dc, i) => <tr key={i}>
                <td><ClassId status={classAssignemnts[currentWeek][dc] && classAssignemnts[currentWeek][dc]["assignmentTitle"].length > 0}>{dc}</ClassId></td>
                <td >
                    <a href={classAssignemnts[currentWeek][dc] && classAssignemnts[currentWeek][dc]["webUrl"]}
                        target="_new"
                        >
                            <AssignmentTitle>{classAssignemnts[currentWeek][dc] && classAssignemnts[currentWeek][dc]["assignmentTitle"]}</AssignmentTitle>
                        </a>
                    </td> 
                
            </tr>)}
           
        </tbody>
    </>
}

const ClassAssignmentsSummary =({classAssignemnts, currentWeek}) => {

    const currentData = classAssignemnts[currentWeek];

    return <>
                <table>
                    <tbody>
                    <tr><td colSpan="5"><h4>Team Summary Table</h4></td></tr>
                    <tr>
                        <td>Tim</td>
                        <td><ClassId status={currentData['7A_It1'] != undefined}>7A_It1</ClassId></td>
                        <td><ClassId status={currentData['7B_It1'] != undefined}>7B_It1</ClassId></td>
                        <td><ClassId status={currentData['8A_It1'] != undefined}>8A_It1</ClassId></td>
                        <td><ClassId status={currentData['8B_It1'] != undefined}>8B_It1</ClassId></td>
                        <td><ClassId status={currentData['9A_It1'] != undefined}>9A_It1</ClassId></td>
                        <td><ClassId status={currentData['9B_It1'] != undefined}>9B_It1</ClassId></td>
                        <td><ClassId status={currentData['10IT']   != undefined}>10IT1</ClassId></td>
                        <td><ClassId status={currentData['11IT']   != undefined}>11IT1</ClassId></td>
                    </tr>
                    <tr>
                        <td>Tony</td>
                        {
                            ['10EC', '10BS2', '11EC', '11BS2', '12BS', '13BS'].map((c, i) => <td key={i}><ClassId  status={currentData[c] != undefined}>{c}</ClassId></td>)
                        }
                        
                    </tr>
                    <tr>
                        <td>Leroy</td>
                        {
                            ['7C_It1', '8C_It1', '9C_It1', '10BS1', '10CS', '11BS1', '11CS'].map((c, i) => <td key={i}><ClassId status={currentData[c] != undefined}>{c}</ClassId></td>)
                        }
                    </tr>
                    </tbody>
                </table>
                
          </>

}

export default Weeklies; 