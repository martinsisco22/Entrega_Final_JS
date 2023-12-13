

const baseURL = "./json/index.json"

let productos = []

fetch(baseURL)
  .then(Response => Response.json())
  .then(data => {
    productos = data

  empaquetar(productos)

    let botonesCategoria = document.getElementsByClassName("botones__categoria")
    for (let i = 0; i < botonesCategoria.length; i++) {
        botonesCategoria[i].addEventListener ("click", categorizar)
    }

    let botonOrden = document.getElementById("select__orden")
    botonOrden.addEventListener("click", ordenar)

    let busquedaInput = document.getElementById("busqueda__input")
    busquedaInput.addEventListener('input', recorrer)

    window.addEventListener('beforeunload', function() {
      localStorage.removeItem('carrito')
    })

    let ingreso = document.getElementById("opcion__ingreso")
    ingreso.addEventListener("click", loguear)

    
    let botonPagar = document.getElementById("boton__pagar")
    botonPagar.addEventListener("click", function(event) {
      event.preventDefault()
      pagar()
    })
  }
)

.catch(() => Swal.fire(
  'Error 404',
  'No pudimos encontrar tu página. Revisa los accesos con tu soporte técnico',
  'warning'
))



/* EMPAQUETAR */

function empaquetar (productos) {
    let containerProductos = document.getElementById("container__productos")
    containerProductos.innerHTML = ""

    productos.forEach(producto => {
        let card__productos = document.createElement("div")

        card__productos.innerHTML = `<h2 class="titulo__producto">${producto.nombre}</h2>
                                      <img src="${producto.imagen}" class="imagen__producto">
                                      <p> Precio: $${producto.precio}</p>
                                      <button class="button" id="button__producto" type="submit" value="${producto.id}">Comprar</button>
                                      <p class="parrafo__stock"> Quedan ${producto.stock} unidades</p>`
        

        card__productos.classList.add("card__productos")
        containerProductos.classList.add("container__productos")
        containerProductos.appendChild(card__productos)
                               
    })

    let botonesCompra = document.getElementsByClassName("button")  

    for (let i = 0; i < botonesCompra.length; i++) {
      botonesCompra[i].addEventListener("click", comprar)
    }
}



/* CATEGORIAS */

let categoriaActual = "todos"

function categorizar(event) {
  let valorCategoria = event.target.value.toLowerCase()
  let resultadoCategoria = productos.filter((producto) => producto.categoria.toLowerCase() === valorCategoria)

  /*Ternario */
  valorCategoria === "todos" ? empaquetar(productos) : empaquetar(resultadoCategoria)

  let nombreCategoria = document.getElementById("productos__title")
  nombreCategoria.innerText = event.target.value
  
  categoriaActual = event.target.value.toLowerCase()
}




/* ORDEN */

function ordenar(event) {
  let resultadoOrden
  
  if (event.target.value === "menorPrecio") {
    resultadoOrden = productos.sort((a,b) => a.precio - b.precio)
    empaquetar(resultadoOrden)
  }

  else if (event.target.value === "mayorPrecio") {
    resultadoOrden = productos.sort((a,b) => b.precio - a.precio)
    empaquetar(resultadoOrden)
  }

  else if (event.target.value === "menorStock") {
    resultadoOrden = productos.sort((a,b) => a.stock - b.stock)
    empaquetar(resultadoOrden)
  }

  else if (event.target.value === "mayorStock") {
    resultadoOrden = productos.sort((a,b) => b.stock - a.stock)
    empaquetar(resultadoOrden)
  }
  else if (event.target.value === "none") {  
    return empaquetar(productos)
  }
}


/* BUSQUEDA */

function recorrer (event) {
  let busqueda = event.target.value.toLowerCase()
  let productoBuscado = productos.filter(producto => producto.nombre.toLowerCase().includes(busqueda))

  productoBuscado ? empaquetar(productoBuscado) : empaquetar(productos)
}



/* CARRITO */

const carrito = JSON.parse(sessionStorage.getItem('carrito')) || []


function comprar (event) {
    let productoId = parseInt(event.target.value)
    let producto = productos.find(producto => productoId === producto.id)

    if (producto && producto.stock > 0 ) {
      let productoEnCarrito = carrito.find(producto => parseInt(productoId) === producto.id)

        if (productoEnCarrito) {
            productoEnCarrito.cantidad++
        }

        else {
            productoEnCarrito = {
                id : producto.id,
                nombre: producto.nombre,
                categoria: producto.categoria,
                stock: producto.stock,
                precio: producto.precio,
                cantidad: 1
            }
            carrito.push(productoEnCarrito)
        }
        
        sessionStorage.setItem('carrito', JSON.stringify(carrito))
        producto.stock--
        
        mostrarCarrito()

        Toastify({
          text: "Producto agregado al carrito",
          close: true,
          duration: 3000,
          stopOnFocus: true,
          style: {
            background: "linear-gradient(to right, #bbbaba, #358bf9)",
          },
          }).showToast()
    }

    else {
      Swal.fire(
        'No hay mas stock',
        'Lo siento, no contamos con stock de producto',
        'warning'
      )
    }
}




/* MOSTRAR CARRITO */

function mostrarCarrito() {
    let carritoContainer = document.getElementById("carrito__productos")
    carritoContainer.innerHTML = ""
    let parrafoTotal = document.getElementById("parrafo__total")
    let total = 0
    
    carrito.forEach((producto, index) => {
        
      let contenedorProducto = document.createElement("div")
      contenedorProducto.innerHTML = `<p>${producto.nombre}</p> <p>${producto.cantidad}</p> <p>$${producto.precio}</p><img src="./images/equis.png" class="eliminar-producto">`

      contenedorProducto.className = "carrito__producto"
      carritoContainer.appendChild(contenedorProducto)
    
      let eliminarProducto = contenedorProducto.querySelector(".eliminar-producto")
      eliminarProducto.addEventListener("click", () => remove(index))
          
      total += producto.precio * producto.cantidad
    })

    parrafoTotal.innerText = `TOTAL: $${total}`
  }
 

/* ELIMINAR PRODUCTOS */

function remove(index) {
  let productoEliminado = carrito[index]
  carrito.splice(index, 1)
  
  localStorage.setItem('carrito', JSON.stringify(carrito))
    
  let productoOriginal = productos.find(p => p.id === productoEliminado.id)
  productoOriginal.stock += productoEliminado.cantidad
  
  mostrarCarrito()
  empaquetar(productos)

  Toastify({
    text: "Producto eliminado",
    close: true,
    duration: 3000,
    stopOnFocus: true,
    style: {
      background: "linear-gradient(to right, #c18a8a, #fb0000)",
    },
    }).showToast()
}



/* INGRESO*/
 
function loguear() {
  let megaContainer = document.getElementById("mega__container")
  megaContainer.classList.add("mega__container")
    
  
  let logueoContainer = document.createElement("div")
  logueoContainer.innerHTML = `<h2> Ingresá tus datos</h2>
                              <form id="form__ingreso">
                                <input type="text" placeholder="Ingresá tu nombre" id="input__nombre">
                                <input type="text" placeholder="Ingresá tu apellido" id="input__apellido">
                                <input type="email" placeholder="Ingresá tu mail" id="input__mail">
                                <input type="password" placeholder="Creá tu contraseña" id="input__contrasena">
                                <button id="ingresar__button" type="button">Ingresar</button>
                              </form>
                              <img id="equis__ingreso" src="./images/equis.png">`
  logueoContainer.classList.add("logueo__container")
  document.body.appendChild(logueoContainer)
  

  let equisIngreso = logueoContainer.querySelector("#equis__ingreso")
  equisIngreso.addEventListener("click", function() {
  document.body.removeChild(logueoContainer)
  megaContainer.classList.remove("mega__container")
  })
    
  let inicioSesion = document.getElementById("ingresar__button")
  inicioSesion.addEventListener("click", iniciar)
}
  



 /* INICIO SESION*/
  
function iniciar (event) {

  event.preventDefault()

  let nombreUsuario = document.getElementById("input__nombre").value
  let apellidoUsuario = document.getElementById("input__apellido").value
  let mailUsuario = document.getElementById("input__mail").value
  let contrasenaUsuario = document.getElementById("input__contrasena").value

  localStorage.setItem('nombre', nombreUsuario)
  localStorage.setItem('apellido', apellidoUsuario)
  localStorage.setItem('mail', mailUsuario)
  localStorage.setItem('contrasena', contrasenaUsuario)
  
  let bienvenida = document.createElement("div")
  bienvenida.innerHTML = "Hola " + nombreUsuario + `<p id="cerrar__sesion">Cerrar Sesion</p>`
  document.getElementById("header__usuario").appendChild(bienvenida)
  bienvenida.classList.add("bienvenida")
  document.getElementById("opcion__ingreso").classList.add("ingreso__off")


  let megaContainer = document.getElementById("mega__container")
  megaContainer.classList.remove("mega__container")
  let logueoContainer = document.querySelector(".logueo__container")
  document.body.removeChild(logueoContainer)

  let cerrarSesion = document.getElementById("cerrar__sesion")
  cerrarSesion.addEventListener("click", function() {
    localStorage.clear()
    sessionStorage.clear()
    location.reload()
  }
  )
}



/* PAGO */

function pagar() {  

  if (localStorage.getItem('nombre')) {
    if (carrito.length === 0) {
      Swal.fire(
        'Tu carrito está vacio',
        'Primero agrega productos a tu carrito',
        'error'
      )
    } else {
      let contenedorCompra = document.createElement("div")
      contenedorCompra.classList.add("contenedor__compra")
      let megaContainer = document.getElementById("mega__container")
      megaContainer.classList.add("mega__container")
      contenedorCompra.innerHTML = "<h2>Estás por comprar:</h2>"

      let total = 0

      carrito.forEach(producto => {
        contenedorCompra.innerHTML += `<p>${producto.nombre} x ${producto.cantidad} - $${producto.precio}</p>` 
        total += producto.precio * producto.cantidad
      })

      contenedorCompra.innerHTML += `<p class="parrafo__pago">Total a pagar: $${total}</p>
                                      <button id="pago__final" type="button">Pagar</button>
                                      <img id="equis__pago" src="./images/equis.png">`
      
      document.body.appendChild(contenedorCompra)
      let pagoFinal = document.getElementById("pago__final")
      pagoFinal.addEventListener("click", pagoConfirmado)
      
      let equisPago = contenedorCompra.querySelector("#equis__pago")
      equisPago.addEventListener("click", function() {
        
        document.body.removeChild(contenedorCompra)
        megaContainer.classList.remove("mega__container")
      })
    }
  } else {
    loguear()
  }
}




function pagoConfirmado () {

  let contenedorLoading = document.createElement("div")
  document.body.appendChild(contenedorLoading)
  contenedorLoading.classList.add("contenedor__loading")
  contenedorLoading.innerHTML = `<h3>Estamos procesando tu pago</h3><div class="anillo"><div></div><div></div><div></div><div></div></div><p>Aguardá unos segundos</p>`

  let contenedorCompra = document.querySelector(".contenedor__compra")
  document.body.removeChild(contenedorCompra)

  setTimeout(() => {

  contenedorLoading.classList.add("contenedor__loading--out")

  Swal.fire({
    icon: 'success',
    title:'GRACIAS POR TU COMPRA',  
    text:'Tu pago se ha realizado con éxito',
    
  }
  ).then(()=> {
    localStorage.clear()
    sessionStorage.clear()
    location.reload()
  })
  .catch(() =>  Swal.fire(
    'Error',
    'Algo saló mal',
    'warning'
  ))
  }, 2000)
}