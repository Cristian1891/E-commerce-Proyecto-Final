// Modelo del carrito: datos, reglas y persistencia en localStorage.
// No toca el DOM; la vista (carrito-vista.js) se suscribe a sus cambios.
//
// Regla al agregar un producto que ya está en el carrito: se suma una unidad
// (hasta CANTIDAD_MAXIMA). Así repetir "Agregar" funciona como en un almacén real.

export const CANTIDAD_MAXIMA = 20;
const CLAVE = 'ancelcris:carrito';

// Convierte cualquier valor en una cantidad entera válida entre 1 y CANTIDAD_MAXIMA.
export function limitarCantidad(valor) {
    const numero = Math.trunc(Number(valor));
    if (!Number.isFinite(numero) || numero < 1) return 1;
    return Math.min(numero, CANTIDAD_MAXIMA);
}

const RUTA_VALIDA = /^[\p{L}\p{N}_.\- ]+\.(jpe?g|png|webp)$/u;

// Valida un ítem leído del localStorage (puede estar dañado o ser de una versión vieja).
function normalizarItem(dato) {
    if (!dato || typeof dato !== 'object') return null;
    const { id, nombre, precio, img, categoria, cantidad } = dato;
    const valido =
        Number.isInteger(id) &&
        typeof nombre === 'string' && nombre.trim() !== '' &&
        Number.isFinite(precio) && precio >= 0 &&
        typeof img === 'string' && RUTA_VALIDA.test(img) &&
        typeof categoria === 'string' && /^[a-z]+$/.test(categoria);
    if (!valido) return null;
    return { id, nombre: nombre.trim(), precio, img, categoria, cantidad: limitarCantidad(cantidad) };
}

function sanear(datos) {
    if (!Array.isArray(datos)) return [];
    const porId = new Map();
    for (const dato of datos) {
        const item = normalizarItem(dato);
        if (!item) continue;
        const existente = porId.get(item.id);
        // Si un mismo producto aparece dos veces se unifica en una sola fila.
        if (existente) existente.cantidad = limitarCantidad(existente.cantidad + item.cantidad);
        else porId.set(item.id, item);
    }
    return [...porId.values()];
}

// localStorage puede no estar disponible (modo privado estricto, cookies bloqueadas).
function probarAlmacenamiento() {
    try {
        const prueba = `${CLAVE}:prueba`;
        localStorage.setItem(prueba, '1');
        localStorage.removeItem(prueba);
        return true;
    } catch {
        return false;
    }
}

export class Carrito {
    constructor() {
        this.suscriptores = [];
        this.almacenamientoDisponible = probarAlmacenamiento();
        this.items = this.leer();

        // Si el carrito cambia en otra pestaña, esta se actualiza sola.
        window.addEventListener('storage', (evento) => {
            if (evento.key === CLAVE || evento.key === null) {
                this.items = this.leer();
                this.notificar({ tipo: 'sincronizado' });
            }
        });
    }

    leer() {
        if (!this.almacenamientoDisponible) return this.items ?? [];
        try {
            const guardado = localStorage.getItem(CLAVE);
            return guardado ? sanear(JSON.parse(guardado)) : [];
        } catch (error) {
            console.warn('El carrito guardado no es válido y se descartó.', error);
            return [];
        }
    }

    guardar() {
        if (!this.almacenamientoDisponible) return;
        try {
            localStorage.setItem(CLAVE, JSON.stringify(this.items));
        } catch (error) {
            console.warn('No se pudo guardar el carrito.', error);
        }
    }

    suscribir(funcion) {
        this.suscriptores.push(funcion);
    }

    notificar(cambio) {
        this.suscriptores.forEach((funcion) => funcion(this, cambio));
    }

    // Guarda y avisa a la vista en un solo paso.
    actualizar(cambio) {
        this.guardar();
        this.notificar(cambio);
    }

    obtenerItems() {
        return [...this.items];
    }

    buscar(id) {
        return this.items.find((item) => item.id === id);
    }

    // Recibe un producto del catálogo (datos del JSON, nunca del DOM).
    agregar({ id, nombre, precio, img, categoria }) {
        const existente = this.buscar(id);
        if (existente) {
            if (existente.cantidad >= CANTIDAD_MAXIMA) return { estado: 'maximo', item: existente };
            existente.cantidad += 1;
            this.actualizar({ tipo: 'sumado', id });
            return { estado: 'sumado', item: existente };
        }
        const item = { id, nombre, precio, img, categoria, cantidad: 1 };
        this.items.push(item);
        this.actualizar({ tipo: 'agregado', id });
        return { estado: 'nuevo', item };
    }

    cambiarCantidad(id, cantidad) {
        const item = this.buscar(id);
        if (!item) return null;
        const pedida = Math.trunc(Number(cantidad));
        item.cantidad = limitarCantidad(cantidad);
        this.actualizar({ tipo: 'cantidad', id });
        // Avisa si el valor pedido se tuvo que corregir (por ejemplo, 25 -> 20).
        return { item, corregida: pedida !== item.cantidad };
    }

    quitar(id) {
        const item = this.buscar(id);
        if (!item) return null;
        this.items = this.items.filter((elemento) => elemento.id !== id);
        this.actualizar({ tipo: 'quitado', id, item });
        return item;
    }

    // Elimina únicamente la clave del carrito (no se usa localStorage.clear()).
    vaciar() {
        this.items = [];
        if (this.almacenamientoDisponible) {
            try {
                localStorage.removeItem(CLAVE);
            } catch (error) {
                console.warn('No se pudo borrar el carrito guardado.', error);
            }
        }
        this.notificar({ tipo: 'vaciado' });
    }

    // Los importes siempre se calculan desde el modelo, nunca desde texto formateado.
    get total() {
        return this.items.reduce((acumulado, item) => acumulado + item.precio * item.cantidad, 0);
    }

    get cantidadTotal() {
        return this.items.reduce((acumulado, item) => acumulado + item.cantidad, 0);
    }

    get estaVacio() {
        return this.items.length === 0;
    }
}
