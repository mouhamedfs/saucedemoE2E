import { exec } from 'node:child_process';
import * as fs from 'node:fs';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export default async function globalTeardown() {
  if (!fs.existsSync('allure-results')) return;

  await execAsync('npx allure generate allure-results -o allure-report --clean');
}
