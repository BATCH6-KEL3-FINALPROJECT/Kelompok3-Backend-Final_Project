const updateUnpaidBooking = require("./updateBookingStatus");

const jobs = () => {
    console.info('Jobs is running');
    updateUnpaidBooking();
}
module.exports = jobs;