import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = new Resend(env.RESEND_API_KEY);

// Sin dominio verificado en Resend, solo se puede enviar a la dirección del creador.
// Cambiar EMAIL_DEST por el email real del destinatario cuando se tenga dominio propio.
const EMAIL_DEST = 'jenfermz44@gmail.com'

/** Correo de verificación de dirección (registro CIBIR) */
export const enviarCorreoVerificacion = async (nombre: string, emailOriginal: string, token: string) => {
  const enlaceVerificacion = `${env.APP_URL}/cibir/verificar?token=${token}`
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: EMAIL_DEST,
    subject: 'Confirma tu registro en la Cámara Inmobiliaria (CIBIR)',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;">
        <h2 style="color:#166534;">¡Hola, ${nombre}!</h2>
        <p>Has solicitado preinscribirte al curso <strong>CIBIR</strong> de la Cámara Inmobiliaria del Estado Bolívar.</p>
        <p>Para confirmar tu correo electrónico (<em>${emailOriginal}</em>) haz clic en el enlace:</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${enlaceVerificacion}" style="background-color:#16a34a;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Confirmar mi correo</a>
        </div>
        <p style="font-size:14px;color:#666;">O copia: ${enlaceVerificacion}</p>
        <hr style="border:none;border-top:1px solid #ddd;margin-top:30px;"/>
        <p style="font-size:12px;color:#999;">Si no fuiste tú, ignora este correo.</p>
      </div>
    `
  })
  if (error) { console.error('enviarCorreoVerificacion:', error); throw error }
  return data
}

/** Correo de bienvenida + enlace para establecer contraseña inicial (afiliado aprobado) */
export const enviarCorreoAprobacion = async (nombre: string, emailOriginal: string, token: string) => {
  const enlaceSetup = `${env.APP_URL}/establecer-contrasena?token=${token}`
  const { data, error } = await resend.emails.send({
    from: 'CIEBO <onboarding@resend.dev>',
    to: EMAIL_DEST,
    subject: '¡Felicidades! Tu solicitud ha sido aprobada',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;border:1px solid #eee;border-radius:12px;padding:24px;">
        <h1 style="color:#059669;text-align:center;">¡BIENVENIDO A CIEBO!</h1>
        <h2 style="color:#1f2937;">Hola, ${nombre}</h2>
        <p>Tu solicitud de afiliación a la <strong>Cámara Inmobiliaria del Estado Bolívar</strong> ha sido aprobada.</p>
        <div style="background-color:#f0fdf4;border-left:4px solid #059669;padding:16px;margin:24px 0;">
          <p style="margin:0;font-weight:bold;color:#065f46;">Próximo paso: Configura tu acceso</p>
          <p style="margin:8px 0 0;font-size:14px;color:#065f46;">Establece tu contraseña para ingresar al portal.</p>
        </div>
        <div style="text-align:center;margin:32px 0;">
          <a href="${enlaceSetup}" style="background-color:#059669;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Establecer mi Contraseña</a>
        </div>
        <p style="font-size:13px;color:#6b7280;text-align:center;">Este enlace tiene validez de 48 horas.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0;"/>
        <p style="font-size:12px;color:#9ca3af;text-align:center;">&copy; 2026 Cámara Inmobiliaria del Estado Bolívar</p>
      </div>
    `
  })
  if (error) { console.error('enviarCorreoAprobacion:', error); throw error }
  return data
}

/**
 * Correo enviado cuando un ADMINISTRADOR hace reset de la contraseña de un usuario.
 * El enlace dirige a /establecer-contrasena?token=...&modo=reset
 */
export const enviarCorreoResetAdmin = async (
  nombre: string,
  emailOriginal: string,
  token: string
) => {
  const enlace = `${env.APP_URL}/establecer-contrasena?token=${token}&modo=reset`
  const { data, error } = await resend.emails.send({
    from: 'CIEBO <onboarding@resend.dev>',
    to: EMAIL_DEST, // producción: emailOriginal
    subject: 'Restablecimiento de contraseña — CIEBO',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;border:1px solid #eee;border-radius:12px;padding:24px;">
        <h2 style="color:#065f46;">Hola, ${nombre}</h2>
        <p>Un administrador ha iniciado un restablecimiento de contraseña para tu cuenta (<em>${emailOriginal}</em>).</p>
        <p>Haz clic para crear tu nueva contraseña. Enlace válido por <strong>24 horas</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${enlace}" style="background-color:#059669;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
            Establecer nueva contraseña
          </a>
        </div>
        <p style="font-size:13px;color:#6b7280;">Si no esperabas este correo, ignóralo. Tu contraseña no cambia hasta que uses el enlace.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
        <p style="font-size:12px;color:#9ca3af;text-align:center;">&copy; 2026 Cámara Inmobiliaria del Estado Bolívar</p>
      </div>
    `,
  })
  if (error) throw new Error(`enviarCorreoResetAdmin: ${JSON.stringify(error)}`)
  return data
}

/**
 * Correo enviado cuando el USUARIO solicita "olvidé mi contraseña".
 * El enlace dirige a /establecer-contrasena?token=...&modo=reset
 * Caduca en 1 hora.
 */
export const enviarCorreoOlvideContrasena = async (
  emailOriginal: string,
  token: string
) => {
  const enlace = `${env.APP_URL}/establecer-contrasena?token=${token}&modo=reset`
  const { data, error } = await resend.emails.send({
    from: 'CIEBO <onboarding@resend.dev>',
    to: EMAIL_DEST, // producción: emailOriginal
    subject: 'Recupera tu contraseña — CIEBO',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;border:1px solid #eee;border-radius:12px;padding:24px;">
        <h2 style="color:#065f46;">Recupera tu acceso</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de <strong>${emailOriginal}</strong>.</p>
        <p>Haz clic en el botón para crear una nueva contraseña. Enlace válido por <strong>1 hora</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${enlace}" style="background-color:#059669;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
            Restablecer mi contraseña
          </a>
        </div>
        <p style="font-size:13px;color:#6b7280;">Si no solicitaste esto, ignora el correo. Tu contraseña no cambiará.</p>
        <p style="font-size:11px;color:#9ca3af;">Enlace directo: ${enlace}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
        <p style="font-size:12px;color:#9ca3af;text-align:center;">&copy; 2026 Cámara Inmobiliaria del Estado Bolívar</p>
      </div>
    `,
  })
  if (error) throw new Error(`enviarCorreoOlvideContrasena: ${JSON.stringify(error)}`)
  return data
}
