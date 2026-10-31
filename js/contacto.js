// Página de contacto: validación del formulario y envío real o simulado.
// Sin plantilla de EmailJS configurada (js/config.js), el formulario funciona
// en modo simulación y lo informa con claridad: nunca muestra "enviado" si no hubo envío.
import { Carrito } from './carrito.js';
import { iniciarVistaCarrito } from './carrito-vista.js';
import { iniciarInterfaz } from './interfaz.js';
import { mostrarMensaje } from './alertas.js';
import { enviarCorreo, estaConfigurado } from './emailjs.js';
import { crearValidador, leerFormulario, validarEmail, validarMensaje, validarNombre, validarTelefono } from './validaciones.js';
import { icono, pluralizar } from './utilidades.js';

const MAXIMO_MENSAJE = 1000;
const formulario = document.querySelector('[data-form-contacto]');
const botonEnviar = formulario.querySelector('[type="submit"]');
const textoBoton = botonEnviar.querySelector('[data-texto-enviar]');
const campoMensaje = formulario.elements.mensaje;
const contador = document.querySelector('[data-contador-mensaje]');
const anuncioFormulario = document.querySelector('[data-anuncio-formulario]');
const modoReal = estaConfigurado('contacto');
const textoInicial = modoReal ? 'Enviar consulta' : 'Enviar consulta (simulación)';
let enviando = false;

const validador = crearValidador(formulario, {
    nombre: (valor) => validarNombre(valor, { etiqueta: 'tu nombre' }),
    apellido: (valor) => validarNombre(valor, { etiqueta: 'tu apellido' }),
    telefono: validarTelefono,
    email: validarEmail,
    mensaje: (valor) => validarMensaje(valor, { maximo: MAXIMO_MENSAJE }),
});

function mostrarModo() {
    const aviso = document.querySelector('[data-aviso-modo]');
    aviso.innerHTML = modoReal
        ? `${icono('info')}<p>Tu consulta se envía por correo con EmailJS.</p>`
        : `${icono('info')}<p><strong>Modo demostración.</strong> Este formulario valida tus datos, pero todavía no está
            conectado a un servicio de correo: <strong>el mensaje no se envía</strong>. Para consultas, acercate al local
            en el horario de atención.</p>`;
    textoBoton.textContent = textoInicial;
}

function actualizarContador() {
    contador.textContent = `${campoMensaje.value.length} / ${MAXIMO_MENSAJE}`;
}

function ponerEnProceso(activo) {
    enviando = activo;
    botonEnviar.disabled = activo;
    formulario.setAttribute('aria-busy', String(activo));
    botonEnviar.querySelector('[data-spinner]').hidden = !activo;
    textoBoton.textContent = activo ? 'Enviando…' : textoInicial;
}

async function enviarConsulta(evento) {
    evento.preventDefault();
    if (enviando) return;

    const invalidos = validador.validarTodo();
    if (invalidos.length > 0) {
        anuncioFormulario.textContent = `Revisá ${pluralizar(invalidos.length, 'campo marcado', 'campos marcados')}.`;
        invalidos[0].focus();
        return;
    }
    anuncioFormulario.textContent = '';

    // Simulación: no hay demora artificial ni mensaje de "enviado".
    if (!modoReal) {
        await mostrarMensaje({
            tipo: 'info',
            titulo: 'Simulación completada',
            html: `<p>Tus datos son válidos, pero <strong>el mensaje no se envió</strong>: este formulario todavía no
                está conectado a un servicio de correo.</p><p>Lo que escribiste sigue en el formulario.</p>`,
        });
        return;
    }

    ponerEnProceso(true);
    try {
        await enviarCorreo('contacto', leerFormulario(formulario));
        formulario.reset();
        validador.limpiarErrores();
        actualizarContador();
        await mostrarMensaje({ tipo: 'success', titulo: '¡Consulta enviada!', texto: 'Gracias por escribir a ANCELCRIS.' });
    } catch (error) {
        console.error(error);
        await mostrarMensaje({
            tipo: 'error',
            titulo: 'No pudimos enviar tu consulta',
            texto: 'Revisá tu conexión e intentá de nuevo. Lo que escribiste se conservó.',
            textoBoton: 'Volver al formulario',
        });
    } finally {
        ponerEnProceso(false);
    }
}

iniciarInterfaz();
iniciarVistaCarrito(new Carrito());
mostrarModo();
actualizarContador();
campoMensaje.addEventListener('input', actualizarContador);
formulario.addEventListener('submit', enviarConsulta);
