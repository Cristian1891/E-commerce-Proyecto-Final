// Página de compra: resumen editable del carrito, datos de entrega y envío del pedido.
import { Carrito } from './carrito.js';
import { iniciarVistaCarrito } from './carrito-vista.js';
import { iniciarInterfaz } from './interfaz.js';
import { confirmar, mostrarMensaje } from './alertas.js';
import { enviarCorreo, estaConfigurado } from './emailjs.js';
import { crearValidador, leerFormulario, validarDireccion, validarEmail, validarNombre, validarTelefono } from './validaciones.js';
import { escaparHTML, formatearPrecio, icono, pluralizar, ruta } from './utilidades.js';

const carrito = new Carrito();
const formulario = document.querySelector('[data-form-compra]');
const botonEnviar = formulario.querySelector('[type="submit"]');
const anuncioFormulario = document.querySelector('[data-anuncio-formulario]');
const modoReal = estaConfigurado('compra');
let enviando = false;

const validador = crearValidador(formulario, {
    nombre: (valor) => validarNombre(valor, { etiqueta: 'tu nombre y apellido', minimo: 3 }),
    email: validarEmail,
    telefono: validarTelefono,
    direccion: validarDireccion,
});

// Muestra el aviso según el modo: envío real con EmailJS o simulación.
function mostrarModo() {
    const aviso = document.querySelector('[data-aviso-modo]');
    aviso.innerHTML = modoReal
        ? `${icono('info')}<p><strong>Sin pagos en línea.</strong> Al confirmar, el pedido se envía por correo con EmailJS.
            ANCELCRIS es un simulador de comercio electrónico: no se realiza ningún cobro.</p>`
        : `${icono('info')}<p><strong>Modo demostración.</strong> Al confirmar se validan tus datos, pero el pedido
            <strong>no se envía</strong>: el servicio de correo no está configurado.</p>`;
    botonEnviar.querySelector('[data-texto-enviar]').textContent = modoReal ? 'Confirmar pedido' : 'Confirmar pedido (simulación)';
}

// Alterna entre el contenido de la compra y el estado de carrito vacío.
function actualizarVista() {
    document.querySelector('[data-compra-vacia]').hidden = !carrito.estaVacio;
    document.querySelector('[data-compra-contenido]').hidden = carrito.estaVacio;
}

function ponerEnProceso(activo) {
    enviando = activo;
    botonEnviar.disabled = activo;
    formulario.setAttribute('aria-busy', String(activo));
    botonEnviar.querySelector('[data-spinner]').hidden = !activo;
    botonEnviar.querySelector('[data-texto-enviar]').textContent = activo
        ? 'Enviando pedido…'
        : modoReal ? 'Confirmar pedido' : 'Confirmar pedido (simulación)';
}

const detalleTexto = (items) =>
    items.map(({ nombre, cantidad, precio }) => `${cantidad} x ${nombre} (${formatearPrecio(precio)} c/u) = ${formatearPrecio(precio * cantidad)}`)
        .join('\n');

function resumenHTML(datos) {
    const filas = [
        ['Productos', pluralizar(carrito.cantidadTotal, 'unidad', 'unidades')],
        ['Total', formatearPrecio(carrito.total)],
        ['Entrega en', datos.direccion],
        ['Contacto', `${datos.telefono} · ${datos.email}`],
    ];
    return `
        <p>Revisá los datos antes de ${modoReal ? 'enviar' : 'simular'} el pedido.</p>
        <dl class="resumen-alerta">
            ${filas.map(([termino, valor]) => `<div><dt>${termino}</dt><dd>${escaparHTML(valor)}</dd></div>`).join('')}
        </dl>`;
}

async function procesarCompra(evento) {
    evento.preventDefault();
    if (enviando) return; // evita envíos duplicados

    if (carrito.estaVacio) {
        actualizarVista();
        return;
    }

    const invalidos = validador.validarTodo();
    if (invalidos.length > 0) {
        anuncioFormulario.textContent = `Revisá ${pluralizar(invalidos.length, 'campo marcado', 'campos marcados')}.`;
        invalidos[0].focus();
        return;
    }
    anuncioFormulario.textContent = '';

    const datos = leerFormulario(formulario);
    const confirmado = await confirmar({
        titulo: 'Confirmá tu pedido',
        html: resumenHTML(datos),
        textoConfirmar: modoReal ? 'Enviar pedido' : 'Simular pedido',
    });
    if (!confirmado) return;

    const total = formatearPrecio(carrito.total);
    ponerEnProceso(true);
    try {
        if (modoReal) {
            // Se conservan los nombres de parámetros de la plantilla original de EmailJS
            // (destinatario, email, total, direccion) y se suman telefono y detalle.
            await enviarCorreo('compra', {
                destinatario: datos.nombre,
                email: datos.email,
                total,
                direccion: datos.direccion,
                telefono: datos.telefono,
                detalle: detalleTexto(carrito.obtenerItems()),
            });
        }
        carrito.vaciar();
        formulario.reset();
        validador.limpiarErrores();
        const respuesta = await mostrarMensaje({
            tipo: modoReal ? 'success' : 'info',
            titulo: modoReal ? '¡Pedido enviado!' : 'Simulación completada',
            html: modoReal
                ? `<p>Tu pedido por <strong>${total}</strong> se envió correctamente.</p><p>No se realizó ningún cobro.</p>`
                : `<p>Tus datos son válidos, pero <strong>el pedido no se envió</strong> porque el servicio de correo no está configurado.</p>`,
            textoBoton: 'Volver a la tienda',
        });
        if (respuesta.isConfirmed) window.location.href = ruta('index.html');
    } catch (error) {
        console.error(error);
        await mostrarMensaje({
            tipo: 'error',
            titulo: 'No pudimos enviar el pedido',
            texto: 'Revisá tu conexión e intentá de nuevo. Tus datos y tu carrito se conservaron.',
            textoBoton: 'Volver al formulario',
        });
        botonEnviar.focus();
    } finally {
        ponerEnProceso(false);
    }
}

iniciarInterfaz();
iniciarVistaCarrito(carrito);
mostrarModo();
actualizarVista();
carrito.suscribir(actualizarVista);
formulario.addEventListener('submit', procesarCompra);
