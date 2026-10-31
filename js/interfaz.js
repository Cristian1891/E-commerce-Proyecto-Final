// Comportamientos comunes del encabezado y el pie en las tres páginas.
// bootstrap es la variable global creada por lib/bootstrap/js/bootstrap.bundle.min.js.

export function iniciarInterfaz() {
    // En móvil, el menú se cierra al elegir un enlace.
    const navegacion = document.getElementById('navegacion');
    navegacion?.addEventListener('click', (evento) => {
        if (evento.target.closest('a') && navegacion.classList.contains('show')) {
            bootstrap.Collapse.getOrCreateInstance(navegacion).hide();
        }
    });

    document.querySelectorAll('[data-anio]').forEach((elemento) => {
        elemento.textContent = new Date().getFullYear();
    });
}
