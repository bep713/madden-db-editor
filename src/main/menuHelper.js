import { shell } from 'electron';

export default {
  doUndo: function (menuItem, browserWindow, event) {
    browserWindow.webContents.send('undo');
  },

  doRedo: function (menuItem, browserWindow, event) {
    browserWindow.webContents.send('redo');
  },

  doSelectAll: function (menuItem, browserWindow, event) {
    browserWindow.webContents.send('select-all');
  },

  doRevealInExplorer: function (menuItem, browserWindow, event) {
    browserWindow.webContents.send('reveal-in-explorer');
  },

  showFilterWindow: function (menuItem, browserWindow, event) {
    browserWindow.webContents.send('show-filter-window');
  },

  clearFilters: function (menuItem, browserWindow, event) {
    browserWindow.webContents.send('clear-all-filters');
  },

  showPlaybookView: function (menuItem, browserWindow, event) {
    browserWindow.webContents.send('show-playbook-view');
  }
};