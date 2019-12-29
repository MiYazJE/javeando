// Este fichero es el encargado de la logica del apartado de la leyenda del juego,
// insertar elementos recogidos, eliminarlos...

export function insertarContenidoLeyenda(contenedor, estiloItemInventario, elementoCantidadInventario) {

    let parent = document.querySelector('.' + contenedor);
    let contenido = document.querySelector('.' + elementoCantidadInventario);

    let value = contenido.innerHTML.substring(1);
    contenido.innerHTML = 'x' + (parseInt(value) + 1);

    let item = document.createElement('div');
    item.classList.add(estiloItemInventario);
    parent.appendChild(item);
}

export function reiniciarCajasLeyenda() {

    let roots = document.querySelectorAll('.wrapLeyendaCajas');
    for (let i in roots) {
        let eliminarHijos = roots[i];
        while (eliminarHijos.firstChild)
            eliminarHijos.removeChild(eliminarHijos.firstChild);
    }

    document.querySelector('.cantidadMonedas').innerHTML = 'x0';
    document.querySelector('.cantidadUrnas').innerHTML   = 'x0';
    document.querySelector('.cantidadLlaves').innerHTML  = 'x0';
}

export function actualizarVidas() {
    let cajaVidas = document.querySelector('.cajaVidas');
    if (cajaVidas && cajaVidas.parentNode)
        cajaVidas.parentNode.removeChild(cajaVidas);
}
