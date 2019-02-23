import { ipcRenderer } from 'electron';
import TableReader from './TableReader';
import TableWriter from './TableWriter';
import path from 'path';
import fs from 'fs';

let tableReader = new TableReader();
registerTableReaderListeners(tableReader);

let tableWriter = new TableWriter();
registerTableWriterListeners(tableWriter);

const tempDbPath = 'temp/formatted/db';

let currentFile;
// let tables = [];

ipcRenderer.on('load-file', function (event, arg) {
  console.time('read');
  try {
    tableReader = new TableReader();
    registerTableReaderListeners(tableReader);

    currentFile = {
      tables: []
    };

    // tables = [];

    const dirContents = fs.readdirSync(tempDbPath);
    for(const file of dirContents) {
      fs.unlinkSync(path.join(tempDbPath, file));
    }

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
    fs.writeFileSync(`${tempDbPath}/${table.tableName}.json`, JSON.stringify(table.tableData));
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