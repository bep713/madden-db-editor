'use strict'

import { app, BrowserWindow, ipcMain, dialog, shell, Menu } from 'electron'
import store from '../renderer/store';
import fileHelper from './fileHelper';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, workerWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const workerURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9081`
  : `file://${__dirname}/worker.html`

const baseWindowTitle = 'Madden DB Editor';
let currentFilePath = '';
let resetTitle;

let menuItemIdsDependentOnFileLoaded = ['CloseFile', 'Undo', 'Redo', 'RevealInExplorer', 'ShowFilterWindow', 'ClearFilters', 'ShowPlaybookView', 'ShowSituationView', 'Restore'];
let menuItemIdsForSave = ['Save', 'SaveAs'];

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 600,
    useContentSize: true,
    width: 1200,
    icon: __dirname + '/icon.ico'
  })

  mainWindow.loadURL(winURL)
  require('./mainmenu');

  mainWindow.on('closed', () => {
    mainWindow = null
    workerWindow.close();
    workerWindow = null;
  })

  workerWindow = new BrowserWindow({
    height: 500,
    width: 1000,
    // show: process.env.NODE_ENV === 'development',
  });

  workerWindow.loadURL(workerURL)

  workerWindow.on('closed', () => {
    workerWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

addIpcListeners();

function addIpcListeners() {
  ipcMain.on('open-file', function (event, arg) {
    if (!arg || !arg.filePath) {
      fileHelper.openFileWindow(null, mainWindow);
    }
    else {
      fileHelper.openFile(arg.filePath, mainWindow);
    }
  });

  ipcMain.on('load-file', function (event, arg) {
    workerWindow.webContents.send('load-file', arg);
    currentFilePath = arg;
    setMainWindowTitle(`${baseWindowTitle} - ${arg}`);

    enableMenuIds(menuItemIdsDependentOnFileLoaded);
  });

  ipcMain.on('read-error', function (event, arg) {
    mainWindow.webContents.send('read-error', arg);

    let errorTitle, errorMessage;

    switch(arg.error.code) {
      case 'ENOENT':
        errorTitle = 'Error: File was not found';
        errorMessage = 'The selected file was not found'
        break
      default:
        errorTitle = 'Error opening file';
        errorMessage = 'There was an unknown error while opening the file.\nDetails: ' + JSON.stringify(arg)
    }

    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: errorTitle,
      message: errorMessage
    });

    setMainWindowTitle(baseWindowTitle);
    disableMenuIds(menuItemIdsDependentOnFileLoaded);
    disableMenuIds(menuItemIdsForSave);
  });

  ipcMain.on('table-header', function (event, arg) {
    mainWindow.webContents.send('table-header', arg);
  });

  ipcMain.on('table-data', function (event, arg) {
    mainWindow.webContents.send('table-data', arg);
  });

  ipcMain.on('table-field', function (event, arg) {
    mainWindow.webContents.send('table-field', arg);
  });

  ipcMain.on('table-done', function (event, arg) {
    mainWindow.webContents.send('table-done', arg);
  });

  ipcMain.on('read-done', function (event, arg) {
    mainWindow.webContents.send('read-done', arg);
    enableMenuIds(menuItemIdsForSave);
  });

  ipcMain.on('get-table-data', function (event, arg) {
    workerWindow.webContents.send('get-table-data', arg);
  });

  ipcMain.on('file-contents', function (event, arg) {
    mainWindow.webContents.send('file-contents', arg);
  });

  ipcMain.on('close-file', function (event, arg) {
    workerWindow.webContents.send('close-file');
    currentFilePath = '';
    setMainWindowTitle(baseWindowTitle);

    disableMenuIds(menuItemIdsDependentOnFileLoaded);
    disableMenuIds(menuItemIdsForSave);
  });

  ipcMain.on('write-file', function (event, arg) {
    workerWindow.webContents.send('write-file', arg);
  });

  ipcMain.on('write-records', function (event, arg) {
    arg.filePath = currentFilePath;
    workerWindow.webContents.send('write-records', arg);
    setMainWindowTitle(`${baseWindowTitle} - ${currentFilePath} - Saving...`)
  });

  ipcMain.on('write-records-new', function (event, arg) {
    workerWindow.webContents.send('write-records', arg);
    setMainWindowTitle(`${baseWindowTitle} - ${currentFilePath} - Saving...`)
  });

  ipcMain.on('write-done', function (event, arg) {
    clearWindowTitleResetTimeout();
    setMainWindowTitle(`${baseWindowTitle} - ${currentFilePath} - Saved`);

    resetTitle = setTimeout(() => {
      setMainWindowTitle(`${baseWindowTitle} - ${currentFilePath}`);
    }, 2000);
  });

  ipcMain.on('write-error', function (event, arg) {
    mainWindow.webContents.send('write-error', arg);

    let errorTitle, errorMessage;

    switch(arg.error.code) {
      case 'ENOENT':
        errorTitle = 'Error: File was not found';
        errorMessage = 'The selected file was not found'
        break
      default:
        errorTitle = 'Error writing file';
        errorMessage = 'There was an unknown error while writing the file.\nDetails: ' + JSON.stringify(arg)
    }

    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: errorTitle,
      message: errorMessage
    });

    clearWindowTitleResetTimeout();
    setMainWindowTitle(`${baseWindowTitle} - ${currentFilePath} - Error: Could Not Save`);

    setTimeout(() => {
      setMainWindowTitle(`${baseWindowTitle} - ${currentFilePath}`);
    }, 3500);
  });

  ipcMain.on('set-window-title', function (event, arg) {
    let windowTitle = arg.title;
    setMainWindowTitle(windowTitle);
  });

  ipcMain.on('reveal-in-explorer', function (event, arg) {
    if (currentFilePath) {
      shell.showItemInFolder(currentFilePath);
    }
  });

  ipcMain.on('restore', function (event, arg) {
    workerWindow.webContents.send('restore');
  });
};

function enableMenuIds(menuItems) {
  return mutateMenuIds(menuItems, 'enabled', true);
};

function disableMenuIds(menuItems) {
  return mutateMenuIds(menuItems, 'enabled', false);
};

function mutateMenuIds(menuItems, key, value) {
  const menu = Menu.getApplicationMenu();

  if (menu) {
    menuItems.forEach((id) => {
      const item = menu.getMenuItemById(id);
      if (item) {
        item[key] = value;
      }
    });
  }
};

function clearWindowTitleResetTimeout() {
  clearTimeout(resetTitle);
}

function setMainWindowTitle(windowTitle) {
  mainWindow.setTitle(windowTitle);
};

function getMainWindowTitle() {
  return mainWindow.getTitle();
};

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
