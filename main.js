const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let editWindow;
let pythonProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.on('did-finish-load', async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/get-text');
      const data = await response.json();
      mainWindow.webContents.send('set-text', data.text);
    } catch (error) {
      console.error('Failed to fetch text:', error);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createEditWindow(currentText) {
  if (editWindow) {
    editWindow.focus();
    return;
  }

  editWindow = new BrowserWindow({
    width: 400,
    height: 300,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  editWindow.loadFile('edit.html');
  editWindow.webContents.on('did-finish-load', () => {
    editWindow.webContents.send('set-text', currentText);
  });

  editWindow.on('closed', () => {
    editWindow = null;
  });

  ipcMain.once('save-text', async (event, newText) => {
    try {
      await fetch('http://127.0.0.1:8000/set-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newText })
      });
      mainWindow.webContents.send('update-text', newText);
    } catch (error) {
      console.error('Failed to save text:', error);
    }
    editWindow.close();
  });

  ipcMain.once('cancel-edit', () => {
    editWindow.close();
  });
}

app.whenReady().then(() => {
  // Path to the Python executable within your virtual environment
  const venvDir = path.join(__dirname, '.venv', 'Scripts');
  // const venvDir = path.join(__dirname, 'resources', 'app', '.venv', 'Scripts');
  const pythonExecutable = path.join(venvDir, 'python.exe');

  pythonProcess = spawn(pythonExecutable, [
    '-m',
    'uvicorn',
    'server:app',
    '--host',
    '127.0.0.1',
    '--port',
    '8000',
    '--reload'
  ]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  createWindow();

  ipcMain.on('open-edit-window', (event, currentText) => {
    createEditWindow(currentText);
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
  pythonProcess.kill();
});
