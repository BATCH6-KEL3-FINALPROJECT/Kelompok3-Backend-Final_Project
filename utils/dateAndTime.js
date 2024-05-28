// Function to format the date as "MM/DD/YYYY"
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return month + '/' + day + '/' + year;
}

const startDate = new Date('2024-06-05');

const datesArray = [];

// Loop to generate dates for the next two weeks
for (let i = 0; i < 10; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    datesArray.push(formatDate(currentDate));
}
const flightTimes = [
    {
        departureTime: "07:30",
        arrivalTime: "10:00",
        duration: 150
    },

    {
        departureTime: "12:00",
        arrivalTime: "15:15",
        duration: 195
    },

    {
        departureTime: "18:00",
        arrivalTime: "21:00",
        duration: 180
    },
    // {
    //     departureTime: "15:45",
    //     arrivalTime: "17:45",
    //     duration: 120
    // },
    // {
    //     departureTime: "10:30",
    //     arrivalTime: "12:15",
    //     duration: 105
    // },
];
console.log(datesArray);
console.log(flightTimes);
module.exports = { datesArray, flightTimes };
