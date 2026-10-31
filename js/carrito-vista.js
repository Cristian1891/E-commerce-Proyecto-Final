// Vista del carrito: contador del encabezado, panel lateral (offcanvas) y
// resumen de la página de compra. Usa los mismos atributos data-* en todas
// las páginas, por lo que una sola función sirve para las tres.

import { CANTIDAD_MAXIMA } from './carrito.js';
import { confirmar, notificar } from './alertas.js';
import { escaparHTML, formatearPrecio, icono, llevarA, pluralizar, rutaImagen } from './utilidades.js';

function plantillaItem({ id, nombre, precio, cantidad, categoria, img }) {
    const nombreSeguro = escaparHTML(nombre);
    const esComida = categoria === 'menu';
    return `
        <li class="item-carrito${esComida ? ' item-carrito--comida' : ''}" data-id="${id}">
            <img class="item-carrito__imagen" src="${rutaImagen({ categoria, img })}" alt="" width="64" height="64" loading="lazy" decoding="async">
            <div class="item-carrito__info">
                <h3 class="item-carrito__nombre">${nombreSeguro}</h3>
                <p class="item-carrito__unitario">${formatearPrecio(precio)} c/u</p>
            </div>
            <button type="button" class="btn btn-peligro-texto btn-sm item-carrito__quitar" data-accion="quitar"
                aria-label="Quitar ${nombreSeguro} del carrito">${icono('quitar')}</button>
            <div class="item-carrito__controles">
                <div class="cantidad" role="group" aria-label="Cantidad de ${nombreSeguro}">
                    <button type="button" class="cantidad__boton" data-accion="restar"
                        aria-label="Restar una unidad de ${nombreSeguro}" ${cantidad <= 1 ? 'disabled' : ''}>${icono('menos')}</button>
                    <input class="cantidad__input" type="number" inputmode="numeric" min="1" max="${CANTIDAD_MAXIMA}" step="1"
                        value="${cantidad}" data-accion="cantidad" aria-label="Cantidad de ${nombreSeguro}">
                    <button type="button" class="cantidad__boton" data-accion="sumar"
                        aria-label="Sumar una unidad de ${nombreSeguro}" ${cantidad >= CANTIDAD_MAXIMA ? 'disabled' : ''}>${icono('mas')}</button>
                </div>
                <p class="item-carrito__subtotal"><span class="visually-hidden">Subtotal: </span>${formatearPrecio(precio * cantidad)}</p>
            </div>
        </li>`;
}

export function iniciarVistaCarrito(carrito) {
    const lista = document.querySelector('[data-carrito-lista]');
    const vacio = document.querySelector('[data-carrito-vacio]');
    const pie = document.querySelector('[data-carrito-pie]');
    const anuncio = document.querySelector('[data-carrito-anuncio]');
    const contadores = document.querySelectorAll('[data-carrito-contador]');
    const textosContador = document.querySelectorAll('[data-carrito-contador-texto]');
    const totales = document.querySelectorAll('[data-carrito-total]');
    const unidades = document.querySelectorAll('[data-carrito-unidades]');
    const botonVaciar = document.querySelector('[data-carrito-vaciar]');
    const panel = document.getElementById('panel-carrito');

    const anunciar = (texto) => {
        if (anuncio) anuncio.textContent = texto;
    };

    function renderizar(cambio = { tipo: 'inicial' }) {
        const items = carrito.obtenerItems();
        const cantidad = carrito.cantidadTotal;

        contadores.forEach((contador) => {
            contador.textContent = cantidad;
            // Respuesta visual breve cuando cambia el contador (no en la carga inicial).
            if (cambio.tipo !== 'inicial') {
                contador.classList.remove('contador--pulso');
                void contador.offsetWidth; // reinicia la animación
                contador.classList.add('contador--pulso');
            }
        });
        textosContador.forEach((texto) => (texto.textContent = ` (${pluralizar(cantidad, 'producto')})`));
        totales.forEach((total) => (total.textContent = formatearPrecio(carrito.total)));
        unidades.forEach((elemento) => (elemento.textContent = pluralizar(cantidad, 'unidad', 'unidades')));

        if (!lista) return;

        // Se recuerda qué control tenía el foco para devolvérselo después de redibujar.
        const activo = document.activeElement;
        const filaActiva = lista.contains(activo) ? activo.closest('[data-id]') : null;
        const foco = filaActiva
            ? { id: filaActiva.dataset.id, accion: activo.dataset.accion, indice: [...lista.children].indexOf(filaActiva) }
            : null;

        lista.innerHTML = items.map(plantillaItem).join('');
        lista.hidden = items.length === 0;
        if (vacio) vacio.hidden = items.length > 0;
        if (pie) pie.hidden = items.length === 0;

        if (foco) restaurarFoco(foco);
    }

    function restaurarFoco({ id, accion, indice }) {
        const fila = lista.querySelector(`[data-id="${id}"]`);
        if (!fila) {
            // La fila se eliminó: el foco pasa al botón "Quitar" de la fila que ocupó su lugar
            // (o de la anterior). Si el carrito quedó vacío, va al título.
            const filas = lista.children;
            const vecina = filas[indice] ?? filas[indice - 1];
            (vecina?.querySelector('[data-accion="quitar"]') ?? document.querySelector('[data-carrito-titulo]'))?.focus();
            return;
        }
        const control = fila.querySelector(`[data-accion="${accion}"]`);
        // Si el botón quedó deshabilitado (por ejemplo, cantidad 1), el foco va al campo de cantidad.
        (control && !control.disabled ? control : fila.querySelector('[data-accion="cantidad"]')).focus();
    }

    // Delegación de eventos: un único listener atiende los botones de todas las filas.
    lista?.addEventListener('click', (evento) => {
        const boton = evento.target.closest('button[data-accion]');
        if (!boton) return;
        const id = Number(boton.closest('[data-id]').dataset.id);
        const item = carrito.buscar(id);
        if (!item) return;

        if (boton.dataset.accion === 'sumar') carrito.cambiarCantidad(id, item.cantidad + 1);
        if (boton.dataset.accion === 'restar') carrito.cambiarCantidad(id, item.cantidad - 1);
        if (boton.dataset.accion === 'quitar') {
            carrito.quitar(id);
            anunciar(`Quitaste ${item.nombre}. Total: ${formatearPrecio(carrito.total)}.`);
            return;
        }
        anunciar(`${item.nombre}: ${pluralizar(item.cantidad, 'unidad', 'unidades')}. Total: ${formatearPrecio(carrito.total)}.`);
    });

    // El campo numérico se confirma al salir de él o con Enter (evento change).
    lista?.addEventListener('change', (evento) => {
        const campo = evento.target.closest('[data-accion="cantidad"]');
        if (!campo) return;
        const id = Number(campo.closest('[data-id]').dataset.id);
        const resultado = carrito.cambiarCantidad(id, campo.value);
        if (!resultado) return;
        const { item, corregida } = resultado;
        if (corregida) {
            notificar(`La cantidad debe ser un número entero entre 1 y ${CANTIDAD_MAXIMA}. Quedó en ${item.cantidad}.`, 'info');
        }
        anunciar(`${item.nombre}: ${pluralizar(item.cantidad, 'unidad', 'unidades')}. Total: ${formatearPrecio(carrito.total)}.`);
    });

    botonVaciar?.addEventListener('click', async () => {
        const confirmado = await confirmar({
            titulo: '¿Vaciar el carrito?',
            texto: `Se van a quitar ${pluralizar(carrito.cantidadTotal, 'unidad', 'unidades')}. Esta acción no se puede deshacer.`,
            textoConfirmar: 'Sí, vaciar',
            peligro: true,
        });
        if (!confirmado) return;
        carrito.vaciar();
        notificar('Vaciaste el carrito', 'info');
        document.querySelector('[data-carrito-titulo]')?.focus();
    });

    // Enlaces internos dentro del panel (por ejemplo "Ver productos"): primero se cierra
    // el panel y recién después se desplaza la página, para que el foco no vuelva atrás.
    panel?.addEventListener('click', (evento) => {
        const enlace = evento.target.closest('a[href^="#"][data-cerrar-carrito]');
        if (!enlace) return;
        evento.preventDefault();
        const destino = document.querySelector(enlace.getAttribute('href'));
        panel.addEventListener('hidden.bs.offcanvas', () => llevarA(destino?.querySelector('[tabindex="-1"]') ?? destino), { once: true });
        bootstrap.Offcanvas.getOrCreateInstance(panel).hide();
    });

    carrito.suscribir((_carrito, cambio) => renderizar(cambio));
    renderizar();

    if (!carrito.almacenamientoDisponible) {
        notificar('Tu navegador no permite guardar el carrito: se perderá al recargar la página.', 'warning');
    }
}
