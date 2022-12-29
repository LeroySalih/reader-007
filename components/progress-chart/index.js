
import { Chart } from 'primereact/chart';
import { useState, useEffect } from 'react';

const ProgressChart = ({progress}) => {

    const chartSeries = (progress) => ({
        labels: ['Progress', 'TBC'],
        datasets: [
            {
                data: [progress, 100-progress],
                backgroundColor: [
                    "#66BB6A",
                    "#d13734",
                    
                ],
                hoverBackgroundColor: [
                    "#81C784",
                    "#c27674",
                ]
            }
        ]
    });

    const [chartData, setChartData] = useState(chartSeries(0));

    const [lightOptions] = useState({
        plugins: {
            legend: {
                display: false,
                labels: {
                    color: '#495057'
                }
            }
        }
    });


    useEffect(()=> {
        setChartData(chartSeries(progress))

    }, [progress])

    return <Chart type="pie" data={chartData} options={lightOptions} style={{ position: 'relative', width: '100%', height: '100%' }} />
}

export default ProgressChart;