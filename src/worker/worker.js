import { ipcRenderer } from 'electron';
import TableReader from './TableReader';
import TableWriter from './TableWriter';
import TempDbUtil from '../renderer/utils/TempDbUtil';
import path from 'path';
import fs from 'fs';

let tableReader = new TableReader();
registerTableReaderListeners(tableReader);

let tableWriter = new TableWriter();
registerTableWriterListeners(tableWriter);

const tempDbPath = 'temp/formatted/db';
const backupPath = 'temp/backup';

let currentFile;

ipcRenderer.on('load-file', function (event, arg) {
  console.time('read');
  try {
    tableReader = new TableReader();
    registerTableReaderListeners(tableReader);

    currentFile = {
      tables: []
    };

    if (!fs.existsSync(tempDbPath)) {
      if (!fs.existsSync('temp')) {
        fs.mkdirSync('temp');
      }

      if (!fs.existsSync('temp/formatted')) {
        fs.mkdirSync('temp/formatted');
      }

      if (!fs.existsSync('temp/formatted/db')) {
        fs.mkdirSync('temp/formatted/db');
      }

      if (!fs.existsSync('temp/backup')) {
        fs.mkdirSync('temp/backup');
      }
    }

    const dirContents = fs.readdirSync(tempDbPath);
    for(const file of dirContents) {
      fs.unlinkSync(path.join(tempDbPath, file));
    }

    makeBackupOfFile(arg);
    tableReader.readTablesInFile(arg);
  }
  catch (err) {
    console.log(err);
    ipcRenderer.send('read-error', { filePath: arg, error: err });
  }
});

ipcRenderer.on('close-file', function (event, arg) {
  tableReader = null;
});

ipcRenderer.on('write-file', function (event, arg) {
  try {
    tableWriter.writeTablesToFile(arg, currentFile);
  }
  catch (err) {
    console.log(err);
    ipcRenderer.send('write-error', { filePath: arg, error: err });
  }
});

ipcRenderer.on('write-records', function (event, arg) {
  try {
    tableWriter.writeRecordsToFile(arg, currentFile);
  }
  catch (err) {
    console.log(err);
    ipcRenderer.send('write-error', { filePath: arg, error: err });
  }
});

ipcRenderer.on('get-table-data', function (event, arg) {
  ipcRenderer.send('table-data', table);
});

ipcRenderer.on('restore', function (event, arg) {
  console.log('restoring');
});

function registerTableReaderListeners(tableReader) {
  tableReader.on('raw-file', (data) => {
    currentFile.buffer = data;
  });

  tableReader.on('file-header', (data) => {
    currentFile.header = data;
  });

  tableReader.on('table-header', (table) => {
    ipcRenderer.send('table-header', table);
    // tables.push(table);
  });

  tableReader.on('table-definition', (def) => {
    currentFile.tables.push(def);
  });
  
  // tableReader.on('table', (table) => {
  //   ipcRenderer.send('table-data', table);
  // });

  // tableReader.on('table-field', (record) => {
  //   // const tableIndex = tables.findIndex((table) => { return table.definition.name === record.tableName });
  //   // console.log(record);
  //   // tables[tableIndex].frields.push(record.field);
  //   // currentFile.tables[tableIndex].fields.push(record.field);
  //   // ipcRenderer.send('table-field', record);
  // });

  tableReader.on('table-done', (table) => {
    TempDbUtil.writeTable(table.tableName, table.tableData);
    // fs.writeFileSync(`${tempDbPath}/${table.tableName}.json`, JSON.stringify(table.tableData));
    ipcRenderer.send('table-done', table.tableName);
  });

  tableReader.on('read-done', () => {
    ipcRenderer.send('read-done');
    console.timeEnd('read');
  });
};

function registerTableWriterListeners(tableWriter) {
  tableWriter.on('write-done', () => {
    ipcRenderer.send('write-done');
  });
};

function makeBackupOfFile(arg) {
  const fileName = arg.substring(arg.lastIndexOf('\\') + 1);
  copyFile(arg, `${backupPath}/backup.db`, function (err) {
    if (err) {
      console.log(err);
    }
  });
};

function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
};