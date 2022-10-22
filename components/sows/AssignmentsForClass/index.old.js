import Assignment from "../Assignment"

const AssignmentsForClass = ({assignments, asc}) => {
    console.log("Assignments", assignments)
    return  <>
                
                <div>{Object.keys(assignments).map((a, i) => <Assignment key={i} week={a} assignment={assignments[a]}/>)}</div>
                <style jsx="true">{`

                    .assignment-card {
                        border: silver 1px solid;
                    }

                `}</style>
            </>
}

export default AssignmentsForClass