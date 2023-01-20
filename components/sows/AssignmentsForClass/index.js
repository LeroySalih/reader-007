import Assignment from "../Assignment"
import styled from 'styled-components';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { workWeekFromISO } from "../../../libs/spacetime";
import { DateTime } from "luxon";

import Button from '@mui/material/Button';
import Avatar from "@mui/material";
import { IconButton } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";



const TeamsButton = styled.img`
    width: 30px;
    height: 30px;
    filter: saturate(0%);
    opacity: 30%;

    &:hover {
        filter: saturate(100%);
        opacity: 100%;
    }

`

const columns = [
  
  {
    field: 'workWeek',
    headerName: 'Work Week',
    width: 150,
  },
  {
    field: 'assignmentTitle',
    headerName: 'Title',
    width: 450,
    
  },
  {
    field: 'dueDate',
    headerName: 'Due Date',
    width: 150,
  },
  {
    field: 'webUrl',
    headerName: 'Teams Link',
    width: 100,
    headerAlign: 'center',
    align: 'center',
    renderCell : (params) => (<a href={params.value} target="_new"><TeamsButton src="/images/teams-logo.png"/></a>)
  },
  {
    field: 'hasRubric',
    headerName: 'Has Rubric',
    width: 100,
    headerAlign: 'center',
    align: 'center',
    renderCell : (params) => ( params.value == "true" ? <a href={`rubric-summary/${params.row['id']}`} target="_new"><TeamsButton src="/images/rubric-logo.png"/></a> : "")
  },
 


  

];

const rows = [
    {   id: 1, 
        workWeek: 'Snow', 
        assignmentName: 'Jon', 
        dueDate: 35 },
    {   id: 2, 
        workWeek: 'Lannister', 
        assignmentName: 'Cersei', 
        dueDate: 42 },
    {   id: 3, 
        workWeek: 'Lannister', 
        assignmentName: 'Jaime', 
        dueDate: 45 },
    {   id: 4, 
        workWeek: 'Stark', 
        assignmentName: 'Arya', 
        dueDate: 16 },
    
  ];

const AssignmentsForClass = ({assignments, asc, onSelectionChange}) => {


    const assignmentArray = Object.values(assignments).reduce((lst, assignmentList) => {
        
        return lst.concat(assignmentList.map(a => ({
            ...a, 
            id: a.assignmentId,
            dueDate: a.dueDate.substring(0, 10),
            workWeek : workWeekFromISO(a.dueDate).toISODate()
        })));
        // return lst;
    }, []).sort((a, b) => a.workWeek < b.workWeek ? 1 : -1);

    

    return  <>    
            <Box sx={{ height: 800, width: '100%' }}>
                <DataGrid
                    rows={assignmentArray}
                    columns={columns}
                    pageSize={20}
                    rowsPerPageOptions={[20, 40, 100]}
                    checkboxSelection
                    disableSelectionOnClick
                    onSelectionModelChange={onSelectionChange}
                    experimentalFeatures={{ newEditingApi: true }}
                />
            </Box>
                
                {/*
                <div>
                    {Object.keys(assignments).map((a, i) => <Assignment key={i} week={a} assignment={assignments[a]}/>)}
                </div>
                */}
                <style jsx="true">{`

                    .assignment-card {
                        border: silver 1px solid;
                    }

                    

                `}</style>
            </>
}

export default AssignmentsForClass