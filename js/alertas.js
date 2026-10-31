// Configuración centralizada de SweetAlert2 (v11).
// Swal es una variable global creada por lib/sweetalert2/js/sweetalert2.min.js.
//
// Criterio de uso:
// - Notificaciones breves (toast) para acciones frecuentes: no interrumpen ni toman el foco.
// - Diálogos solo para decisiones que requieren atención (vaciar carrito, confirmar pedido)
//   o para resultados importantes (pedido enviado, error al enviar).

const CLASES_DIALOGO = {
    popup: 'alerta',
    title: 'alerta__titulo',
    htmlContainer: 'alerta__texto',
    actions: 'alerta__acciones',
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-outline-primary',
};

// buttonsStyling: false desactiva los estilos propios de SweetAlert2 para que
// los botones usen las clases de Bootstrap personalizadas en css/estilos.css.
const Dialogo = Swal.mixin({
    buttonsStyling: false,
    customClass: CLASES_DIALOGO,
    reverseButtons: true,
    returnFocus: true,
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
});

const Notificacion = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
    customClass: { popup: 'notificacion' },
    // Pausa el temporizador mientras el puntero está encima, para poder leerla.
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
});

// Si el panel del carrito (offcanvas) está abierto, el diálogo se monta dentro de él.
// Bootstrap mantiene el foco atrapado en el panel; si el diálogo quedara afuera,
// el teclado no podría usarlo.
const destinoDialogo = () => document.querySelector('.offcanvas.show') ?? 'body';

// titleText (y no title) inserta el texto de forma segura, sin interpretar HTML.
export const notificar = (texto, tipo = 'success') => Notificacion.fire({ icon: tipo, titleText: texto });

// Devuelve una promesa que se resuelve en true si el usuario confirma.
export async function confirmar({ titulo, texto, html, textoConfirmar = 'Confirmar', peligro = false }) {
    const resultado = await Dialogo.fire({
        target: destinoDialogo(),
        icon: peligro ? 'warning' : 'question',
        titleText: titulo,
        text: texto,
        html,
        showCancelButton: true,
        confirmButtonText: textoConfirmar,
        // En acciones destructivas el foco inicial queda en "Cancelar".
        focusCancel: peligro,
        customClass: { ...CLASES_DIALOGO, confirmButton: peligro ? 'btn btn-danger' : 'btn btn-primary' },
    });
    return resultado.isConfirmed;
}

export const mostrarMensaje = ({ titulo, texto, html, tipo = 'info', textoBoton = 'Entendido' }) =>
    Dialogo.fire({ target: destinoDialogo(), icon: tipo, titleText: titulo, text: texto, html, confirmButtonText: textoBoton });
