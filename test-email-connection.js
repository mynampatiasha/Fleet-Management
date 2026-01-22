// Quick Email Connection Test
require('dotenv').config({ path: 'abra_fleet_backend/.env' });
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Testing Email Connection...');
  console.log('Email:', process.env.SMTP_USER);
  console.log('Password length:', process.env.SMTP_PASSWORD?.length || 0);
  
  if (!process.env.SMTP_PASSWORD || process.env.SMTP_PASSWORD === 'your_new_app_password_here') {
    console.log('❌ Please update SMTP_PASSWORD in abra_fleet_backend/.env with your new App Password');
    console.log('\n📋 Steps to get App Password:');
    console.log('1. Go to https://myaccount.google.com/security');
    console.log('2. Enable 2-Factor Authentication');
    console.log('3. Go to https://myaccount.google.com/apppasswords');
    console.log('4. Generate App Password for "Mail"');
    console.log('5. Copy the 16-character password');
    console.log('6. Update SMTP_PASSWORD in .env file');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD.trim(),
    },
  });

  try {
    await transporter.verify();
    console.log('✅ Email connection successful!');
    
    // Send test email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: '✅ Email Test Success',
      text: 'Email service is working correctly!'
    });
    
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.log('❌ Email connection failed:', error.message);
    if (error.code === 'EAUTH') {
      console.log('💡 Generate a new App Password and update .env file');
    }
  }
}

testEmail();