const { transporter } = require('./transporter');

const sendEmail = (to, userAction, htmlContent) => {

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: to, 
    subject: `[KKU Blogging] แจ้งเตือน ${userAction}`,
    html: htmlContent,
  };

  try {
    const info = transporter.sendMail(mailOptions); 
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendEmail };
