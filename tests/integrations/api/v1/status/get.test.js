test("GET /api/v1/status to should return 200", async () => {
  const result = await fetch("http://localhost:3000/api/v1/status");
  expect(result.status).toBe(200);

  const responseBody = await result.json();

  expect(responseBody.dependencies.database.version).toEqual(16.14);
});
