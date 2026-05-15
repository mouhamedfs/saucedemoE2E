import { faker } from '@faker-js/faker';
import * as fs from 'fs';

export const SIMPLE_BOOKS_BASE = 'https://simple-books-api.click';

export function newClientCredentials() {
  return {
    clientName: faker.person.fullName(),
    clientEmail: faker.internet.email(),
  };
}

export async function registerSimpleBooksClient(
  credentials: ReturnType<typeof newClientCredentials> = newClientCredentials(),
): Promise<{ accessToken: string }> {
  const response = await fetch(`${SIMPLE_BOOKS_BASE}/api-clients/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Simple Books register failed ${response.status}: ${text}`);
  }
  const body = (await response.json()) as { accessToken?: string };
  if (!body.accessToken) {
    throw new Error('No accessToken in register response');
  }
  return { accessToken: body.accessToken };
}

export function setDotEnvVar(envPath: string, key: string, value: string): void {
  const content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const lines = content.split(/\r?\n/);
  const idx = lines.findIndex((line) => {
    const m = line.match(/^\s*([^=#\s]+)\s*=/);
    return m?.[1] === key;
  });
  const entry = `${key}=${value}`;
  if (idx >= 0) lines[idx] = entry;
  else lines.push(entry);
  const out = lines.join('\n');
  fs.writeFileSync(envPath, out.endsWith('\n') ? out : `${out}\n`);
}
