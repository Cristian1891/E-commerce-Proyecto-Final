import { Carrito } from './carrito.js';

const compra = new Carrito();
const carrito = document.getElementById('carrito');
const procesarCompraBtn = document.getElementById('procesar-compra');
const cliente = document.getElementById('cliente');
const correo = document.getElementById('correo');
const direccion = document.getElementById('direccion');
const telefono = document.getElementById('telefono');
const total = document.getElementById('total');

//Validaciones formulario de compra
let validation = {
    isCliente:function(str){
        let pattern =/^[a-zA-Z\s]+$/;
        return pattern.test(str);  // retorna un booleano
    },
    isCorreo:function (str){
        let pattern =/^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-Z0-9]{2,4}$/;
        return pattern.test(str);  
    },
    isDireccion:function(str){
        let pattern = /^[a-zA-Z0-9\s]+$/;
        return pattern.test(str);  
    },
    isTelefono:function(str){
        let pattern = /^([0-9]{8}|[0-9]{10})$/;
        return pattern.test(str); 
    }
};  

cargarEventos();

function cargarEventos() {
    document.addEventListener('DOMContentLoaded', compra.leerLocalStorageCompra());

    //Eliminar productos del carrito
    carrito.addEventListener('click', (e) => { compra.eliminarProducto(e), compra.calcularTotal()});

    compra.calcularTotal();

    //cuando se selecciona procesar Compra
    procesarCompraBtn.addEventListener('click', procesarCompra);

    carrito.addEventListener('change', (e) => { compra.obtenerEvento(e) });
    carrito.addEventListener('keyup', (e) => { compra.obtenerEvento(e) });
    

} 

function procesarCompra() {

    if (compra.obtenerProductosLocalStorage().length === 0) {
        Swal.fire({
            type: 'error',
            text: 'No hay productos, selecciona alguno',
            showConfirmButton: false,
            timer: 2000
        }).then(function () {
            window.location.href = "../index.html";
        })
    }
    else if (cliente.value === '' || correo.value === '' || telefono.value === '' || direccion.value === '') {
        Swal.fire({
            type: 'error',
            text: 'Ingrese todos los campos requeridos',
            showConfirmButton: true
        })
    }
    else if(!(validation.isCliente(cliente.value))){
        Swal.fire({
            type: 'error',
            text: 'Su nombre completo solo debe contener letras',
            showConfirmButton: true
        })
        cliente.value = "";
    }
    else if(!(validation.isCorreo(correo.value))){
        Swal.fire({
            type: 'error',
            text: 'El email debe respetar la convencion ejemplo@gmail.com o ejemplo@hotmail.com',
            showConfirmButton: true
        })
        correo.value = "";   
    }
    else if(!(validation.isDireccion(direccion.value))){
        Swal.fire({
            type: 'error',
            text: 'La dirección debe contener letras y numeros',
            showConfirmButton: true
        })
        direccion.value = "";
    }
    else if(!(validation.isTelefono(telefono.value))){
        Swal.fire({
            type: 'error',
            text: 'El telefono solo debe contener un minimo de 8 numeros o un maximo de 10 numeros',
            showConfirmButton: true,
        })
        telefono.value = "";
    }
    else {

        const procesarPagoBtn = document.getElementById("procesar-pago");
        procesarPagoBtn.addEventListener('submit',  function(event) {
        event.preventDefault();//evitamos que se ejecute la funcion predeterminada por defecto del evento

        procesarCompraBtn.value = 'Procesando...';

        const cargandoGif = document.querySelector('#cargando');
        cargandoGif.style.display = 'block';

        const enviado = document.createElement('img');
        enviado.src = '../img/mail.gif';
        enviado.style.display = 'block';
        enviado.style.width = '250px';
        enviado.style.height = '200px';

        //Enviamos informacion en forma de parametros a traves de la url
        let params = {
            user_id: 'user_IjTt1eaQsxU2eVCr7Pgu8',
            service_id: 'default_service',
            template_id: 'template_hq87b19',
            template_params: {
              destinatario: cliente.value,
              email: correo.value,
              total: total.value,
              direccion: direccion.value
            }
        };
      
        let headers = {
            'Content-type': 'application/json'/*Tenemos la propiedad Content-type, con el valor que nos indica
            la documentacion de la API*/
        };
      
        //Definimos el segundo parametro opcional del fetch de tipo object en el cual transferimos datos en formato JSON
        let options = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(params)
        };
      
        fetch('https://api.emailjs.com/api/v1.0/email/send', options)
          .then(async (httpResponse) => {//Con async-await esperamos a que se resuelva la promesa para continuar con la siguiente instruccion
              if (httpResponse.ok) {
                procesarCompraBtn.value = 'Realizar Compra';
                cargandoGif.style.display = 'none';
                document.querySelector('#loaders').appendChild(enviado);

                setTimeout(() => {
                    enviado.remove();
                    compra.vaciarLocalStorage();
                    window.location.href = "../index.html";
                }, 2000);
              } else {
                  const text = await httpResponse.text();
                  return await Promise.reject(text);
              }
          })
          .catch((error) => {
            procesarCompraBtn.value = 'Realizar Compra';
            alert(JSON.stringify(error));
          });

        
        });

        

    } 
} 
 




