const dotenv = require("dotenv");
dotenv.config();

const request = require("supertest");
const app = require("../bin/app");

describe("Notification API Test", () => {
  describe("GET /api/v1/promotion/", () => {
    it("should get all notification", async () => {
      const response = await request(app).get(`/api/v1/promotion`);
      expect(response.statusCode).toBe(200);
      expect(response.body.is_success).toBe(true);
      expect(response.body.message).toBe("Get all promotion success");
    });
  });
});
