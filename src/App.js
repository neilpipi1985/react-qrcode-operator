import React, { useState, useCallback } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

// import HistoryIcon from '@material-ui/icons/History';
import AttachFileIcon from '@material-ui/icons/AttachFile';

import { useDropzone } from 'react-dropzone';
import XLSX from 'xlsx';

import QrReaderWarper from './QrReaderWarper';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

function asyncFileReader(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = new Uint8Array(e.target.result);
      const workbook = XLSX.read(buffer, {type: 'array'});
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const range = XLSX.utils.decode_range(worksheet['!ref']);
      range.s.r = 1; // <-- zero-indexed, so setting to headerRowIndex will skip row 0 - (headerRowIndex - 1)
      worksheet['!ref'] = XLSX.utils.encode_range(range);

      const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, header: 1 });
      return resolve(data);
    };
    reader.readAsArrayBuffer(file);
  });
}

export default function App() {
  const classes = useStyles();

  const [closeButtonColor, setCloseButtonColor] = useState('primary');
  const [reAutoScan, setReAutoScan] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContentText, setDialogContentText] = useState('');
  const [checkList, setCheckList] = useState([]);
  const [delayTime, setDelayTime] = useState(-1);
  const [autoScan, setAutoScan] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const list = await asyncFileReader(acceptedFiles[0]);
      setCheckList(list);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleQrReaderError = err => {
    console.error(err)
  };

  const handleQrReaderAutoScan = event =>  {
    setAutoScan(event.target.checked);
    setDelayTime(event.target.checked ? 500 : -1);
  };

  const handleQrReaderScanData = data => {
    console.log(null);
    if (checkList.length < 1) {
      // not on List
      setDelayTime(-1);
      setAutoScan(false);

      setReAutoScan(false);
      setDialogContentText('List is empty, please setup checking list.');
      setCloseButtonColor('secondary');
      setOpenDialog(true);
    } else if (data) {
      // on List
      setDelayTime(-1);
      setAutoScan(false);

      let isMatch = false;
      for (let i = 0; i < checkList.length; i += 1) {
        isMatch = (data === checkList[i][0]);
        if (isMatch) {
          break;
        }
      }

      setReAutoScan(true);
      setDialogContentText(isMatch ? `${data} is match.` : `${data} is NOT match.`);
      setCloseButtonColor(isMatch ? 'primary' : 'secondary');
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    if (reAutoScan) {
      setDelayTime(500);
      setAutoScan(true);
    }
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            QR-Operator
          </Typography>
          {/* <IconButton className={classes.menuButton} color="inherit" aria-label="History">
            <HistoryIcon />
          </IconButton> */}
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <IconButton className={classes.menuButton} color="inherit" aria-label="Attach File">
              <AttachFileIcon />
            </IconButton>
          </div>
          <FormControlLabel
            control={
              <Switch
                checked={autoScan}
                onChange={ handleQrReaderAutoScan }
                value="autoScan"
                color="secondary"
              />
            }
            label="Auto"
          />
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        <QrReaderWarper
          delay={delayTime}
          onError={handleQrReaderError}
          onScan={handleQrReaderScanData}
        />
      </Container>
      <Dialog
        open={openDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Result"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogContentText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color={closeButtonColor} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
