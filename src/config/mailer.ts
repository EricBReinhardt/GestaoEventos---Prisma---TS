import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  EMAIL_HOST: z.string().min(1),
  EMAIL_PORT: z.string().min(1).transform(Number),
  EMAIL_USER: z.string().min(1),
  EMAIL_PASSWORD: z.string().min(1),
  EMAIL_FROM: z.string()
    .min(1)
    .refine(val => {
      const emailPart = val.includes('<') 
        ? val.split('<')[1].split('>')[0].trim()
        : val.trim();
      return z.string().email().safeParse(emailPart).success;
    }, {
      message: "Deve ser um email válido ou no formato 'Nome <email@dominio.com>'"
    }),
  EMAIL_SECURE: z.string().transform(val => val === 'true')
});

const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_SECURE: process.env.EMAIL_SECURE
});

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT, 
  secure: env.EMAIL_SECURE, 
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false 
  }
});

transporter.verify()
  .then(() => console.log('✅ SMTP configurado com sucesso'))
  .catch(error => console.error('❌ Erro na configuração SMTP:', error));

export default transporter;