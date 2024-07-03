const request = require("supertest");
const app = require("../bin/app");
const { Airport } = require("../models");

describe("Airport Controller Tests", () => {
  let airportId;

  it("should create a new airport", async () => {
    const res = await request(app).post("/api/v1/airport/create").send({
      airport_name: "Test Airport",
      city: "Test City",
      continent: "Test Continent",
      iata_code: "TST",
      country: "Test Country",
    });

    expect(res.status).toBe(201);
    expect(res.body.is_success).toBe(true);
    expect(res.body.data.newAirport).toBeDefined();
    airportId = res.body.data.newAirport.airport_id;
  });

  it("should handle create airport error", async () => {
    const res = await request(app).post("/api/v1/airport/create").send({
      airport_name: null,
      city: "Test City",
      continent: "Test Continent",
      iata_code: "TST",
      country: "Test Country",
    });

    expect(res.status).toBe(500);
    expect(res.body.is_success).toBe(false);
    expect(res.body.message).toBe("Internal Server Error");
  });

  it("should get all airports", async () => {
    const res = await request(app).get("/api/v1/airport/");

    expect(res.status).toBe(200);
    expect(res.body.is_success).toBe(true);
    expect(res.body.data.airport).toBeDefined();
    expect(Array.isArray(res.body.data.airport)).toBe(true);
  });

  it("should get filtered airports with search query", async () => {
    await request(app).post("/api/v1/airport/create").send({
      airport_name: "Test Airport 2",
      city: "Test City 2",
      continent: "Test Continent 2",
      iata_code: "TST2",
      country: "Another Country",
    });

    const res = await request(app)
      .get("/api/v1/airport/")
      .query({ search: "Test" });

    expect(res.status).toBe(200);
    expect(res.body.is_success).toBe(true);
    expect(res.body.data.airport).toBeDefined();
    expect(Array.isArray(res.body.data.airport)).toBe(true);
    res.body.data.airport.forEach((airport) => {
      expect(
        airport.city.toLowerCase().includes("test") ||
          airport.country.toLowerCase().includes("test") ||
          airport.iata_code.toLowerCase().includes("test")
      ).toBe(true);
    });
  });

  it("should handle error when getting all airports", async () => {
    jest.spyOn(Airport, "findAndCountAll").mockImplementationOnce(() => {
      throw new Error("Database connection error");
    });

    const res = await request(app).get("/api/v1/airport/");

    expect(res.status).toBe(400);
    expect(res.body.is_success).toBe(false);
    expect(res.body.message).toBe("Database connection error");
  });

  afterAll(async () => {
    if (airportId) {
      await Airport.destroy({ where: { airport_id: airportId } });
    }
  });
});
