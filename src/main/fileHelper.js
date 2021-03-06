import { dialog } from 'electron';

export default {
  openFileWindow: function (menuItem, browserWindow, event) {
    const filePath = dialog.showOpenDialog(browserWindow, {
      title: 'Select DB file to open',
      filters: [{
        name: 'DB',
        extensions: ['db']
      }]
    });

    if (filePath) {
      openFile(filePath[0], browserWindow);
    }
  },

  openFile: function (filePath, browserWindow) {
    openFile(filePath, browserWindow);
  },

  closeFile: function (menuItem, browserWindow, event) {
    browserWindow.webContents.send('close-file');
  },

  saveFile: function (menuItem, browserWindow, event) {
    browserWindow.webContents.send('save')
  },

  saveAs: function (menuItem, browserWindow, event) {
    const filePath = dialog.showSaveDialog(browserWindow, {
      title: 'Save DB file as...',
      filters: [{
        name: 'DB',
        extensions: ['db']
      }]
    });

    browserWindow.webContents.send('save', filePath);
  },

  restore: function (menuItem, browserWindow, event) {
    let choice = dialog.showMessageBox(browserWindow, {
      type: 'question',
      buttons: ['Do not restore', 'Restore'],
      title: 'Restore original file',
      message: 'This can not be un-done. All saved changes will be lost from this session. The file will revert back to what it was when you opened it.'
    });

    if (choice === 1) {
      browserWindow.webContents.send('restore');
    }
  }
}

function openFile (filePath, browserWindow) {
  browserWindow.webContents.send('load-file', filePath);
};