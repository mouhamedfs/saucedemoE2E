import { exec } from 'node:child_process';
import * as fs from 'node:fs';

export default async function globalTeardown() {
  // Generate Allure HTML report after the test run.
  // If there are no results, skip.
  if (!fs.existsSync('allure-results')) return;

  exec('npx allure generate allure-results -o allure-report --clean', {
  });

  exec('npx allure serve allure-results', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing command: ${error}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
}

