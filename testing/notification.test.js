const dotenv = require("dotenv");
dotenv.config();

const request = require("supertest");
const app = require("../bin/app");


describe("Notification API Test", () => {

  describe("POST /api/v1/notification", () => {
    it("should create a new notification", async () => {
      const notificationData = {
        user_id: '2b054118-24fc-4c00-8ba2-b1a5e9bb0069',
        flight_id: null,
        booking_id: null,
        promotion_id: null,
        notification_type: "flight_update",
        message: "Perubahan jadwal penerbangan: Penerbangan ke Bali tanggal 20 Juni 2024 telah dipindahkan dari pukul 10.00 menjadi pukul 12.00.",
        is_read: true,
      };

      const response = await request(app).post("/api/v1/notification/create").send(notificationData);
      expect(response.statusCode).toBe(201);
      expect(response.body.is_succes).toBe(true);
      expect(response.body.message).toBe("Notification created");
      expect(response.body.data.newNotification).toHaveProperty("notification_id");
      expect(response.body.data.newNotification.message).toBe(notificationData.message);
    });
  });

  describe("GET /api/v1/notification/:id", () => {
    it("should get a notification by id", async () => {
      const response = await request(app).get(`/api/v1/notification/59ae1853-04af-454f-83b2-edfe0c8e8da5`);
      expect(response.statusCode).toBe(200);
      expect(response.body.is_sucsess).toBe(true);
      expect(response.body.message).toBe("Get notification success");
    });
  });

  describe("PATCH /api/v1/notification/:id", () => {
    it("should update the notification status to read", async () => {
      const response = await request(app).patch(`/api/v1/notification/59ae1853-04af-454f-83b2-edfe0c8e8da5`);

      expect(response.statusCode).toBe(200);
      expect(response.body.is_sucsess).toBe(true);
      expect(response.body.message).toBe("Update notification success");
      expect(response.body.data.notification.is_read).toBe(true);
    });
  });
});
