// Configuración de servicios externos.
//
// EmailJS (https://www.emailjs.com) envía correos desde el navegador sin un
// servidor propio. La "clave pública" (antes llamada user ID) está pensada para
// usarse en el frontend; las restricciones se configuran en el panel de EmailJS.
//
// Si una plantilla queda vacía (''), ese formulario funciona en MODO SIMULACIÓN:
// valida los datos y lo informa claramente, pero no envía nada.
// Ver la sección "Formularios y servicios externos" del README.

export const EMAILJS = {
    url: 'https://api.emailjs.com/api/v1.0/email/send',
    clavePublica: 'user_IjTt1eaQsxU2eVCr7Pgu8',
    servicio: 'default_service',
    plantillas: {
        compra: 'template_hq87b19', // plantilla existente del proyecto original
        contacto: '', // sin plantilla: el formulario de contacto es una simulación
    },
    tiempoMaximoMs: 15000,
};
