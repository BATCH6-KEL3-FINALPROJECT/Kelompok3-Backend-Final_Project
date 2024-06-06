const { Airport, Airline, Flight } = require('../models');

async function generateCode(airline_id) {
    try {
        const airline = await Airline.findByPk(airline_id)
        if (!airline) {
            throw new Error('Airline not found')
        }
        const ticketCode = `${airline.airline_code}-${Date.now()}`; // Example format: "ABC-1622925484563"
        return ticketCode
        console.log(ticketCode)
    } catch (error) {
        console.error('Error generating ticket code:', error);
        return null; // Return null if an error occurs
    }
}

module.exports = generateCode;
