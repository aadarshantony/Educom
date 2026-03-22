import { Resend } from 'resend';

let _resend = null;
const getResend = () => {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set in environment variables');
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
};

const sendEmail = async ({ to, subject, html, text }) => {
  console.log('\n📧 ─── sendEmail called ───────────────────────────────');
  console.log('   To:     ', to);
  console.log('   Subject:', subject);
  console.log('   API Key:', process.env.RESEND_API_KEY ? '✓ set' : '✗ NOT SET');

  const resend = getResend();

  const from = `${process.env.EMAIL_FROM_NAME || 'NOIR'} <${process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev'}>`;
  console.log('   From:   ', from);
  console.log('   Sending via Resend HTTP API…');

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''),
  });

  if (error) {
    console.error('   ❌ Resend API error:', error);
    throw new Error(error.message || 'Failed to send email via Resend');
  }

  console.log('   ✅ Email sent! ID:', data.id);
  console.log('─────────────────────────────────────────────────────\n');
  return data;
};

export default sendEmail;