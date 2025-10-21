import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  static async sendPasswordEmail(to: string, password: string, userName: string): Promise<void> {
    const mailOptions = {
      from: `"HILFE Enterprise" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Votre mot de passe HILFE Enterprise',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Bienvenue sur HILFE Enterprise</h2>
          <p>Bonjour ${userName},</p>
          <p>Votre compte a été créé avec succès.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">Votre mot de passe temporaire :</p>
            <p style="margin: 0; font-size: 24px; color: #2563eb;">${password}</p>
          </div>
          <p>Connectez-vous à : <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
          <p><strong>Il est recommandé de changer votre mot de passe après la première connexion.</strong></p>
          <p>Cordialement,<br>L'équipe HILFE Enterprise</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send password email:', error);
      throw new Error('Erreur lors de l\\'envoi de l\\'email');
    }
  }

  static async sendPasswordResetEmail(to: string, tempPassword: string, userName: string): Promise<void> {
    const mailOptions = {
      from: `"HILFE Enterprise" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Réinitialisation de votre mot de passe HILFE Enterprise',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Réinitialisation de mot de passe</h2>
          <p>Bonjour ${userName},</p>
          <p>Votre mot de passe a été réinitialisé.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">Votre nouveau mot de passe temporaire :</p>
            <p style="margin: 0; font-size: 24px; color: #2563eb;">${tempPassword}</p>
          </div>
          <p>Connectez-vous à : <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
          <p><strong>Il est recommandé de changer votre mot de passe après la connexion.</strong></p>
          <p>Cordialement,<br>L'équipe HILFE Enterprise</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Erreur lors de l\\'envoi de l\\'email de réinitialisation');
    }
  }
}
