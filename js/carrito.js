class Carrito {
    constructor(){}
 
    
    //Añadir producto al carrito
    comprarProducto(e){  
        e.preventDefault(); 
        //Delegado para agregar al carrito
        if(e.target.classList.contains('agregar-carrito')){
            const producto = e.target.parentElement;
            console.log(producto);
            //Enviamos el producto seleccionado para tomar sus datos
            this.leerDatosProducto(producto);
        }
    } 

 
    //Leer datos del producto
    leerDatosProducto(producto){
        const infoProducto = {
            imagen : producto.querySelector('img').src,
            titulo: producto.querySelector('h4').textContent,
            precio: Number(producto.querySelector('.precio span').innerText),
            id: producto.querySelector('a').getAttribute('data-id'),
            cantidad: 1
        }
        let productosLS;
        productosLS = this.obtenerProductosLocalStorage();
        productosLS.forEach(function (productoLS){
            if(productoLS.id === infoProducto.id){
                productosLS = productoLS.id;
            }
        });
        if(productosLS === infoProducto.id){
            Swal.fire({
                type: 'info',
                text: 'El producto ya está agregado',
                showConfirmButton: false,
                timer: 1000
            })
        }
        else {
            this.insertarCarrito(infoProducto);
        }
    } 

   //muestra producto seleccionado en carrito
    insertarCarrito(producto){
        const listaProductos = document.querySelector('#lista-carrito tbody');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="align-middle">
                <img src="${producto.imagen}" width=100>
            </td>
            <td class="align-middle text-wrap">${producto.titulo}</td>
            <td class="align-middle text-center">$${producto.precio}</td>
            <td class="align-middle text-center">${producto.cantidad}</td>
            <td class="align-middle text-center">
                <i href="#" class="borrar-producto fas fa-times-circle ps-5" data-id="${producto.id}"></i>
            </td>
        `;
        listaProductos.appendChild(row);
        this.guardarProductosLocalStorage(producto);
    } 

    contarProductos(){
        let productosLS; 
        let notificacion = document.getElementById("notificacion");
        productosLS = this.obtenerProductosLocalStorage();
        if(productosLS.length == 0){
            notificacion.innerHTML = productosLS.length;
            notificacion.classList.remove("animate__fadeIn");
            notificacion.classList.add("animate__animated", "animate__fadeOut");
        }
        else{
            notificacion.style.display = "flex";
            notificacion.innerHTML = productosLS.length;
            notificacion.classList.remove("animate__fadeOut");
            notificacion.classList.add("animate__animated", "animate__fadeIn");
        }
    } 

    //Eliminar el producto del carrito en el DOM 
    eliminarProducto(e){
        e.preventDefault();
        let producto, productoID;
        if(e.target.classList.contains('borrar-producto')){
            e.target.parentElement.parentElement.remove();
            producto = e.target.parentElement.parentElement;
            productoID = producto.querySelector('i').getAttribute('data-id');
        }
        this.eliminarProductoLocalStorage(productoID);
    }

    //Elimina todos los productos
    vaciarCarrito(e){
        e.preventDefault();
        const listaProductos = document.querySelector('#lista-carrito tbody');
        while(listaProductos.firstChild){
            listaProductos.removeChild(listaProductos.firstChild);
        }
        this.vaciarLocalStorage();
        return false;
    }

    //Almacenar en el LS
    guardarProductosLocalStorage(producto){
        let productos;
        //Toma valor de un arreglo con datos del LS
        productos = this.obtenerProductosLocalStorage();
        //Agregar el producto al carrito
        productos.push(producto);
        //Agregamos al LS
        localStorage.setItem('productos', JSON.stringify(productos));
    }

    //Comprobar que hay elementos en el LS
    obtenerProductosLocalStorage(){
        let productoLS;

        //Comprobar si hay algo en LS
        if(localStorage.getItem('productos') === null){
            productoLS = [];
        }
        else {
            productoLS = JSON.parse(localStorage.getItem('productos'));
        }
        return productoLS;
    }

    //Mostrar los productos guardados en el LS
    leerLocalStorage(){
        let productosLS;
        productosLS = this.obtenerProductosLocalStorage();
        productosLS.forEach(function (producto){
            //Construir plantilla
            const listaProductos = document.querySelector('#lista-carrito tbody');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="align-middle">
                    <img src="${producto.imagen}" width=100>
                </td>
                <td class="align-middle text-wrap">${producto.titulo}</td>
                <td class="align-middle text-center">${producto.precio}</td>
                <td class="align-middle text-center">${producto.cantidad}</td>
                <td class="align-middle text-center">
                    <i href="#" class="borrar-producto fas fa-times-circle ps-5" data-id="${producto.id}"></i>
                </td>
            `;
            listaProductos.appendChild(row);
        });
        this.contarProductos(); 
        
    } 

    //Mostrar los productos guardados en el LS en compra.html
    leerLocalStorageCompra(){
        let productosLS;
        productosLS = this.obtenerProductosLocalStorage();
        productosLS.forEach(function (producto){
            const row = document.createElement('tr');
            const listaCompra = document.querySelector("#lista-compra tbody");
            row.innerHTML = `
                <td>
                    <img src="${producto.imagen}" width=100>
                </td>
                <td class="align-middle text-wrap">${producto.titulo}</td>
                <td class="align-middle">$${producto.precio}</td>
                <td class="align-middle">
                    <input type="number" class="form-control cantidad" min="1" max="20" value=${producto.cantidad}>
                </td>
                <td id='subtotales' class="align-middle">$${producto.precio * producto.cantidad}</td>
                <td class="align-middle">
                    <i href="#" class="borrar-producto fas fa-times-circle" style="font-size:30px" data-id="${producto.id}"></i>
                </td>
            `;
            listaCompra.appendChild(row);
        });
    } 

    //Eliminar producto por ID del LS
    eliminarProductoLocalStorage(productoID){
        let productosLS;
        //Obtenemos el arreglo de productos
        productosLS = this.obtenerProductosLocalStorage();
        //Comparar el id del producto borrado con LS
        productosLS.forEach(function(productoLS, index){
            if(productoLS.id === productoID){
                productosLS.splice(index, 1);
            }
        });
        //Añadimos el arreglo actual al LS
        localStorage.setItem('productos', JSON.stringify(productosLS));
        
    }

    //Eliminar todos los datos del LS
    vaciarLocalStorage(){
        //let notificacion = document.getElementById("notificacion");
        localStorage.clear();
    } 

    //Procesar pedido
    procesarPedido(e){
        e.preventDefault();

        if(this.obtenerProductosLocalStorage().length === 0){
            Swal.fire({
                type: 'error',
                text: 'El carrito está vacío, agrega algún producto',
                showConfirmButton: false,
                timer: 2000
            })
        }
        else {
            window.location.href = "paginas/compra.html";
        }
    }

    //Calcular montos
    calcularTotal(){
        let productosLS;
        let total = 0;
        let totalFinal = document.getElementById('total');
        productosLS = this.obtenerProductosLocalStorage();
        for(let i = 0; i < productosLS.length; i++){
            let element = Number(productosLS[i].precio * productosLS[i].cantidad);
            total = total + element;
            
        }
        
        totalFinal.value = "$" + total.toFixed(2);
    } 


    obtenerEvento(e) {
        e.preventDefault();
        let id, cantidad, producto, productosLS;
        if (e.target.classList.contains('cantidad')) {
            producto = e.target.parentElement.parentElement;
            id = producto.querySelector('i').getAttribute('data-id');
            cantidad = producto.querySelector('input').value;
            let actualizarMontos = document.querySelectorAll('#subtotales');
            productosLS = this.obtenerProductosLocalStorage();
            productosLS.forEach(function (productoLS, index) {
                if (productoLS.id === id) {
                    productoLS.cantidad = cantidad;                    
                    actualizarMontos[index].innerHTML = "$" + Number(cantidad * productosLS[index].precio);
                }    
            });
            localStorage.setItem('productos', JSON.stringify(productosLS));
            
        }
        else {
            console.log("click afuera");
        }
    } 
    
}

export {Carrito};