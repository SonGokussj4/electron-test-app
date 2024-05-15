const Papa = require('papaparse');

document.getElementById('open-button').addEventListener('click', async () => {
  try {
    const { canceled, filePaths } = await window.electron.showOpenDialog({
      filters: [{ name: 'CSV Files', extensions: ['csv'] }],
      properties: ['openFile']
    });

    if (!canceled && filePaths.length > 0) {
      readFile(filePaths[0]);
    }
  } catch (error) {
    console.error('Error opening file dialog:', error);
  }
});

const dropArea = document.getElementById('drop-area');

dropArea.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropArea.style.backgroundColor = '#e0e0e0';
});

dropArea.addEventListener('dragleave', () => {
  dropArea.style.backgroundColor = '#f0f0f0';
});

dropArea.addEventListener('drop', (event) => {
  event.preventDefault();
  dropArea.style.backgroundColor = '#f0f0f0';

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    readFile(files[0].path);
  }
});

function readFile(filePath) {
  const fs = require('fs');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }
    parseCSV(data);
  });
}

function parseCSV(data) {
  Papa.parse(data, {
    header: true,
    complete: function(results) {
      displayTable(results.data);
    }
  });
}

function displayTable(data) {
  const tableContainer = document.getElementById('table-container');
  tableContainer.innerHTML = ''; // Clear any existing table

  if (data.length === 0) {
    tableContainer.innerHTML = '<p>No data found in CSV file.</p>';
    return;
  }

  const table = document.createElement('table');
  const headerRow = document.createElement('tr');

  // Create header row
  Object.keys(data[0]).forEach(key => {
    const th = document.createElement('th');
    th.textContent = key;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Create data rows
  data.forEach(row => {
    const tr = document.createElement('tr');
    Object.values(row).forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  tableContainer.appendChild(table);
}
