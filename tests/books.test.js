process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testBookISBN = ""; // Variable to store the ISBN of the test book

beforeAll(async () => {
  await db.query("DELETE FROM books");
  // Insert the initial book data into the test database
  const initialBookData = {
    isbn: "0691161518",
    amazon_url: "https://www.example.com",
    author: "John Doe",
    language: "English",
    pages: 300,
    publisher: "Example Publishing",
    title: "Test Book",
    year: 2022,
  };

  const result = await db.query(
    `INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING isbn`,
    [
      initialBookData.isbn,
      initialBookData.amazon_url,
      initialBookData.author,
      initialBookData.language,
      initialBookData.pages,
      initialBookData.publisher,
      initialBookData.title,
      initialBookData.year,
    ]
  );

  testBookISBN = result.rows[0].isbn; // Store the ISBN of the test book
});

afterAll(async () => {
  await db.end();
});

describe("GET /books/:isbn", () => {
  test("Retrieve a book by ISBN", async () => {
    const isbn = "0691161518";
    const response = await request(app).get(`/books/${isbn}`);
    expect(response.status).toBe(200);
    expect(response.body.book).toEqual(expect.objectContaining({ isbn }));
  });

  test("Non-existing ISBN -> returns 404", async () => {
    const isbn = "1234567890"; // An ISBN that doesn't exist
    const response = await request(app).get(`/books/${isbn}`);
    expect(response.status).toBe(404);
  });
});

describe("PUT /books/:isbn", () => {
  test("Update a book by ISBN", async () => {
    const updatedData = {
      isbn: "0691161518",
      amazon_url: "https://www.example.com",
      author: "John Doe",
      language: "English",
      pages: 300,
      publisher: "Example Publishing",
      title: "Updated Title",
      year: 2022,
    };
    const isbn = "0691161518"; // An ISBN that exists
    const response = await request(app).put(`/books/${isbn}`).send(updatedData);
    expect(response.status).toBe(200);
    expect(response.body.book).toEqual(expect.objectContaining(updatedData));
  });

  test("Non-existing ISBN -> returns 404", async () => {
    const updatedData = {
      isbn: "1234567890", // Provide the correct ISBN
      amazon_url: "https://www.example.com",
      author: "John Doe",
      language: "English",
      pages: 300,
      publisher: "Example Publishing",
      title: "Updated Title",
      year: 2022,
    };
    const isbn = "1234567890"; // An ISBN that doesn't exist
    const response = await request(app).put(`/books/${isbn}`).send(updatedData);
    expect(response.status).toBe(404);
  });
});

describe("POST /books", () => {
  test("Create a new book", async () => {
    const newBookData = {
      isbn: "9876543210", // Provide a valid ISBN
      amazon_url: "https://www.example.com",
      author: "Jane Smith",
      language: "English",
      pages: 250,
      publisher: "Sample Publishing",
      title: "New Book",
      year: 2023,
    };
    const response = await request(app).post("/books").send(newBookData);
    expect(response.status).toBe(201);
    expect(response.body.book).toEqual(expect.objectContaining(newBookData));
  });
});

describe("DELETE /books/:isbn", () => {
  test("Delete a book by ISBN", async () => {
    const isbn = "0691161518"; // An ISBN that exists
    const response = await request(app).delete(`/books/${isbn}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Book deleted");
  });

  test("Non-existing ISBN -> returns 404", async () => {
    const isbn = "1234567890"; // An ISBN that doesn't exist
    const response = await request(app).delete(`/books/${isbn}`);
    expect(response.status).toBe(404);
  });
});
