const { ipcRenderer } = require('electron');

ipcRenderer.on('set-text', (event, text) => {
  document.getElementById('edit-text').value = text;
});

document.getElementById('save-button').addEventListener('click', () => {
  const newText = document.getElementById('edit-text').value;
  ipcRenderer.send('save-text', newText);
});

document.getElementById('cancel-button').addEventListener('click', () => {
  ipcRenderer.send('cancel-edit');
});
