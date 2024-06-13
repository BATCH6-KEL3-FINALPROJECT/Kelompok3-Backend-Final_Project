"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Promotions",
      [
        {
          promotion_id: 1,
          flight_id: null,
          promo_message: "Promo Terbang Hemat ke Bali!",
          description:
            "Pulau Bali, surga tropis yang dikenal dengan keindahan pantainya, kebudayaan yang kaya, dan pemandangan alam yang menakjubkan, kini lebih terjangkau dari sebelumnya! Kami hadir dengan penawaran spesial yang tidak boleh Anda lewatkan!",
          discount_percentage: 5,
          start_date: new Date("2024-06-11"),
          end_date: new Date("2024-06-20"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          promotion_id: 2,
          flight_id: null,
          promo_message: "Promo Spesial ke Tokyo!",
          description:
            "Tokyo, kota metropolitan yang memadukan tradisi dan modernitas, penuh dengan keajaiban dan pengalaman unik yang menanti Anda. Kini, kami hadir dengan penawaran khusus yang membuat perjalanan Anda ke Tokyo lebih terjangkau!",
          discount_percentage: 5,
          start_date: new Date("2024-06-15"),
          end_date: new Date("2024-06-25"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          promotion_id: 3,
          flight_id: null,
          promo_message: "Liburan Murah ke Singapura!",
          description: "Nikmati keindahan kota Singapura dengan penawaran diskon khusus hingga 40%! Dapatkan pengalaman wisata yang tidak terlupakan dengan harga lebih hemat.",
          discount_percentage: 10,
          start_date: new Date("2024-07-01"),
          end_date: new Date("2024-07-10"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          promotion_id: 4,
          flight_id: null,
          promo_message: "Diskon Besar ke Sydney!",
          description: "Dapatkan diskon hingga 35% untuk penerbangan ke Sydney. Temukan keindahan kota terbesar di Australia dengan harga yang lebih terjangkau.",
          discount_percentage: 15,
          start_date: new Date("2024-08-01"),
          end_date: new Date("2024-08-15"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          promotion_id: 5,
          flight_id: null,
          promo_message: "Eksplorasi Budaya di Bangkok!",
          description: "Nikmati diskon hingga 30% untuk penerbangan ke Bangkok dan jelajahi kekayaan budaya Thailand dengan harga hemat.",
          discount_percentage: 20,
          start_date: new Date("2024-09-01"),
          end_date: new Date("2024-09-10"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          promotion_id: 6,
          flight_id: null,
          promo_message: "Petualangan di New York!",
          description: "Dapatkan pengalaman tak terlupakan di New York dengan diskon penerbangan hingga 25%! Jangan lewatkan kesempatan ini.",
          discount_percentage: 25,
          start_date: new Date("2024-10-01"),
          end_date: new Date("2024-10-15"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          promotion_id: 7,
          flight_id: null,
          promo_message: "Terbang Hemat ke Paris!",
          description: "Nikmati suasana romantis Paris dengan penawaran spesial kami. Dapatkan diskon hingga 20% untuk penerbangan ke Kota Cinta.",
          discount_percentage: 20,
          start_date: new Date("2024-11-01"),
          end_date: new Date("2024-11-10"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          promotion_id: 8,
          flight_id: null,
          promo_message: "Wisata Hemat ke Hong Kong!",
          description: "Temukan pesona Hong Kong dengan penawaran diskon hingga 25%! Manfaatkan kesempatan ini untuk liburan hemat Anda.",
          discount_percentage: 25,
          start_date: new Date("2024-12-01"),
          end_date: new Date("2024-12-15"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          promotion_id: 9,
          flight_id: null,
          promo_message: "Petualangan Seru ke Dubai!",
          description: "Jelajahi kemewahan Dubai dengan penawaran diskon penerbangan hingga 30%! Segera pesan tiket Anda.",
          discount_percentage: 30,
          start_date: new Date("2024-01-01"),
          end_date: new Date("2024-01-10"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          promotion_id: 10,
          flight_id: null,
          promo_message: "Diskon Spesial ke London!",
          description: "Kunjungi keindahan kota London dengan diskon penerbangan hingga 35%! Jangan lewatkan promo ini.",
          discount_percentage: 35,
          start_date: new Date("2024-02-01"),
          end_date: new Date("2024-02-15"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("People", null, {});
  },
};
