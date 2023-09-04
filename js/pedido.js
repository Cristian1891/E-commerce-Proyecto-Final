import { Carrito } from './carrito.js';

const carro = new Carrito(); 
const carrito = document.getElementById('carrito');
const productos = document.getElementById('productos');
const menu = document.getElementById('menu');
const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
const procesarPedidoBtn = document.getElementById('procesar-pedido');
 
  

cargarEventos();

function cargarEventos(){

    //Se ejecuta cuando se presionar agregar carrito
    productos.addEventListener('click', (e)=>{carro.comprarProducto(e), carro.contarProductos()});
    menu.addEventListener('click', (e)=>{carro.comprarProducto(e), carro.contarProductos()});

    //Con esta se evita que la tabla se cierre al hacer click incluso dentro de ella
    carrito.addEventListener('click', (e) => {
        e.stopPropagation()
    })

    

    //Cuando se elimina productos del carrito
    carrito.addEventListener('click', (e)=>{carro.eliminarProducto(e), carro.contarProductos()});

    //Al vaciar carrito
    vaciarCarritoBtn.addEventListener('click', (e)=>{carro.vaciarCarrito(e), carro.contarProductos()});

    //Al cargar documento se muestra lo almacenado en LS
    document.addEventListener('DOMContentLoaded', carro.leerLocalStorage());

    //Enviar pedido a otra pagina
    procesarPedidoBtn.addEventListener('click', (e)=>{carro.procesarPedido(e)});
    

}




