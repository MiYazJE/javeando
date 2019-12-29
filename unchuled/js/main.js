import Character from './Character.js';
import {insertarContenidoLeyenda, reiniciarCajasLeyenda, actualizarVidas} from './Leyenda.js';

// Un fondo por nivel
let coloresNiveles = ['#4B67D9', '#A300FF', '#00FFCD', '#00FF0A'];
let nivel = 1;

let totalMomias = 1;
let mapa    = [];
let pisadas = [];
let momias  = [];
let cajasDescubiertas = [];
let contenidoCajas = [];
const personaje = new Character(0, 8);
let puntos = 0;
let gameOver = false;
let intervaloMover;

let audio = new Audio('media/mario-undeground.mp3');
audio.autoplay = true;
audio.onended = () => audio.play();
eventoVolumen();

inicializarMapa();
crearContenedorVidas();
play();

function play() {
    
    document.querySelector('html').style.backgroundColor = 
            coloresNiveles[parseInt(nivel-1 % coloresNiveles.length)];

    cajasDescubiertas = new Array(20).fill(false);
    actualizarPuntuacion();
    rellenarContenidoCajas();
    
    personaje.reset();
    resetPisadas();

    momias = [];
    crearMomias();
    mostrarMomias();
}

setInterval(moverMomias, 500);

function inicializarMapa() {

    let tablero = document.querySelector('.tablero');

    mapa[0] = [];
    for (let i = 0; i < 21; i++) {
        let div = document.createElement('div');
        div.classList.add('nada');
        mapa[0][i] = div;
        tablero.appendChild(div);
    }

    // Celda de inicio del personaje
    mapa[personaje.y][personaje.x].classList = ['celda'];

    for (let i = 1; i < 14; i++) {
        mapa[i] = [];
        for (let j = 0; j < 21; j++) {

            let divCelda = document.createElement('div');

            divCelda.classList.add('celda');
            if (i % 3 != 1 && j % 4 != 0) {
                divCelda.classList.add('caja');
            }

            mapa[i][j] = divCelda;
            tablero.appendChild(divCelda);
        }
    }

    mapa[personaje.y][personaje.x].classList.add('personaje');
    mapa[personaje.y][personaje.x].classList.add('personaje-standard');
}

function limpiarMapa() {

    for (let i = 0; i < 21; i++) mapa[0][i].classList = ['nada'];
    mapa[0][8].classList = ['celda'];

    for (let i = 1; i < 14; i++) {
        for (let j = 0; j < 21; j++) {
            mapa[i][j].classList = ['celda'];
            if (i % 3 != 1 && j % 4 != 0) 
                mapa[i][j].classList.add('caja');
        }
    }

    mapa[0][8].classList.add('personaje');
    mapa[0][8].classList.add('personaje-standard');
}

function move(Y, X) {

    // Elimina el continuo movimiento anterior
    clearInterval(intervaloMover);

    // Comprobar si el personaje esta en la casilla de inicio[0][8]
    // con la llave y la urna
    if (personaje.y == 0 && personaje.x == 8 && Y == -1 &&
        personaje.llave && personaje.urna) {
        // Accederemos al siguiente nivel con una momia mas 
        siguienteNivel();
        return;
    }

    let classDirection;
    if (X == -1) {
        if (mapa[personaje.y][personaje.x].classList.contains('personaje-left'))
            classDirection = 'personaje-left2';
        else 
            classDirection = 'personaje-left';
    }
    else if (X == 1) {
        if (mapa[personaje.y][personaje.x].classList.contains('personaje-right'))
            classDirection = 'personaje-right2';
        else 
            classDirection = 'personaje-right';
    }
    else {
        classDirection = 'personaje-standard';
    }

    let posX = personaje.x + X;
    let posY = personaje.y + Y;

    // Salir si la posicion del personaje esta fuera del mapa o si su direccion esta 
    // ocupada por una caja
    if (!isValidCharacterPosition(posY, posX)) return;

    // Eliminar anterior posicion del personaje
    mapa[personaje.y][personaje.x].classList = ['celda'];
    
    let clase = 'pisada-';
    if (X == 1)  clase += 'derecha';
    if (X == -1) clase += 'izquierda';
    if (Y == 1)  clase += 'abajo';
    if (Y == -1) clase += 'arriba';
    
    // Agregamos la clase pisado para que se visualize por donde ha pasado
    mapa[personaje.y][personaje.x].classList.add(clase);

    // Marcamos que el personaje ya ha pasado por aqui
    pisadas[personaje.y][personaje.x] = true;

    // Actualizar la posicion
    personaje.y = posY;
    personaje.x = posX;

    // Comprobar que el personaje invada la posicion de una momia
    // si es asi hay que restarle una vida y matar a la momia
    if (mapa[personaje.y][personaje.x].classList.contains('momia')) {
        if (!personaje.pergamino) {
            quitarVida();
        }
        else {
            personaje.pergamino = false;
            applyContrastToMummies();
        }
        eliminarMomia(personaje.y, personaje.x);
    }

    // Actualizar la nueva posicion del personaje en el mapa
    mapa[personaje.y][personaje.x].classList = [];
    mapa[personaje.y][personaje.x].classList.add('celda');
    mapa[personaje.y][personaje.x].classList.add('personaje');
    mapa[personaje.y][personaje.x].classList.add(classDirection);

    comprobarCajas();
    intervaloMover = setInterval(() => {move(Y, X)}, 200);
}

function seguirJugando() {
    document.querySelector('.gameOver').style.display = 'none';
    reiniciar();
    crearContenedorVidas();
    limpiarMapa();
    play();
}

function siguienteNivel() {
    totalMomias++;
    reiniciarCajasLeyenda();
    nivel++;
    refrescarNivel();
    limpiarMapa();
    play();
}

function quitarVida() {
    if (personaje.vidas == 0) {
        gameOver = true;
        document.querySelector('.gameOver').style.display = 'block';
    }
    else {
        personaje.vidas--;
        actualizarVidas();
    }
}

// Resetearlo todo
function reiniciar() {
    totalMomias = 1;
    personaje.reset();
    personaje.vidas = 5;
    personaje.y = 0;
    personaje.x = 8;
    nivel = 1;
    refrescarNivel();
    puntos = 0;
    reiniciarCajasLeyenda();
}

function isValidCharacterPosition(posY, posX) {
    return (posX < mapa[0].length && posX >= 0 && posY < mapa.length && posY >= 0 &&
        !mapa[posY][posX].classList.contains('caja')) &&
        !mapa[posY][posX].classList.contains('nada');
}

// Comprueba si las cajas estan totalmente cubiertas de pisadas
function comprobarCajas() {

    for (let i = 2, posCaja = 0; i < mapa.length; i += 3)
        for (let j = 1; j < mapa[0].length; j += 4, posCaja++)
            if (!cajasDescubiertas[posCaja] && mapa[i][j].classList.contains('caja'))
                if (cajaRodeada(i, j)) {

                    cajasDescubiertas[posCaja] = true;
                    descubrirCaja(i, j, posCaja);

                    if (contenidoCajas[posCaja] == 'cofre') {
                        puntos = parseInt(puntos) + 200;
                        actualizarPuntuacion();
                        insertarContenidoLeyenda('contenedorMonedas', 'leyendaCajaMoneda', 'cantidadMonedas');
                    }
                    else if (contenidoCajas[posCaja] == 'pergamino') {
                        personaje.pergamino = true;
                        applyContrastToMummies();
                    }
                    else if (contenidoCajas[posCaja] == 'llave') {
                        insertarContenidoLeyenda('contenedorLlave', 'leyendaCajaLlave', 'cantidadLlaves');
                        personaje.llave = true;
                    }
                    else if (contenidoCajas[posCaja] == 'urna') {
                        insertarContenidoLeyenda('contenedorUrna', 'leyendaCajaUrna', 'cantidadUrnas');
                        personaje.urna = true;
                    }
                }

}

function cajaRodeada(posY, posX) {

    for (let i = posY - 1; i < posY + 3; i++) {
        for (let j = posX - 1; j < posX + 4; j++) {
            if ((i >= posY && i <= (posY + 1)) && (j >= posX && j <= (posX + 2)))
                continue;
            if (!pisadas[i][j]) return false;
        }
    }

    return true;
}

function descubrirCaja(posY, posX, posCaja) {

    if (contenidoCajas[posCaja] == 'vacio') {
        for (let i = posY; i < posY + 2; i++) 
            for (let j = posX; j < posX + 3; j++)  {
                mapa[i][j].classList.add('vacio');
            }
    }
    // Insertar urna, pergamino o cofre
    else if (contenidoCajas[posCaja] != 'momia') {
        for (let i = posY; i < posY + 2; i++) 
            for (let j = posX; j < posX + 3; j++) 
                mapa[i][j].classList.add('sinFondo');

        mapa[posY][posX + 1].classList.add(contenidoCajas[posCaja]);
    }
    else {
        // insertar momia
        for (let i = posY; i < posY + 2; i++) 
            for (let j = posX; j < posX + 3; j++) 
                    mapa[i][j].classList.add('vacio');

        // Elegir de que esquina saldra la momia
        let dirY = [0, 1, 0, 1];
        let dirX = [0, 0, 2, 2];
        let rnd = Math.floor(Math.random() * 4);
        
        posY += dirY[rnd];
        posX += dirX[rnd];

        // mostrar la momia en una esquina
        mapa[posY][posX].classList = ['celda'];
        mapa[posY][posX].classList.add('momia');
        if (personaje.pergamino)
            mapa[posY][posX].classList.add('contraste');

        // creacion de la momia
        momias.push(new Character(posY, posX));
    }

}

function crearMomias() {
    let momiasCreadas = 0;
    while (momiasCreadas < totalMomias) {
        let posY = Math.floor(Math.random() * 13);
        let posX = Math.floor(Math.random() * 21);
        if (posY < 5) continue;
        if (!mapa[posY][posX].classList.contains('caja') &&
            !mapa[posY][posX].classList.contains('personaje') && 
            !mapa[posY][posX].classList.contains('nada')) {
            momiasCreadas++;
            momias.push(new Character(posY, posX));
        }
    }
}

function mostrarMomias() {
    for (let momia of momias) {
        mapa[momia.y][momia.x].classList.add('momia');
        if (personaje.pergamino) mapa[momia.y][momia.x].classList.add('contraste');
    }
}

function moverMomias() {

    for (let i = 0; i < momias.length; i++) {

        let posY = 0, posX = 0;
        let momia = momias[i];

        if (momia.y < personaje.y && isValidMomiaPosition((momia.y + 1), momia.x)) {
            posY = 1;
        }   
        else if (momia.y > personaje.y && isValidMomiaPosition((momia.y - 1), momia.x)) {
            posY = -1;
        }
        else if (momia.x < personaje.x && isValidMomiaPosition(momia.y, (momia.x + 1))) {
            posX = 1;
        }
        else if ( isValidMomiaPosition(momia.y, (momia.x - 1)) ) {
            posX = -1;
        }

        // Quitamos la momia de la posicion actual
        mapa[momia.y][momia.x].classList.remove('momia');
        mapa[momia.y][momia.x].classList.remove('contraste');

        // Actualizamos la nueva posicion de la momia
        momia.y += posY;
        momia.x += posX;

        // Comprobar si el personaje y la momia han colisionado
        if (mapa[momia.y][momia.x].classList.contains('personaje')) {
            // Eliminamos la momia
            momias.splice(i, 1);    
            // Si el personaje no tiene el pergamino perdera una vida
            if (!personaje.pergamino) { 
                quitarVida();
            }
            else {
                personaje.pergamino = false;
                applyContrastToMummies();
            }
        }
        else {
            // Si la momia no muere a manos del personaje la pintaremos en el mapa con suu nueva posicion
            mapa[momia.y][momia.x].classList.add('momia');
            if (personaje.pergamino)
                mapa[momia.y][momia.x].classList.add('contraste');
        }

    }
    
}

let isValidMomiaPosition = (y, x) => {
    return  x >= 0 && x < mapa[0].length &&
            y >= 0 && y < mapa.length && 
            !mapa[y][x].classList.contains('caja') && 
            !mapa[y][x].classList.contains('nada') && 
            !mapa[y][x].classList.contains('momia');
}

function eliminarMomia(y, x) {
    let momiaEliminada = false;
    for (let i = 0; i < momias.length && !momiaEliminada; i++) {
        if (x == momias[i].x && y == momias[i].y) {
            momias.splice(i, 1); 
            momiaEliminada = true;
        }
    } 
}

function crearContenedorVidas() {
    let contenedorVidas = document.querySelector('.contenedor-cajaVidas');
    for (let i = 0; i < personaje.vidas; i++) {
        let cajaVida = document.createElement('div');
        cajaVida.classList.add('cajaVidas');
        contenedorVidas.appendChild(cajaVida);
    }
}

function rellenarContenidoCajas() {

    contenidoCajas = new Array(20).fill('vacio');

    // *******************
    // * INSERTAR COFRES *
    // *******************

    let cofresMax = Math.floor(Math.random() * (15 - 7 + 1)) + 7;
    while (cofresMax != 0) {
        var rnd = Math.floor(Math.random() * 20);
        if (contenidoCajas[rnd] == 'vacio') {
            cofresMax--;
            contenidoCajas[rnd] = 'cofre';
        }
    }

    //      *******************************************
    //      * INSERTAR PERGAMINO, LLAVE, MOMIA y URNA *
    //      *******************************************

    let elementos = ['pergamino', 'llave', 'momia', 'momia', 'urna'];
    let index = 0;

    while (index != elementos.length) {
        var rnd = Math.floor(Math.random() * 20);
        if (contenidoCajas[rnd] == 'vacio') 
            contenidoCajas[rnd] = elementos[index++];
    }

}

function actualizarPuntuacion() {
    let spanPuntos = document.querySelector('.puntos');
    puntos = String(puntos);
    if (puntos.length < 5)
        for (let i = puntos.length; i < 5; i++) puntos = '0' + puntos;
    spanPuntos.innerHTML = puntos;
}

function resetPisadas() {
    for (let i = 0; i <= 13; i++) 
        pisadas[i] = new Array(21).fill(false);
}

document.addEventListener('keydown', (key) => {

    // Si se ha indicado el gameOver, solo y solo si, empezar de nuevo
    // si se presiona la tecla "Enter"
    if (gameOver) {
        if (key.key != 'Enter') return;
        gameOver = false;
        seguirJugando();
        return;
    }

    switch (key.key) {
        case 'ArrowUp':    case 'w': move(-1, 0); break;
        case 'ArrowLeft':  case 'a': move(0, -1); break;
        case 'ArrowRight': case 'd': move(0, 1);  break;
        case 'ArrowDown':  case 's': move(1, 0);  break;
        case 'M': case 'm': cambiarVolumen(); return;
    }

})

function applyContrastToMummies() {
    for (let momia of momias) {
        if (personaje.pergamino)
            mapa[momia.y][momia.x].classList.add('contraste');        
        else 
            mapa[momia.y][momia.x].classList.remove('contraste');        
    }
}

function eventoVolumen() {
    let button = document.querySelector('.btnMute'); 
    button.addEventListener('click', () => {
        cambiarVolumen();
    })
}

function cambiarVolumen() {
    let button = document.querySelector('.btnMute');
    button = button.firstElementChild;
    if (button.classList.contains('fa-volume-up')) {
        button.classList.remove('fa-volume-up');
        button.classList.add('fa-volume-mute');
        audio.volume = 0;
    }
    else {
        button.classList.remove('fa-volume-mute');
        button.classList.add('fa-volume-up');
        audio.volume = 1;
    }
}

function refrescarNivel() {
    let textNivel = document.querySelector('.nivel');
    console.log(textNivel);
    textNivel.innerHTML = nivel;
    console.log(textNivel);
}