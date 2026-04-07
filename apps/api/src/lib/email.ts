import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = new Resend(env.RESEND_API_KEY);

/**
 * Enviar correo de verificación temporal al correo suministrado por el usuario
 * (temporalmente forzado a jenfermz44@gmail.com por restricciones de cuenta de Resend sin dominio verificado)
 */
export const enviarCorreoVerificacion = async (nombre: string, emailOriginal: string, token: string) => {
  try {
    const enlaceVerificacion = `${env.CORS_ORIGIN}/cibir/verificar?token=${token}`;
    
    // Al no tener dominio verificado, Resend solo permite enviar correos a la dirección del creador (jenfermz44@gmail.com).
    // Para entornos en producción con dominio verificado, 'to' debería ser 'emailOriginal'.
    const emailDestino = 'jenfermz44@gmail.com'; // Temporal

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Dominio temporal de Resend
      to: emailDestino,
      subject: 'Confirma tu registro en la Cámara Inmobiliaria (CIBIR)',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #166534;">¡Hola, ${nombre}!</h2>
          <p>Has solicitado preinscribirte al curso <strong>CIBIR</strong> de la Cámara Inmobiliaria del Estado Bolívar.</p>
          <p>Para confirmar tu correo electrónico (<em>${emailOriginal}</em>) y completar el registro, por favor haz clic en el siguiente enlace:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${enlaceVerificacion}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Confirmar mi correo</a>
          </div>
          <p style="font-size: 14px; color: #666;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="font-size: 14px; color: #16a34a; word-break: break-all;">${enlaceVerificacion}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin-top: 30px;" />
          <p style="font-size: 12px; color: #999;">Si no fuiste tú quien solicitó esto, por favor ignora este correo.</p>
        </div>
      `
    });

    if (error) {
      console.error('Error enviando correo de verificación:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en enviarCorreoVerificacion:', error);
    throw new Error('No se pudo enviar el correo de verificación');
  }
};

/**
 * Enviar correo de bienvenida tras aprobación administrativa.
 * Incluye el enlace para establecer la contraseña inicial.
 */
export const enviarCorreoAprobacion = async (nombre: string, emailOriginal: string, token: string) => {
  try {
    const enlaceSetup = `${env.CORS_ORIGIN}/establecer-contrasena?token=${token}`;
    const emailDestino = 'jenfermz44@gmail.com'; // Temporal por restricciones de Resend

    const { data, error } = await resend.emails.send({
      from: 'CIEBO <onboarding@resend.dev>',
      to: emailDestino,
      subject: '¡Felicidades! Tu solicitud ha sido aprobada',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 12px; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #059669; margin: 0;">¡BIENVENIDO A CIEBO!</h1>
          </div>
          
          <h2 style="color: #1f2937;">Hola, ${nombre}</h2>
          <p style="line-height: 1.6;">Nos complace informarte que tu solicitud de afiliación a la <strong>Cámara Inmobiliaria del Estado Bolívar</strong> ha sido aprobada exitosamente.</p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-weight: bold; color: #065f46;">Próximo paso: Configura tu acceso</p>
            <p style="margin: 8px 0 0; font-size: 14px; color: #065f46;">Para comenzar a utilizar tu portal de afiliado, primero debes establecer tu contraseña de seguridad.</p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${enlaceSetup}" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Establecer mi Contraseña</a>
          </div>

          <p style="font-size: 13px; color: #6b7280; text-align: center;">Este enlace tiene una validez de 48 horas.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; 2026 Cámara Inmobiliaria del Estado Bolívar. Todos los derechos reservados.</p>
        </div>
      `
    });

    if (error) {
      console.error('Error enviando correo de aprobación:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error en enviarCorreoAprobacion:', error);
    throw new Error('No se pudo enviar el correo de bienvenida');
  }
};
