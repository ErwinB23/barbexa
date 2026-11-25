import type { AuthFailure } from '../domain/auth-error';
export function authMessage(code: AuthFailure): string {
  const messages: Record<AuthFailure, string> = {
    'oauth-cancelled':
      'El acceso con Google fue cancelado. Puedes volver a intentarlo o usar tu correo.',
    'invalid-input':
      'Revisa el nombre, el correo y la clave. El teléfono es opcional.',
    'weak-password':
      'La contraseña no cumple la política de seguridad. Revisa los requisitos o elige otra contraseña.',
    'password-mismatch': 'Las contraseñas no coinciden.',
    'credentials-rejected':
      'No pudimos validar el acceso. Vuelve a iniciar el proceso.',
    'confirmation-required': 'Revisa el correo para confirmar tu cuenta.',
    'link-invalid':
      'El enlace no es válido, ya fue usado o falta su verificación local. Solicita un enlace nuevo desde este dispositivo.',
    'rate-limited':
      'Se alcanzó el límite de solicitudes. Espera antes de intentarlo otra vez.',
    'network-unavailable':
      'No pudimos conectar. Comprueba tu conexión y vuelve a intentarlo.',
    'persistence-failed':
      'No pudimos guardar la verificación de forma segura en este dispositivo.',
    'provider-unavailable':
      'El acceso no está disponible. Comprueba la configuración local.',
  };
  return messages[code];
}
