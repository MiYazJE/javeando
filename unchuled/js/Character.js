export default class Character {

    constructor(posY, posX) {
        this.y = posY;
        this.x = posX;
        this.vidas = 5;
        this.pergamino = false;
        this.llave = false;
        this.urna = false;
    }

    reset = () => {
        this.pergamino = false;
        this.llave     = false;
        this.urna      = false;
    }

}