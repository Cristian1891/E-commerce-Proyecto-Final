// Reglas de validación y manejo de errores junto a cada campo.
// Cada regla recibe el texto ingresado y devuelve un mensaje de error ('' si es válido).

// \p{L} = cualquier letra Unicode: incluye tildes, ñ y ü (por ejemplo "Muñoz" o "Agüero").
const PALABRAS = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;

const limpiar = (valor) => valor.trim().replace(/\s+/g, ' ');

export function validarNombre(valor, { etiqueta = 'tu nombre', minimo = 2 } = {}) {
    const texto = limpiar(valor);
    if (!texto) return `Ingresá ${etiqueta}.`;
    if (texto.length < minimo) return `Debe tener al menos ${minimo} letras.`;
    if (!PALABRAS.test(texto)) return 'Usá solo letras, espacios, apóstrofos o guiones.';
    return '';
}

export function validarEmail(valor) {
    const texto = valor.trim();
    if (!texto) return 'Ingresá tu correo electrónico.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto)) return 'Revisá el formato del correo, por ejemplo: nombre@correo.com.';
    return '';
}

export function validarTelefono(valor) {
    const texto = valor.trim();
    if (!texto) return 'Ingresá un teléfono de contacto.';
    if (!/^[\d\s()+-]+$/.test(texto)) return 'Usá solo números, espacios, guiones, paréntesis o el signo +.';
    const digitos = texto.replace(/\D/g, '').length;
    if (digitos < 8 || digitos > 13) return 'Debe tener entre 8 y 13 números, incluido el código de área.';
    return '';
}

// Acepta direcciones habituales: "Av. Belgrano 1234, 2° B", "Calle 5 e/ 6 y 7", "Los Aromos s/n".
export function validarDireccion(valor) {
    const texto = limpiar(valor);
    if (!texto) return 'Ingresá la dirección de entrega.';
    if (texto.length < 5) return 'La dirección es demasiado corta: incluí calle y altura.';
    if (!/\p{L}/u.test(texto)) return 'Incluí el nombre de la calle.';
    if (!/^[\p{L}\p{N}\s.,'’°º#/-]+$/u.test(texto)) return 'Usá letras, números, espacios y los signos . , ° # / -';
    return '';
}

export function validarMensaje(valor, { minimo = 10, maximo = 1000 } = {}) {
    const texto = valor.trim();
    if (!texto) return 'Escribí tu consulta.';
    if (texto.length < minimo) return `Contanos un poco más (mínimo ${minimo} caracteres).`;
    if (texto.length > maximo) return `El mensaje puede tener hasta ${maximo} caracteres.`;
    return '';
}

// Muestra u oculta el error de un campo. El mensaje se ubica en el elemento
// #error-<id>, que está asociado al campo mediante aria-describedby.
function mostrarError(campo, mensaje) {
    const contenedor = document.getElementById(`error-${campo.id}`);
    campo.classList.toggle('is-invalid', Boolean(mensaje));
    if (mensaje) campo.setAttribute('aria-invalid', 'true');
    else campo.removeAttribute('aria-invalid');
    if (contenedor) contenedor.textContent = mensaje;
}

// Conecta un formulario con sus reglas: { nombreDelCampo: funcionDeValidacion }.
// - Al salir de un campo con contenido se valida (no se marcan errores antes de tiempo).
// - Si un campo ya tiene error, se revalida mientras se escribe para quitarlo apenas se corrige.
// Lo escrito nunca se borra.
export function crearValidador(formulario, reglas) {
    const validarCampo = (campo) => {
        const mensaje = reglas[campo.name](campo.value);
        mostrarError(campo, mensaje);
        return mensaje === '';
    };

    formulario.addEventListener('focusout', ({ target }) => {
        if (reglas[target.name] && target.value.trim() !== '') validarCampo(target);
    });

    formulario.addEventListener('input', ({ target }) => {
        if (reglas[target.name] && target.classList.contains('is-invalid')) validarCampo(target);
    });

    return {
        // Devuelve la lista de campos inválidos (vacía si todo está bien).
        validarTodo() {
            return Object.keys(reglas)
                .map((nombre) => formulario.elements[nombre])
                .filter((campo) => !validarCampo(campo));
        },
        limpiarErrores() {
            Object.keys(reglas).forEach((nombre) => mostrarError(formulario.elements[nombre], ''));
        },
    };
}

// Lee los campos del formulario como objeto, sin espacios al principio ni al final.
export const leerFormulario = (formulario) =>
    Object.fromEntries([...new FormData(formulario)].map(([clave, valor]) => [clave, String(valor).trim()]));
