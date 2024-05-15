const { contextBridge, ipcRenderer } = require('electron');
const { dialog } = require('electron').remote;

contextBridge.exposeInMainWorld('electron', {
  showOpenDialog: async (options) => {
    return await dialog.showOpenDialog(options);
  },
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  }
});
