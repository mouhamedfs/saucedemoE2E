import { test, expect } from '@playwright/test';
import * as path from 'path';
import {
  newClientCredentials,
  setDotEnvVar,
  SIMPLE_BOOKS_BASE,
} from '../../utils/simpleBooksAuth';

const baseURL = SIMPLE_BOOKS_BASE;
const envFile = path.resolve(__dirname, '../../.env');

test('Get Status on Book API', async ({ request }) => {
  const response = await request.get(`${baseURL}/status`);
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody.status).toBe('OK');
});

test('Authenticate with the API', async ({ request }) => {
  const credentials = newClientCredentials();
  const response = await request.post(`${baseURL}/api-clients/`, {
    data: credentials,
  });
  expect(response.status()).toBe(201);
  const responseBody = await response.json();
  expect(responseBody.accessToken).toBeTruthy();

  const accessToken = responseBody.accessToken as string;
  setDotEnvVar(envFile, 'API_TOKEN', accessToken);
  process.env.API_TOKEN = accessToken;
});

test('Get a list of books', async ({ request }) => {
  const response = await request.get(`${baseURL}/books`);
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(Array.isArray(responseBody)).toBeTruthy();
});

test('Get a book by id (param: use ids from books list)', async ({ request }) => {
  const listResponse = await request.get(`${baseURL}/books`);
  expect(listResponse.status()).toBe(200);

  const books = await listResponse.json();
  const ids = (Array.isArray(books) ? books : [])
    .map((b: any) => b?.id)
    .filter((id: any) => typeof id === 'number')
    .slice(0, 3);

  expect(ids.length).toBeGreaterThan(0);

  for (const id of ids) {
    const response = await request.get(`${baseURL}/books/${id}`);
    expect(response.status(), `GET /books/${id} should return 200`).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({ id });
  }
});

test('Submit order for a book', async ({ request }) => {
  const token = process.env.API_TOKEN;

  const response = await request.post(`${baseURL}/orders`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: {
      bookId: 1,
      customerName: 'John Doe',
    },
  });
  expect(response.status()).toBe(201);
  const responseBody = await response.json();
  expect(responseBody).toMatchObject({ created: true });
  expect(responseBody.orderId).toBeTruthy();
});

test('Get all orders', async ({ request }) => {
    const token = process.env.API_TOKEN;
    const response = await request.get(`${baseURL}/orders`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    console.log(responseBody);
});

test('Get an order by id', async ({ request }) => {
  const token = process.env.API_TOKEN;
  const authHeaders = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  let listResponse = await request.get(`${baseURL}/orders`, { headers: authHeaders });
  expect(listResponse.status()).toBe(200);

  let orders = await listResponse.json();
  if (!Array.isArray(orders) || orders.length === 0) {
    const createResponse = await request.post(`${baseURL}/orders`, {
      headers: authHeaders,
      data: { bookId: 1, customerName: 'John Doe' },
    });
    expect(createResponse.status()).toBe(201);
    listResponse = await request.get(`${baseURL}/orders`, { headers: authHeaders });
    expect(listResponse.status()).toBe(200);
    orders = await listResponse.json();
  }
  const ids = (Array.isArray(orders) ? orders : [])
    .map((o: { id?: string }) => o?.id)
    .filter((id): id is string => typeof id === 'string')
    .slice(0, 3);

  expect(ids.length).toBeGreaterThan(0);

  for (const id of ids) {
    const response = await request.get(`${baseURL}/orders/${id}`, { headers: authHeaders });
    expect(response.status(), `GET /orders/${id} should return 200`).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({ id });
  }
});

test('Update an order', async ({ request }) => {
  const token = process.env.API_TOKEN;
  const authHeaders = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  let listResponse = await request.get(`${baseURL}/orders`, { headers: authHeaders });
  expect(listResponse.status()).toBe(200);

  let orders = await listResponse.json();
  if (!Array.isArray(orders) || orders.length === 0) {
    const createResponse = await request.post(`${baseURL}/orders`, {
      headers: authHeaders,
      data: { bookId: 1, customerName: 'John Doe' },
    });
    expect(createResponse.status()).toBe(201);
    listResponse = await request.get(`${baseURL}/orders`, { headers: authHeaders });
    expect(listResponse.status()).toBe(200);
    orders = await listResponse.json();
  }

  const orderId = (Array.isArray(orders) ? orders : [])[0]?.id as string;
  expect(orderId).toBeTruthy();

  const response = await request.patch(`${baseURL}/orders/${orderId}`, {
    headers: authHeaders,
    data: { customerName: 'Momo Sane' },
  });
  expect(response.status()).toBe(204);

  const getResponse = await request.get(`${baseURL}/orders/${orderId}`, { headers: authHeaders });
  expect(getResponse.status()).toBe(200);
  const updatedOrder = await getResponse.json();
  expect(updatedOrder).toMatchObject({ id: orderId, customerName: 'Momo Sane' });
});

test('Delete an order', async ({ request }) => {
  const token = process.env.API_TOKEN;
  const authHeaders = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  let listResponse = await request.get(`${baseURL}/orders`, { headers: authHeaders });
  expect(listResponse.status()).toBe(200);

  let orders = await listResponse.json();
  if (!Array.isArray(orders) || orders.length === 0) {
    const createResponse = await request.post(`${baseURL}/orders`, {
      headers: authHeaders,
      data: { bookId: 1, customerName: 'John Doe' },
    });
    expect(createResponse.status()).toBe(201);
    listResponse = await request.get(`${baseURL}/orders`, { headers: authHeaders });
    expect(listResponse.status()).toBe(200);
    orders = await listResponse.json();
  }
  const orderId = (Array.isArray(orders) ? orders : [])[0]?.id as string;
  expect(orderId).toBeTruthy();
  const response = await request.delete(`${baseURL}/orders/${orderId}`, { headers: authHeaders });
  console.log(response);
});