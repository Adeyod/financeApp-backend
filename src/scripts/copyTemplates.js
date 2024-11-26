import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import ncp from 'ncp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to copy the templates from src to dist
const copyTemplates = () => {
  const sourceDir = path.join(__dirname, '../utils/templates');
  const destinationDir = path.join(__dirname, '../../dist/utils/templates');

  ncp(sourceDir, destinationDir, function (err) {
    if (err) {
      return console.error('Error copying templates:', err);
    }
    console.log('Templates copied successfully!');
  });
};

copyTemplates();
