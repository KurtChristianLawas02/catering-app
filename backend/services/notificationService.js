const tls = require('tls');

const CUSTOMER_CONFIRMATION_MESSAGE =
  'Thank you for trusting Ratskie Food and Catering Services, We promise that we will do our best to make your Celebration perfect.';

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.NOTIFY_EMAIL_FROM);
}

function isSmsConfigured() {
  if (process.env.SMS_PROVIDER === 'twilio') {
    return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);
  }

  return Boolean(process.env.SEMAPHORE_API_KEY && process.env.SEMAPHORE_SENDER_NAME);
}

function normalizePhone(phone) {
  const raw = String(phone || '').trim();
  const digits = raw.replace(/\D/g, '');

  if (raw.startsWith('+')) return raw;
  if (digits.startsWith('63')) return `+${digits}`;
  if (digits.startsWith('09')) return `+63${digits.slice(1)}`;
  if (digits.startsWith('9') && digits.length === 10) return `+63${digits}`;

  return raw;
}

function encodeBase64(value) {
  return Buffer.from(String(value), 'utf8').toString('base64');
}

function formatEmailMessage(payload) {
  return [
    `Hello ${payload.customer_name},`,
    '',
    CUSTOMER_CONFIRMATION_MESSAGE,
    '',
    `Inquiry ID: #${payload.inquiry_id}`,
    '',
    'Ratskie Food and Catering Services',
  ].join('\n');
}

function buildEmail({ to, subject, body }) {
  const from = process.env.NOTIFY_EMAIL_FROM;
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
  ];

  return `${headers.join('\r\n')}\r\n\r\n${body}`;
}

function readSmtpResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('SMTP response timed out.'));
    }, 15000);

    function cleanup() {
      clearTimeout(timeout);
      socket.off('data', onData);
      socket.off('error', onError);
    }

    function onError(err) {
      cleanup();
      reject(err);
    }

    function onData(chunk) {
      buffer += chunk.toString('utf8');
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1] || '';
      if (/^\d{3}\s/.test(last)) {
        cleanup();
        const code = Number(last.slice(0, 3));
        if (code >= 400) reject(new Error(last));
        else resolve(buffer);
      }
    }

    socket.on('data', onData);
    socket.on('error', onError);
  });
}

async function smtpCommand(socket, command) {
  socket.write(`${command}\r\n`);
  return readSmtpResponse(socket);
}

async function sendEmailNotification(payload) {
  if (!isEmailConfigured()) {
    return { skipped: true, reason: 'Email notification is not configured.' };
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || 'true') !== 'false';
  if (!secure) {
    throw new Error('Only secure SMTP on port 465 is supported by the built-in sender.');
  }

  const socket = tls.connect({ host, port, servername: host });
  await new Promise((resolve, reject) => {
    socket.once('secureConnect', resolve);
    socket.once('error', reject);
  });

  try {
    await readSmtpResponse(socket);
    await smtpCommand(socket, `EHLO ${process.env.SMTP_EHLO_DOMAIN || 'localhost'}`);
    await smtpCommand(socket, 'AUTH LOGIN');
    await smtpCommand(socket, encodeBase64(process.env.SMTP_USER));
    await smtpCommand(socket, encodeBase64(process.env.SMTP_PASS));
    await smtpCommand(socket, `MAIL FROM:<${process.env.SMTP_USER}>`);
    await smtpCommand(socket, `RCPT TO:<${payload.customer_email}>`);
    await smtpCommand(socket, 'DATA');

    const email = buildEmail({
      to: payload.customer_email,
      subject: 'Ratskie Food and Catering Services Inquiry Confirmation',
      body: formatEmailMessage(payload),
    });
    socket.write(`${email}\r\n.\r\n`);
    await readSmtpResponse(socket);
    await smtpCommand(socket, 'QUIT');
    return { sent: true };
  } finally {
    socket.end();
  }
}

async function sendSemaphoreSms(payload) {
  const params = new URLSearchParams({
    apikey: process.env.SEMAPHORE_API_KEY,
    number: normalizePhone(payload.customer_phone),
    message: CUSTOMER_CONFIRMATION_MESSAGE,
    sendername: process.env.SEMAPHORE_SENDER_NAME,
  });

  const res = await fetch('https://api.semaphore.co/api/v4/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!res.ok) {
    throw new Error(`Semaphore SMS failed with status ${res.status}.`);
  }

  return { sent: true };
}

async function sendTwilioSms(payload) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const params = new URLSearchParams({
    From: process.env.TWILIO_FROM,
    To: normalizePhone(payload.customer_phone),
    Body: CUSTOMER_CONFIRMATION_MESSAGE,
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encodeBase64(`${accountSid}:${token}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!res.ok) {
    throw new Error(`Twilio SMS failed with status ${res.status}.`);
  }

  return { sent: true };
}

async function sendSmsNotification(payload) {
  if (!isSmsConfigured()) {
    return { skipped: true, reason: 'SMS notification is not configured.' };
  }

  if (process.env.SMS_PROVIDER === 'twilio') {
    return sendTwilioSms(payload);
  }

  return sendSemaphoreSms(payload);
}

async function notifyCustomerOfInquiry(payload) {
  const results = await Promise.allSettled([
    sendEmailNotification(payload),
    sendSmsNotification(payload),
  ]);

  results.forEach((result, index) => {
    const channel = index === 0 ? 'Email' : 'SMS';
    if (result.status === 'rejected') {
      console.error(`${channel} notification failed:`, result.reason.message);
    } else if (result.value.skipped) {
      console.warn(`${channel} notification skipped: ${result.value.reason}`);
    }
  });
}

module.exports = {
  CUSTOMER_CONFIRMATION_MESSAGE,
  notifyCustomerOfInquiry,
};
