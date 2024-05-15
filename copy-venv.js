const fs = require('fs-extra');
const path = require('path');

module.exports = async function (context) {
  const srcDir = path.join(__dirname, '.venv');
  const destDir = path.join(context.appOutDir, 'resources', 'app', '.venv');

  try {
    await fs.copy(srcDir, destDir);
    console.log('Virtual environment copied successfully.');
  } catch (err) {
    console.error('Error copying virtual environment:', err);
  }
};
