import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html, text }) => {
  console.log('\n📧 ─── sendEmail called ───────────────────────────────');
  console.log('   To:     ', to);
  console.log('   Subject:', subject);

  // ── Check env vars before even trying ──────────────────────────────────────
  const missing = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'].filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    console.error('❌ sendEmail FAILED — missing env vars:', missing.join(', '));
    console.error('   Make sure these are set in your .env file');
    return;
  }

  console.log('   Host:   ', process.env.EMAIL_HOST);
  console.log('   Port:   ', process.env.EMAIL_PORT);
  console.log('   User:   ', process.env.EMAIL_USER);
  console.log('   Pass:   ', process.env.EMAIL_PASS ? '✓ set' : '✗ not set');


  const transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log('   Verifying SMTP connection…');
  try {
    await transporter.verify();
    console.log('   ✅ SMTP connection verified successfully');
  } catch (verifyErr) {
    console.error('   ❌ SMTP connection FAILED:', verifyErr.message);
    console.error('   Common causes:');
    console.error('      - Wrong EMAIL_HOST or EMAIL_PORT');
    console.error('      - Wrong EMAIL_USER or EMAIL_PASS');
    console.error('      - For Gmail: make sure you used an App Password, not your real password');
    console.error('      - For Gmail: make sure 2-Step Verification is enabled on your account');
    throw verifyErr;
  }

  const mailOptions = {
    from:    `"${process.env.EMAIL_FROM_NAME || 'NOIR'}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''),
  };

  console.log('   Sending email…');
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('   ✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response: ', info.response);
    console.log('─────────────────────────────────────────────────────\n');
    return info;
  } catch (sendErr) {
    console.error('   ❌ Email send FAILED:', sendErr.message);
    console.error('─────────────────────────────────────────────────────\n');
    throw sendErr;
  }
};

export default sendEmail;