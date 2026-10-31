// Envío de correos con la API REST de EmailJS mediante fetch (promesas).
import { EMAILJS } from './config.js';

export const estaConfigurado = (tipo) => Boolean(EMAILJS.clavePublica && EMAILJS.servicio && EMAILJS.plantillas[tipo]);

// Resuelve si EmailJS confirmó el envío; rechaza ante error HTTP, falla de red o demora excesiva.
export async function enviarCorreo(tipo, parametros) {
    // AbortController corta la petición si tarda demasiado, para no dejar al usuario esperando.
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), EMAILJS.tiempoMaximoMs);

    try {
        const respuesta = await fetch(EMAILJS.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: EMAILJS.servicio,
                template_id: EMAILJS.plantillas[tipo],
                user_id: EMAILJS.clavePublica,
                template_params: parametros,
            }),
            signal: controlador.signal,
        });
        if (!respuesta.ok) {
            const detalle = await respuesta.text();
            throw new Error(`EmailJS respondió ${respuesta.status}: ${detalle}`);
        }
    } finally {
        clearTimeout(temporizador);
    }
}
