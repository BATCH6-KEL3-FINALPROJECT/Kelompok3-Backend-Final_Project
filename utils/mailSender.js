const nodemailer = require('nodemailer')

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
module.exports = mailSender;