let productos_vista = document.getElementById("productos-ecommerce");
let menu = document.getElementById("cards-menu");
let titulo = document.getElementById("titulo");
const anteriorButton = document.getElementById("anterior");
const siguienteButton = document.getElementById("siguiente");
const anteriorButtonMenu = document.getElementById("anterior_menu");
const siguienteButtonMenu = document.getElementById("siguiente_menu");

const ITEMS_POR_PAGINA = 6; // Cambia este valor según tus necesidades
const ITEMS_POR_PAGINA_MENU = 3;
let paginaActualMenu = 1;
let paginaActual = 1;
let dataProductos = [];
let dataMenu = [];
let botones = [...document.getElementsByClassName("barra")];
let seccion = "bebidas";

botones.forEach((boton)=>{
    boton.addEventListener("click", (e)=>{
        let li = e.target.parentElement;
        let a = e.target;
        if(a.classList.contains("colorWhite")){
            a.classList.remove("colorWhite");
            a.classList.add("colorCian");
        }
        a.classList.add("colorCian");
        seccion = a.innerText.toLowerCase();
        cargarDatosProductos(seccion);
        const hermanos = botones.filter(elemento => elemento !== li);
        hermanos.forEach(hermano =>{
            if(hermano.firstElementChild.classList.contains("colorCian")){
                hermano.firstElementChild.classList.remove("colorCian");
                hermano.firstElementChild.classList.add("colorWhite");
            }

        })
    })
})


async function cargarDatosProductos(section){
    try {
        seccion = section || "bebidas";
        const response = await fetch(`./data/${seccion}.json`);
        if (!response.ok) {
            throw new Error('No se pudieron cargar los datos.');
        }
        dataProductos = await response.json();
        mostrarPaginaProductos(paginaActual);
    } catch (error) {
        console.error(error);
    }
}

async function cargarDatosMenu(){
    try {
        const response = await fetch(`./data/menu.json`);
        if (!response.ok) {
            throw new Error('No se pudieron cargar los datos.');
        }
        dataMenu = await response.json();
        mostrarPaginaMenu(paginaActualMenu);
    } catch (error) {
        console.error(error);
    }
}


// Función para mostrar los datos de la página actual
function mostrarPaginaProductos(pagina) {
    const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    const paginaDatos = dataProductos.slice(inicio, fin);

    productos_vista.innerHTML = '';
    titulo.innerHTML = '';

    const categoriaTitulo = document.createElement('h4');
    categoriaTitulo.classList.add("text-center", "colorBlack", "my-5");
    categoriaTitulo.innerText = `${seccion.toUpperCase()}`
    titulo.appendChild(categoriaTitulo);

    paginaDatos.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add("card-prod")
        itemDiv.innerHTML+= `<img src="img/${item.categoria}/${item.img}" alt="botellaCoca">
                            <h4 class="py-5 mediumItalic">${item.nombre}</h4>
                            <p class="mediumItalic pb-4 precio">$<span>${item.precio}</span></p>
                            <a href="#" class="boton colorBlack bgColorCian agregar-carrito" data-id="${item.id}"">Agregar al carrito</a>
                        `
        productos_vista.appendChild(itemDiv);
    });

    anteriorButton.disabled = pagina === 1;
    siguienteButton.disabled = fin >= dataProductos.length;
}

// Función para mostrar los datos de la página actual
function mostrarPaginaMenu(pagina) {
    const inicio = (pagina - 1) * ITEMS_POR_PAGINA_MENU;
    const fin = inicio + ITEMS_POR_PAGINA_MENU;
    const paginaDatos = dataMenu.slice(inicio, fin);

    menu.innerHTML = '';

    paginaDatos.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add("contenido-card", "bgColorBlack");
        itemDiv.innerHTML+= `<img src="img/${item.categoria}/${item.img}" alt="botellaCoca">
                            <h4 class="py-5 mediumItalic">${item.nombre}</h4>
                            <p class="mediumItalic pb-4 precio">$<span>${item.precio}</span></p>
                            <a href="#" class="boton colorBlack bgColorCian agregar-carrito" data-id="${item.id}"">Agregar al carrito</a>
                        `
        menu.appendChild(itemDiv);
    });

    anteriorButtonMenu.disabled = pagina === 1;
    siguienteButtonMenu.disabled = fin >= dataMenu.length;
}

// Evento para el botón "Anterior"
anteriorButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (paginaActual > 1) {
        paginaActual--;
        mostrarPaginaProductos(paginaActual);
    }
});

// Evento para el botón "Siguiente"
siguienteButton.addEventListener('click', (e) => {
    e.preventDefault();
    const ultimaPagina = Math.ceil(dataProductos.length / ITEMS_POR_PAGINA);
    if (paginaActual < ultimaPagina) {
        paginaActual++;
        mostrarPaginaProductos(paginaActual);
    }
});

// Evento para el botón "Anterior"
anteriorButtonMenu.addEventListener('click', (e) => {
    e.preventDefault();
    if (paginaActualMenu > 1) {
        paginaActualMenu--;
        mostrarPaginaMenu(paginaActualMenu);
    }
});

// Evento para el botón "Siguiente"
siguienteButtonMenu.addEventListener('click', (e) => {
    e.preventDefault();
    const ultimaPagina = Math.ceil(dataMenu.length / ITEMS_POR_PAGINA_MENU);
    if (paginaActualMenu < ultimaPagina) {
        paginaActualMenu++;
        mostrarPaginaMenu(paginaActualMenu);
    }
});

cargarDatosProductos();
cargarDatosMenu();






            