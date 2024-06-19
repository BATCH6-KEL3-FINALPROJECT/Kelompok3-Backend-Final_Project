const nodemailer = require('nodemailer')
const fs = require('fs');

const mailSender = async (email, title, body) => {
    try {
        //to send email ->  firstly create a Transporter
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,  //-> Host SMTP detail
            auth: {
                user: process.env.MAIL_USER,  //-> User's mail for authentication
                pass: process.env.MAIL_PASS,  //-> User's password for authentication
            }
        })

        //now Send e-mails to users
        let info = await transporter.sendMail({
            from: 'www.Project .me - KODE OTP',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        })

        console.log("Info is here: ", info)
        return info

    } catch (error) {
        console.log(error.message);
    }
}

const printTicket = async (email, title, body) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, 'E_Ticket.pdf'); // Assuming E_Ticket.pdf is in the same directory as this script

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        // Read the file content
        const ticketFile = fs.readFileSync(filePath);

        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        // Send email with attachment
        let info = await transporter.sendMail({
            from: 'www.ProjectAirlines.com',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
            attachments: [
                {
                    filename: 'E_Ticket.pdf',
                    content: ticketFile
                }
            ]
        });

        console.log('Email sent:', info.messageId);
        return info;

    } catch (error) {
        console.error('Error in printTicket:', error.message);
        throw error; // Throw error to handle it in the calling function
    }
};

async function sendVerificationEmail(email, otp) {
    // Send the email using our custom mailSender Function
    try {
        const mailResponse = await mailSender(
            email,
            "Verification Email",
            `<h1>Please confirm your OTP </h1>
             <p> here is your OTP code:-> ${otp} </p>
            `
        );
        console.log("Email sent successfully: ", mailResponse);
    } catch (error) {
        console.log("Error occurred while sending email: ", error);
        throw error;
    }
}
module.exports = { mailSender, printTicket };