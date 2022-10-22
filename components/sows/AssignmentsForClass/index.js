import Assignment from "../Assignment"
import styled from 'styled-components';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { workWeekFromISO } from "../../../libs/spacetime";
import { DateTime } from "luxon";



const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'assignmentTitle',
    headerName: 'Title',
    width: 450,
    
  },
  {
    field: 'workWeek',
    headerName: 'Work Week',
    width: 150,
  },
  {
    field: 'dueDate',
    headerName: 'Due Date',
    width: 150,
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

const AssignmentsForClass = ({assignments, asc}) => {


    const assignmentArray = Object.values(assignments).reduce((lst, assignmentList) => {
        //console.log(lst, assignmentArray)
        return lst.concat(assignmentList.map(a => ({
            ...a, 
            id: a.assignmentId,
            dueDate: a.dueDate.substring(0, 10),
            workWeek : workWeekFromISO(a.dueDate).toISODate()
        })));
        // return lst;
    }, []).sort((a, b) => a.workWeek < b.workWeek ? 1 : -1);

    //console.log("AssignmentArray", assignmentArray);

    return  <>    
            <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={assignmentArray}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    checkboxSelection
                    disableSelectionOnClick
                    experimentalFeatures={{ newEditingApi: true }}
                />
            </Box>
                

                <div>
                    {Object.keys(assignments).map((a, i) => <Assignment key={i} week={a} assignment={assignments[a]}/>)}
                </div>
                <style jsx="true">{`

                    .assignment-card {
                        border: silver 1px solid;
                    }

                `}</style>
            </>
}

export default AssignmentsForClass