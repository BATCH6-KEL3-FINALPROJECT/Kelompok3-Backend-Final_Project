const request = require("supertest");
const app = require("../bin/app");
const { Airline } = require("../models");

describe("Airline Controller Tests", () => {
  let airlineId;

  it("should create a new airline", async () => {
    const res = await request(app).post("/api/v1/airline/create").send({
      airline_name: "Test Airline",
      airline_code: "TA",
      country: "Testland",
    });

    expect(res.status).toBe(201);
    expect(res.body.is_success).toBe(true);
    expect(res.body.data.newAirline).toBeDefined();
    airlineId = res.body.data.newAirline.airline_id;
  });

  it("should handle create airline error", async () => {
    const res = await request(app).post("/api/v1/airline/create").send({
      airline_name: null,
      airline_code: "TA",
      country: "Testland",
    });

    expect(res.status).toBe(500);
    expect(res.body.is_success).toBe(false);
    expect(res.body.message).toBe("Internal Server Error");
  });

  it("should get all airlines", async () => {
    const res = await request(app).get("/api/v1/airline/");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Success");
    expect(res.body.data.airlines).toBeDefined();
    expect(Array.isArray(res.body.data.airlines)).toBe(true);
  });

  it("should handle get all airlines error", async () => {
    jest
      .spyOn(Airline, "findAll")
      .mockRejectedValue(new Error("Database error"));

    const res = await request(app).get("/api/v1/airline/");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Database error");
  });

  afterAll(async () => {
    if (airlineId) {
      await Airline.destroy({ where: { airline_id: airlineId } });
    }
  });
});
