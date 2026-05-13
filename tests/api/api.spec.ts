import { test, expect } from '@playwright/test';

let ApiToken = process.env.API_TOKEN;

const baseURL = 'https://simple-books-api.click';

test('Get Status on Book API', async ({ request }) => {
    const response = await request.get(`${baseURL}/status`);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.status).toBe('OK');
});

test('Authenticate with the API', async ({ request }) => {
    const response = await request.post(`${baseURL}/api-clients/`, {
        data: {
            "clientName": "Postman",
            "clientEmail": "mouhamed@example.com"
        }
    });
    const responseBody = await response.json();
    console.log(responseBody);
    const accessToken = responseBody.accessToken;
    ApiToken = accessToken;
    console.log(ApiToken);
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

test.skip('Submit order for a book', async ({ request }) => {
    const response = await request.post(`${baseURL}/orders`, {
        headers: {
            'Accept': 'application/json',
            // Add GitHub personal access token.
            'Authorization': `Bearer ${process.env.API_TOKEN}`,
          },
        data: {
            bookId: 1,
            customerName: 'John Doe'
        }
    });
    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.id).toBeDefined();
    expect(responseBody.bookId).toBe(1);
    expect(responseBody.customerName).toBe('John Doe');

});