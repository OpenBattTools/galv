
import React, {useEffect, useState, useRef} from "react";
import { DataGrid, GridRowsProp, GridColDef } from '@material-ui/data-grid';
import Container from '@material-ui/core/Container';
import { datasets} from './Api';
import { makeStyles } from '@material-ui/core/styles';
import DatasetChart from './DatasetChart'
import DatasetMetadata from './DatasetMetadata'

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    height: '100%',
  },
}));



export default function Datasets() {
  const [data, setData] = useState([])
  const classes = useStyles();

  useEffect(() => {
    datasets().then((response) => {
      if (response.ok) {
        return response.json().then(setData);
      }
    });
  }, [])
  const columns: GridColDef[] = [
    { field: 'dataset_id', headerName: 'ID' },
    { field: 'name', headerName: 'Name', flex: true},
    { 
      field: 'date', headerName: 'Date', width: 120,
      valueFormatter: (params: GridValueFormatterParams) => {
        return Intl.DateTimeFormat('en-GB').format(params.value);
      }
    },
    { field: 'dataset_type', headerName: 'Type', width: 100 },
    { field: 'original_collector', headerName: 'User', width: 100 },
  ];

  const rows: GridRowsProp = data.map((d, i) => {
    return {
      id: i,
      dataset_id: d.id,
      name: d.name,
      dataset_type: d.dataset_type,
      original_collector: d.original_collector,
      date: Date.parse(d.date),
    };
  });

  const [select, setSelect] = useState(null)
  const handleSelectionChange = (e) => {
    setSelect(e.selectionModel[0]);
  };

  let autoHeight = true;
  let divStyle = { width: '100%' };
  if (select !== null) {
    console.log('selected', select);
    autoHeight = false;
    divStyle = { height: 300, width: '100%' };
  }

  return (
    <Container maxWidth="lg" className={classes.container}>
      <div style={divStyle}>
      <DataGrid 
        rows={rows} columns={columns} 
        density='compact'
        autoPageSize
        loading={rows.length === 0}
        rowHeight={38}
        autoHeight={autoHeight}
        onSelectionModelChange={handleSelectionChange}
      />
    </div>
    {data[select] &&
      <React.Fragment>
        <DatasetChart dataset={data[select]}/>
        <DatasetMetadata dataset={data[select]}/>
      </React.Fragment>
    }
    </Container>
  );
}
