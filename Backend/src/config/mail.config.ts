// Optional mail configuration for future use
export const MailConfig = {
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587') || 587,
  secure: process.env.MAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.MAIL_USER || '23ycnsale@gmail.com',
    pass: process.env.MAIL_PASS || 'bimsyrzbepgvnqwn',
  },
};