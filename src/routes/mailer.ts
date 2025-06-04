import { Router, Request, Response } from 'express';
import { z } from 'zod';
import transporter from '../config/mailer';

const router = Router();

const emailSchema = z.object({
    to: z.string().email('E-mail de destino inválido'),
    subject: z.string().min(3, 'Assunto deve ter pelo menos 3 caracteres'),
    text: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
    html: z.string().optional()
});

transporter.verify((error) => {
  if (error) {
    console.error('Erro na conexão com Mailtrap:', error);
  } else {
    console.log('Conectado ao Mailtrap com sucesso!');
  }
});

router.post('/send', async (req: Request, res: Response) => {
    try {
        const parsedData = emailSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ 
                error: parsedData.error.errors.map(e => e.message) 
            });
        }

        const { to, subject, text, html } = parsedData.data;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
            html: html || text
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log('E-mail enviado:', info.messageId);
        res.status(200).json({ 
            message: 'E-mail enviado com sucesso',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        
        let errorMessage = 'Erro ao enviar e-mail';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        res.status(500).json({ 
            error: errorMessage,
            details: error instanceof Error ? error.stack : null
        });
    }
});

export default router;