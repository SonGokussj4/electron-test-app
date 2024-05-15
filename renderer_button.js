const { ipcRenderer } = require('electron');

document.getElementById('edit-button').addEventListener('click', () => {
  const currentText = document.getElementById('main-text').innerText;
  ipcRenderer.send('open-edit-window', currentText);
});

ipcRenderer.on('set-text', (event, text) => {
  document.getElementById('main-text').innerText = text;
});

ipcRenderer.on('update-text', (event, newText) => {
  document.getElementById('main-text').innerText = newText;
});
