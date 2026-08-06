test("GET to /api/v1/saudacoes should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/saudacoes");
  expect(response.status).toBe(200);
});
