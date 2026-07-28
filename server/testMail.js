const nodemailer = require('nodemailer');

async function test() {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 's06122710@gmail.com',
        pass: 'pvqzubftmlcaoqqz'
      }
    });

    await transporter.verify();
    console.log('SUCCESS');
  } catch (error) {
    console.log('ERROR:', error.message);
  }
}
test();
