const nodemailer = require('nodemailer');

// Pour l'Alpha, on utilise un un service de test (Ethereal) ou SMTP standard
// Idéalement à configurer avec Resend/SendGrid via des variables d'environnement
const createTransporter = async () => {
  // Cas de base ou développement : Ethereal (faux SMTP pour dev)
  if (!process.env.SMTP_HOST) {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // Production
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour autres
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendResetPasswordEmail = async (toEmail, resetToken) => {
  try {
    const transporter = await createTransporter();
    
    // Lien factice pointant vers le front-end
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    
    const info = await transporter.sendMail({
      from: '"ArtFolio Support" <support@artfolio.art>',
      to: toEmail,
      subject: "Réinitialisation de votre mot de passe ArtFolio",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #333;">Bonjour,</h2>
          <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte ArtFolio.</p>
          <p>Veuillez cliquer sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #D4AF37; color: #1a1a1a; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="font-size: 12px; color: #888;">Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
          <p>L'équipe ArtFolio.</p>
        </div>
      `,
    });

    if (!process.env.SMTP_HOST) {
      console.log('✉️ Email de test envoyé ! Voir : %s', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    return false;
  }
};

module.exports = {
  sendResetPasswordEmail
};
