// Funciones auxiliares compartidas por todas las páginas.

// Raíz del sitio calculada a partir de la ubicación de este archivo (js/utilidades.js).
// Así las rutas funcionan igual desde index.html, desde paginas/*.html
// y también dentro de la subcarpeta que usa GitHub Pages.
const RAIZ = new URL('../', import.meta.url);

export const ruta = (relativa) => new URL(relativa, RAIZ).href;

export const rutaImagen = ({ categoria, img }) => ruta(`img/${categoria}/${img}`);

// Formato de moneda argentino: $ 1.234 (sin decimales cuando no hacen falta).
const formatoPesos = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

export const formatearPrecio = (importe) => formatoPesos.format(importe);

// "Lácteos" -> "lacteos": permite buscar sin preocuparse por tildes ni mayúsculas.
export const normalizarTexto = (texto = '') =>
    texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// Todo texto que proviene del JSON, del localStorage o del usuario pasa por
// esta función antes de insertarse con innerHTML, para evitar inyección de HTML.
const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escaparHTML = (texto) => String(texto).replace(/[&<>"']/g, (caracter) => ENTIDADES[caracter]);

// Ícono del sprite SVG (img/iconos.svg). Es decorativo: el texto del botón da el nombre accesible.
export const icono = (nombre, clase = '') =>
    `<svg class="icono ${clase}" aria-hidden="true" focusable="false"><use href="${ruta('img/iconos.svg')}#i-${nombre}"></use></svg>`;

// fetch + validación de la respuesta. fetch solo rechaza la promesa ante fallas
// de red, por eso hay que revisar response.ok para detectar un 404 o un 500.
export async function obtenerJSON(url) {
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        throw new Error(`No se pudo cargar ${url} (HTTP ${respuesta.status})`);
    }
    return respuesta.json();
}

// Espera a que el usuario deje de escribir antes de ejecutar la función.
export function retrasar(funcion, milisegundos = 250) {
    let temporizador;
    return (...argumentos) => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => funcion(...argumentos), milisegundos);
    };
}

export const prefiereMenosMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Desplaza la página hasta un elemento y le pasa el foco (útil para teclado y lectores de pantalla).
export function llevarA(elemento) {
    if (!elemento) return;
    elemento.scrollIntoView({ behavior: prefiereMenosMovimiento() ? 'auto' : 'smooth', block: 'start' });
    elemento.focus({ preventScroll: true });
}

export const pluralizar = (cantidad, singular, plural = `${singular}s`) =>
    `${cantidad} ${cantidad === 1 ? singular : plural}`;
