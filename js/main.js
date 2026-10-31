// Página de inicio: catálogo con categorías, búsqueda y paginación, menú de comidas y carrito.
import { Carrito, CANTIDAD_MAXIMA } from './carrito.js';
import { iniciarVistaCarrito } from './carrito-vista.js';
import { iniciarInterfaz } from './interfaz.js';
import { notificar } from './alertas.js';
import {
    escaparHTML, formatearPrecio, icono, llevarA, normalizarTexto, obtenerJSON,
    pluralizar, retrasar, ruta, rutaImagen,
} from './utilidades.js';

// Identificadores internos (= nombre del archivo JSON) separados de las etiquetas visibles.
// Así "Lácteos" se muestra con tilde y la ruta sigue siendo data/lacteos.json.
const CATEGORIAS = {
    todas: 'Todas',
    bebidas: 'Bebidas',
    lacteos: 'Lácteos',
    fiambres: 'Fiambres',
    golosinas: 'Golosinas',
    snacks: 'Snacks',
    limpieza: 'Limpieza',
    otros: 'Otros',
};
const PRODUCTOS_POR_PAGINA = 12; // 12 se reparte bien en grillas de 2, 3 y 4 columnas

const estado = { categoria: 'todas', busqueda: '', pagina: 1 };
const cacheCatalogo = new Map(); // id de categoría -> promesa con sus productos
const productosPorId = new Map(); // todos los productos cargados (catálogo y menú)
let solicitudActual = 0;

const carrito = new Carrito();

const elementos = {
    categorias: document.querySelector('[data-categorias]'),
    buscador: document.querySelector('[data-buscador]'),
    campoBusqueda: document.getElementById('buscar'),
    titulo: document.querySelector('[data-titulo-resultados]'),
    conteo: document.querySelector('[data-conteo]'),
    grilla: document.querySelector('[data-grilla-productos]'),
    estadoCatalogo: document.querySelector('[data-estado-catalogo]'),
    paginacion: document.querySelector('[data-paginacion]'),
    grillaMenu: document.querySelector('[data-grilla-menu]'),
    estadoMenu: document.querySelector('[data-estado-menu]'),
};

/* ---------- Datos ---------- */

// Descarta registros incompletos y guarda cada producto en el índice por id.
function validarProductos(datos) {
    if (!Array.isArray(datos)) throw new Error('El catálogo no tiene el formato esperado.');
    return datos
        .filter(({ id, nombre, precio, img, categoria }) =>
            Number.isInteger(id) && typeof nombre === 'string' && Number.isFinite(precio) &&
            typeof img === 'string' && typeof categoria === 'string')
        .map((producto) => {
            productosPorId.set(producto.id, producto);
            return producto;
        });
}

// Cada categoría se descarga una sola vez; "todas" combina las demás con Promise.all.
function cargarCategoria(id) {
    if (!cacheCatalogo.has(id)) {
        const promesa = id === 'todas'
            ? Promise.all(Object.keys(CATEGORIAS).filter((clave) => clave !== 'todas').map(cargarCategoria))
                .then((listas) => listas.flat())
            : obtenerJSON(ruta(`data/${id}.json`)).then(validarProductos);
        // Si falla, se quita del caché para que "Reintentar" vuelva a pedirla.
        promesa.catch(() => cacheCatalogo.delete(id));
        cacheCatalogo.set(id, promesa);
    }
    return cacheCatalogo.get(id);
}

/* ---------- Plantillas ---------- */

const textoEnCarrito = (id) => {
    const item = carrito.buscar(id);
    return item ? `En el carrito: ${item.cantidad}` : '';
};

function plantillaTarjeta(producto, { indice, comida = false, mostrarCategoria = false }) {
    const { id, nombre, precio, categoria } = producto;
    const nombreSeguro = escaparHTML(nombre);
    const titulo = comida ? 'h3' : 'h4';
    // Las primeras imágenes suelen verse sin desplazar: se cargan de inmediato; el resto, de forma diferida.
    const carga = indice < 4 ? 'eager' : 'lazy';
    return `
        <li>
            <article class="tarjeta-producto${comida ? ' tarjeta-producto--comida' : ''} entrada" style="animation-delay:${Math.min(indice, 8) * 30}ms">
                <div class="tarjeta-producto__media">
                    <img src="${rutaImagen(producto)}" alt="" width="300" height="300" loading="${carga}" decoding="async">
                </div>
                <div class="tarjeta-producto__cuerpo">
                    ${mostrarCategoria ? `<p class="tarjeta-producto__categoria">${CATEGORIAS[categoria] ?? ''}</p>` : ''}
                    <${titulo} class="tarjeta-producto__nombre">${nombreSeguro}</${titulo}>
                    <p class="tarjeta-producto__precio">${formatearPrecio(precio)}</p>
                    <button type="button" class="btn btn-primary tarjeta-producto__boton" data-agregar="${id}">
                        ${icono('carrito')}<span data-texto-boton>Agregar</span><span class="visually-hidden"> ${nombreSeguro} al carrito</span>
                    </button>
                    <p class="tarjeta-producto__en-carrito" data-en-carrito="${id}">${textoEnCarrito(id)}</p>
                </div>
            </article>
        </li>`;
}

function plantillaEstado(tipo, { termino = '', contenido = 'los productos' } = {}) {
    const estados = {
        cargando: `
            <div class="estado estado--cargando" role="status">
                <div class="spinner-border" aria-hidden="true"></div>
                <p>Cargando ${contenido}…</p>
            </div>`,
        error: `
            <div class="estado estado--error" role="alert">
                <span class="estado__icono">${icono('alerta')}</span>
                <p class="estado__titulo">No pudimos cargar ${contenido}</p>
                <p>Revisá tu conexión e intentá de nuevo.</p>
                <button type="button" class="btn btn-primary" data-reintentar>${icono('reintentar')}Reintentar</button>
            </div>`,
        vacio: `
            <div class="estado">
                <span class="estado__icono">${icono('tienda')}</span>
                <p class="estado__titulo">Todavía no hay productos en esta categoría</p>
                <p>Probá con otra categoría.</p>
            </div>`,
        'sin-resultados': `
            <div class="estado">
                <span class="estado__icono">${icono('buscar')}</span>
                <p class="estado__titulo">No encontramos “${escaparHTML(termino)}”</p>
                <p>Revisá cómo está escrito o buscá en todas las categorías.</p>
                <div class="d-flex flex-wrap justify-content-center gap-2">
                    <button type="button" class="btn btn-outline-primary" data-limpiar-busqueda>Limpiar búsqueda</button>
                    ${estado.categoria !== 'todas' ? '<button type="button" class="btn btn-primary" data-buscar-en-todas>Buscar en todas las categorías</button>' : ''}
                </div>
            </div>`,
    };
    return estados[tipo];
}

/* ---------- Catálogo ---------- */

function renderizarCategorias() {
    elementos.categorias.innerHTML = Object.entries(CATEGORIAS)
        .map(([id, etiqueta]) => `
            <li>
                <button type="button" class="chip" data-categoria="${id}" aria-pressed="${id === estado.categoria}">
                    ${icono('check')}${etiqueta}
                </button>
            </li>`)
        .join('');
}

function mostrarEstadoCatalogo(tipo, opciones) {
    elementos.grilla.innerHTML = '';
    elementos.grilla.hidden = true;
    elementos.paginacion.hidden = true;
    elementos.estadoCatalogo.innerHTML = plantillaEstado(tipo, opciones);
}

function actualizarEncabezadoResultados(total, inicio, fin) {
    const categoria = estado.categoria === 'todas' ? 'Todos los productos' : CATEGORIAS[estado.categoria];
    elementos.titulo.textContent = estado.busqueda ? `Resultados en ${categoria.toLowerCase()}` : categoria;

    let texto = pluralizar(total, 'producto');
    if (estado.busqueda) texto = `${pluralizar(total, 'resultado')} para “${estado.busqueda}”`;
    if (total > PRODUCTOS_POR_PAGINA) texto += ` · mostrando ${inicio + 1} a ${fin}`;
    elementos.conteo.textContent = total === 0 && !estado.busqueda ? '' : texto;
}

function renderizarPaginacion(totalPaginas) {
    elementos.paginacion.hidden = totalPaginas <= 1;
    if (totalPaginas <= 1) {
        elementos.paginacion.innerHTML = '';
        return;
    }
    const { pagina } = estado;
    // Array.from genera los números de página [1, 2, ..., totalPaginas].
    const numeros = Array.from({ length: totalPaginas }, (_, i) => i + 1)
        .map((numero) => `
            <li class="paginacion__item-numero">
                <button type="button" class="btn btn-outline-primary paginacion__numero" data-pagina="${numero}"
                    aria-label="Página ${numero}" ${numero === pagina ? 'aria-current="page"' : ''}>${numero}</button>
            </li>`)
        .join('');

    elementos.paginacion.innerHTML = `
        <ul class="paginacion__lista">
            <li>
                <button type="button" class="btn btn-outline-primary" data-pagina="${pagina - 1}" ${pagina === 1 ? 'disabled' : ''}>
                    ${icono('anterior')}Anterior
                </button>
            </li>
            ${numeros}
            <li>
                <button type="button" class="btn btn-outline-primary" data-pagina="${pagina + 1}" ${pagina === totalPaginas ? 'disabled' : ''}>
                    Siguiente${icono('siguiente')}
                </button>
            </li>
        </ul>
        <p class="paginacion__estado">Página ${pagina} de ${totalPaginas}</p>`;
}

async function mostrarCatalogo({ enfocarResultados = false } = {}) {
    // Cada pedido recibe un número. Si el usuario cambia de categoría antes de que
    // llegue la respuesta anterior, esa respuesta vieja se ignora.
    const solicitud = ++solicitudActual;
    if (!cacheCatalogo.has(estado.categoria)) mostrarEstadoCatalogo('cargando');
    elementos.grilla.setAttribute('aria-busy', 'true');

    try {
        const productos = await cargarCategoria(estado.categoria);
        if (solicitud !== solicitudActual) return;

        const termino = normalizarTexto(estado.busqueda);
        const filtrados = termino
            ? productos.filter(({ nombre }) => normalizarTexto(nombre).includes(termino))
            : productos;

        const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PRODUCTOS_POR_PAGINA));
        estado.pagina = Math.min(Math.max(1, estado.pagina), totalPaginas);
        const inicio = (estado.pagina - 1) * PRODUCTOS_POR_PAGINA;
        const fin = Math.min(inicio + PRODUCTOS_POR_PAGINA, filtrados.length);

        actualizarEncabezadoResultados(filtrados.length, inicio, fin);

        if (filtrados.length === 0) {
            mostrarEstadoCatalogo(termino ? 'sin-resultados' : 'vacio', { termino: estado.busqueda });
        } else {
            const mostrarCategoria = estado.categoria === 'todas';
            elementos.estadoCatalogo.innerHTML = '';
            elementos.grilla.hidden = false;
            elementos.grilla.innerHTML = filtrados
                .slice(inicio, fin)
                .map((producto, indice) => plantillaTarjeta(producto, { indice, mostrarCategoria }))
                .join('');
            renderizarPaginacion(totalPaginas);
        }
        if (enfocarResultados) llevarA(elementos.titulo);
    } catch (error) {
        if (solicitud !== solicitudActual) return;
        console.error(error);
        elementos.titulo.textContent = 'Productos';
        elementos.conteo.textContent = '';
        mostrarEstadoCatalogo('error');
    } finally {
        if (solicitud === solicitudActual) elementos.grilla.setAttribute('aria-busy', 'false');
    }
}

function elegirCategoria(id) {
    estado.categoria = id;
    estado.pagina = 1;
    elementos.categorias.querySelectorAll('[data-categoria]').forEach((boton) => {
        boton.setAttribute('aria-pressed', String(boton.dataset.categoria === id));
    });
    mostrarCatalogo();
}

/* ---------- Menú de comidas ---------- */

async function mostrarMenu() {
    elementos.estadoMenu.innerHTML = plantillaEstado('cargando', { contenido: 'el menú' });
    try {
        const platos = validarProductos(await obtenerJSON(ruta('data/menu.json')));
        elementos.estadoMenu.innerHTML = '';
        elementos.grillaMenu.innerHTML = platos
            .map((plato, indice) => plantillaTarjeta(plato, { indice: indice + 4, comida: true }))
            .join('');
    } catch (error) {
        console.error(error);
        elementos.estadoMenu.innerHTML = plantillaEstado('error', { contenido: 'el menú' });
    }
}

/* ---------- Carrito ---------- */

// Confirmación visual breve sobre el botón presionado.
function confirmarBoton(boton) {
    const texto = boton.querySelector('[data-texto-boton]');
    clearTimeout(Number(boton.dataset.temporizador));
    boton.classList.add('is-agregado');
    texto.textContent = 'Agregado';
    boton.dataset.temporizador = setTimeout(() => {
        boton.classList.remove('is-agregado');
        texto.textContent = 'Agregar';
    }, 1200);
}

function agregarAlCarrito(boton) {
    const producto = productosPorId.get(Number(boton.dataset.agregar));
    if (!producto) return;
    const { estado: resultado, item } = carrito.agregar(producto);
    if (resultado === 'maximo') {
        notificar(`Llegaste al máximo de ${CANTIDAD_MAXIMA} unidades de ${producto.nombre}`, 'info');
        return;
    }
    notificar(resultado === 'nuevo'
        ? `Agregaste ${producto.nombre} al carrito`
        : `Sumaste otra unidad de ${producto.nombre} (${item.cantidad} en el carrito)`);
    confirmarBoton(boton);
}

/* ---------- Eventos ---------- */

function registrarEventos() {
    elementos.categorias.addEventListener('click', (evento) => {
        const boton = evento.target.closest('[data-categoria]');
        if (boton && boton.dataset.categoria !== estado.categoria) elegirCategoria(boton.dataset.categoria);
    });

    const buscar = () => {
        estado.busqueda = elementos.campoBusqueda.value.trim();
        estado.pagina = 1;
        mostrarCatalogo();
    };
    elementos.campoBusqueda.addEventListener('input', retrasar(buscar, 250));
    elementos.buscador.addEventListener('submit', (evento) => {
        evento.preventDefault();
        buscar();
        // En móvil, mover el foco cierra el teclado y lleva a los resultados.
        llevarA(elementos.titulo);
    });

    elementos.paginacion.addEventListener('click', (evento) => {
        const boton = evento.target.closest('[data-pagina]');
        if (!boton || boton.disabled) return;
        estado.pagina = Number(boton.dataset.pagina);
        mostrarCatalogo({ enfocarResultados: true });
    });

    elementos.estadoCatalogo.addEventListener('click', (evento) => {
        if (evento.target.closest('[data-reintentar]')) mostrarCatalogo();
        if (evento.target.closest('[data-limpiar-busqueda]')) {
            elementos.campoBusqueda.value = '';
            estado.busqueda = '';
            mostrarCatalogo();
            elementos.campoBusqueda.focus();
        }
        if (evento.target.closest('[data-buscar-en-todas]')) {
            elegirCategoria('todas');
            elementos.categorias.querySelector('[data-categoria="todas"]').focus();
        }
    });

    elementos.estadoMenu.addEventListener('click', (evento) => {
        if (evento.target.closest('[data-reintentar]')) mostrarMenu();
    });

    // Un solo listener para los botones "Agregar" del catálogo y del menú.
    document.addEventListener('click', (evento) => {
        const boton = evento.target.closest('[data-agregar]');
        if (boton) agregarAlCarrito(boton);
    });

    // Mantiene sincronizado el texto "En el carrito: n" de cada tarjeta.
    carrito.suscribir(() => {
        document.querySelectorAll('[data-en-carrito]').forEach((parrafo) => {
            parrafo.textContent = textoEnCarrito(Number(parrafo.dataset.enCarrito));
        });
    });
}

iniciarInterfaz();
iniciarVistaCarrito(carrito);
renderizarCategorias();
registrarEventos();
mostrarCatalogo();
mostrarMenu();
