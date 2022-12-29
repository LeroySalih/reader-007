import ProgressChart from "../../progress-chart";

const UnitSelector = ({unit, units, avgScores, handleSelectUnit}) => {

    const getAvgScoresForUnit = (unit) => {
        if (!unit)
            return [];
        
        return avgScores.filter( avg => unit.formativeTitles.includes(avg.formativeTitle) && unit.classes.includes(avg.className));
    }

    const calcAvgScore = (unit) => {
        
        const filteredAvgScores = getAvgScoresForUnit(unit)
        const maxPoints = 100 * unit.classes.length * unit.formativeTitles.length

        const sumOfAverageScores = filteredAvgScores.reduce((prev, curr)=> { return prev + curr.avg_score}, 0)
        
        //return sumOfAverageScores / filteredAvgScores.length
        return (sumOfAverageScores / maxPoints) * 100
    }

    if (!units) 
        return <h1>Loading</h1>

    return <div className="unit-selector">
    {units.map((u, i) => <div key={i} className={`unit-card ${u.title == unit?.title ? 'selected' : ''}`}>
        <div>
        <div className="subject">{u.subject}</div>
        <div className="title" onClick={() => handleSelectUnit(u.id)}>{u.title}</div>
        
        <div className="count">{u.classes.length} Classes</div>
        <div className="count">{u.formativeTitles.length} Formatives</div>
        <div className="avgScore">Avg Score: {calcAvgScore(u).toFixed(2)}%</div>
        </div>
        <div className="progress-chart-container">
            <ProgressChart progress={calcAvgScore(u)}/>
        </div>
        </div>)}
        <style jsx="true">{`
        
            .unit-card {
                border : solid 1px silver;
                border-radius: 1rem;
                margin: 1rem;
                padding: 1rem;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                max-width: 500px;
            }

            .selected {
                background-color : #e6f1ff;
            }

            .subject {
                color: #404040;
                font-size: 0.7rem;
            }

            .title {
                font-size: 1.5rem;
            }

            .count {
                color: #404040;
                font-size: 0.7rem;
            }

            .progress-chart-container {
                height: 4rem;
                width: 4rem;
            }
        `}</style>
    </div>
}

export default UnitSelector;