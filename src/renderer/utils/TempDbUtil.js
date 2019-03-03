import fs from 'fs';

const tempDbPath = 'temp/formatted/db';

export default {
  getTable: function (tableName) {
    const tableDataString = fs.readFileSync(`${tempDbPath}/${tableName}.json`);
    return JSON.parse(tableDataString);
  },

  writeTable: function (tableName, tableData) {
    fs.writeFileSync(`${tempDbPath}/${tableName}.json`, JSON.stringify(tableData));
  },

  fileIsPlaybook: function () {
    const playbookTablesToCheck = ['PBPL', 'SETL', 'PLYS']
    const dirContents = fs.readdirSync(tempDbPath);
    
    for (let playbookTable of playbookTablesToCheck) {
      if (!dirContents.includes(`${playbookTable}.json`)) {
        return false;
      }
    }

    return true;
  },

  fileIsCustomPlaybook: function () {
    if (this.fileIsPlaybook()) {
      const dirContents = fs.readdirSync(tempDbPath);
      if (dirContents.length === 23) {
        return false;
      }
    }

    return true;
  }
}