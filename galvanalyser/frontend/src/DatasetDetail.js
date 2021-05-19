import React, { useEffect, useState } from "react";
import { ResponsiveLine } from '@nivo/line'
import { timeseries_column, columns } from './Api'

const TEST_TIME_COLUMN_ID = 1
const VOLTAGE_COLUMN_ID = 2
const AMPS_COLUMN_ID = 3


export default function DatasetChart({ dataset }) {
  const [timeseries, setTimeseries] = useState({})
  const [cols, setCols] = useState([])
  const [selectedColumns, setSelectedColumns] = useState([
    VOLTAGE_COLUMN_ID, AMPS_COLUMN_ID
  ])
  const [dsColumns, setDsColumns] = useState([])

  useEffect(() => {
    columns(dataset.id).then((response) => {
      if (response.ok) {
        return response.json().then(setCols);
      }
    });
  }, [dataset.id])

  const handleLegendClick = (d) => {
    if (cols.length === 0) {
      return;
    }
    const col = cols.filter((c) => c.name === d.id)[0];
    console.log('click', col.id);
    if (!(col.id in timeseries)) {
      timeseries_column(dataset.id, col.id).then(
        (array) => {
          setTimeseries(prevState => {
            console.log('updating timeseries', col.id);
            let newTimeseries = {...prevState};
            newTimeseries[col.id] = array;
            return newTimeseries;
          });
          setSelectedColumns(prevState => {
            return [...prevState, col.id];
          });
        }
      );
    } else {
      setSelectedColumns(prevState => {
        const filt = prevState.filter((id) => id !== col.id);
        if (filt.length < prevState.length) {
          return filt;
        } else {
          return [...prevState, col.id];
        }
      });
    }
  };

  useEffect(() => {
    const dlColumns = [
      TEST_TIME_COLUMN_ID, VOLTAGE_COLUMN_ID, AMPS_COLUMN_ID
    ];
    let new_timeseries = {};
    dlColumns.reduce( async (previousPromise, nextID) => {
      await previousPromise;
      return timeseries_column(dataset.id, nextID).then(
        (array) => {
          new_timeseries[nextID] = array;
        }
      );
    }, Promise.resolve()).then(() => {
      setTimeseries(new_timeseries);
    });
  }, [dataset]);

  let renderChart = false;
  const chart_data = cols.map((col) => {
    if (col.id === TEST_TIME_COLUMN_ID) {
      return null;
    }
    const defaultData = {
      id: col.name,
      data: [{
        x: 0,
        y: null,
      }]
    };
    if (!timeseries[TEST_TIME_COLUMN_ID]) {
      return defaultData;
    }
    if (!timeseries[col.id]) {
      return defaultData;
    }
    if (!selectedColumns.includes(col.id)) {
      return defaultData;
    }
    renderChart = true;
    let data = []
    let subsample = timeseries[col.id].length / 1000.0;
    if (subsample < 1) {
      subsample = 1.0;
    }
    const int_subsample = Math.round(subsample);
    for(let i = 0; i < timeseries[col.id].length; i += int_subsample) {
      data.push({
          x: timeseries[TEST_TIME_COLUMN_ID][i],
          y: timeseries[col.id][i],
      });
    }
    return {
      id: col.name,
      data: data,
    };
  }).filter((obj) => obj);

  console.log('rendering....', chart_data);

  return (
    <div style={{ height: 300, width: '100%' }}>
      {renderChart &&
      <ResponsiveLine
        data={chart_data}
        margin={{ top: 50, right: 160, bottom: 50, left: 60 }}
        enablePoints={false}
        xScale={{ type: 'linear' }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto'}}
        axisLeft={{
            legend: 'measurement',
            legendOffset: -40,
            legendPosition: 'middle'
        }}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            format: '.2f',
            legend: 'time',
            legendOffset: 36,
            legendPosition: 'middle'
        }}
        colors={{ scheme: 'spectral' }}
        lineWidth={1}
        legends={[
            {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 140,
                translateY: 0,
                itemsSpacing: 2,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 12,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                        }
                    }
                ],
                onClick: handleLegendClick,
            }
        ]}
        
    />
    }
    </div>
  )
 
}
