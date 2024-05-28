'use strict';


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Airlines', [
      //   {
      //   airline_id: "ef4b4d99-7a6a-4451-ba5e-cff623935d1b",
      //   airline_name: "Batik Air",
      //   airline_code: "BTK",
      //   country: "Indonesia",	
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      //  },
      {
        airline_id: "cba794f5-b409-46c0-89c2-55e32aef449d",
        airline_name: "Citilink",
        airline_code: "CTV",
        country: "Indonesia",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airline_id: "ab40b7a9-988d-4e7a-b5e7-e3a33616a2f2",
        airline_name: "Garuda Indonesia",
        airline_code: "GIA",
        country: "Indonesia",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airline_id: "87d70109-fabb-4626-a854-2da5e9134420",
        airline_name: "Lion Air",
        airline_code: "LNI",
        country: "Indonesia",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //   {
      //   airline_id: "54b90398-00ba-47fb-bea2-3a3aaa4f5241",
      //   airline_name: "Super Air Jet",
      //   airline_code: "SJV",
      //   country: "Indonesia",	
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      //  },
      //   {
      //   airline_id: "5727f6e8-bfab-4810-990e-b5b224343ded",
      //   airline_name: "Pelita Air",
      //   airline_code: "PAS",
      //   country: "Indonesia",	
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      //  },
      {
        airline_id: "aaa6c89c-84fa-485a-8c3f-979b4796743e",
        airline_name: "Sriwijaya Air",
        airline_code: "SJY",
        country: "Indonesia",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airline_id: "20b1d7a6-f38f-408b-aa26-b395cdee5275",
        airline_name: "Indonesia AirAsia",
        airline_code: "AWQ",
        country: "Indonesia",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //   {
      //   airline_id: "46fbb093-48ea-435f-bd6d-3b78c5b2c642",
      //   airline_name: "NAM Air",
      //   airline_code: "LKN",
      //   country: "Indonesia",	
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      //  },
      {
        airline_id: "297ef124-c081-468b-9329-b7e8a48f97f7",
        airline_name: "China Eastern Airlines",
        airline_code: "CES",
        country: "China",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //   {
      //   airline_id: "678ea24a-005a-4aa6-925f-2edabb51f671",
      //   airline_name: "Wings Air",
      //   airline_code: "WON",
      //   country: "Indonesia",	
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      //  },
      {
        airline_id: "8c0b982e-444f-4994-98be-d072a97e2bcc",
        airline_name: "Japan Airlines",
        airline_code: "JAL",
        country: "Japan",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //   {
      //   airline_id: "d62537f1-a074-4dd0-baaf-d1f51801bdcd",
      //   airline_name: "AirAsia X",
      //   airline_code: "XAX",
      //   country: "Malaysia",	
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      //  },
      {
        airline_id: "7a834295-ded6-474d-9a90-eb81c7f99481",
        airline_name: "Malaysia Airlines",
        airline_code: "MAS",
        country: "Malaysia",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airline_id: "c20f5b3c-19ad-4969-aa2d-8033bb37f676",
        airline_name: "Cebu Pacific",
        airline_code: "CEB",
        country: "Philippines",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airline_id: "d6c8b513-fed3-4c7c-88e9-334ca3c61633",
        airline_name: "Saudia",
        airline_code: "SVA",
        country: "Saudi Arabia",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airline_id: "bbe24ce4-9188-463c-b8c9-041e865b6412",
        airline_name: "Jetstar Asia Airways",
        airline_code: "JSA",
        country: "Singapore",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airline_id: "09aaae00-4347-4929-a027-20665825d045",
        airline_name: "Air Busan",
        airline_code: "ABL",
        country: "South Korea",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //   {
      //   airline_id: "3f3fadce-15fc-4870-8c74-754c05cdbd8b",
      //   airline_name: "Jeju Air",
      //   airline_code: "JJA",
      //   country: "South Korea",	
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      //  },
      //   {
      //   airline_id: "1e738b29-fa6e-4107-929d-ce1ceac337d7",
      //   airline_name: "Air Europa",
      //   airline_code: "AEA",
      //   country: "Spain",	
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      //  },


    ], {});

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('Airlines', null, {});

  }
};
