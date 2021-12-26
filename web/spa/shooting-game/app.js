// import { GameObject, Fighter, Monster, EventEmitter } from './classes_define.js';

const Messages = {
    'up': 'Messages-KEY_EVENT_UP',
    'down': 'Messages-KEY_EVENT_DOWN',
    'left': 'Messages-KEY_EVENT_LEFT',
    'right': 'Messages-KEY_EVENT_RIGHT',
    'shoot':'Message-KEY_EVENT_SPACEBAR'
}
let messageElement = document.getElementById('message');
let messageBoxElement = document.getElementById('message-box');
let canvasContainerElement = document.getElementById('canvasContainer');
let playAgainButtonElement = document.getElementById('play-again');
let stopPlayButtonElement = document.getElementById('thats-it');
let all_objects = [];

window.onload = async () => {
    let canvas = document.getElementById('myCanvas');
    let context = canvas.getContext('2d');
    window.addEventListener('keydown', preventDefaultKeyDown)
    const fighterImg = await loadImage('./assets/fighter4.png')
    const monsterImg = await loadImage('./assets/monster.png')
    const laserImg = await loadImage('./assets/laser.png')
    const explodeImg = await loadImage('./assets/explode.png')
    const lifeImg = await loadImage('./assets/life.png')
    const bangImg = await loadImage('./assets/bang.png')
    initGame(canvas, fighterImg, monsterImg, laserImg);
    let gameLoopId = setInterval(() => {
        let fighter = all_objects.filter(obj => obj.type=='Fighter')[0];
        let monsters = all_objects.filter(obj => obj.type=='Enemy');
        let message;
        monsters.forEach((m) => {
            if (m.y >= canvas.height - m.height) {
                clearInterval(gameLoopId)
                message = `Sorry! You lose.<br>Your score is ${fighter.score}!`;
                messageElement.innerHTML = message;
                canvasContainerElement.style.opacity = 0.5;
                messageBoxElement.style.display = 'flex';
            }
        })
        if (fighter.life >= 0 && monsters.length>0) {
            updateObjects(explodeImg, bangImg);
            drawMainFrame(canvas, context, fighter, lifeImg)
            all_objects.forEach(obj => obj.draw(context))
        } else {
            clearInterval(gameLoopId)
            if (fighter.life < 0) {
                message = `Sorry! You lose.<br>Your score is ${fighter.score}!`;
            } else {
                message = `Congratulations! You win.<br>Your score is ${fighter.score}!`;
            }
            messageElement.innerHTML = message;
            canvasContainerElement.style.opacity = 0.5;
            messageBoxElement.style.display = 'flex';
        }
    }, 100);
};
stopPlayButtonElement.addEventListener('click', () => {
    messageBoxElement.style.display = 'none';
    canvasContainerElement.style.opacity = 1;
})
playAgainButtonElement.addEventListener('click', () => {
    location.reload()
})

function drawMainFrame(canvas, context, fighter, lifeImg) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = 'bold 25px serif';
    context.fillStyle = '#42D531';
    context.fillText(`Scores: ${fighter.score}`, 30, canvas.height-20)
    for (i=1;i<=fighter.life;i++) {
        let y = canvas.height - 35;
        let x = canvas.width - i*lifeImg.width - 5;
        context.drawImage(lifeImg, x, y)
    }
    context.fillText('Life: ', canvas.width-150, canvas.height-15)
}

function updateObjects(explodeImg, bangImg) {
    const all_monsters = all_objects.filter(obj => obj.type==='Enemy');
    const all_lasers = all_objects.filter(obj => obj.type==='Laser');
    const fighter = all_objects.filter(obj => obj.type==='Fighter')[0];
    all_lasers.forEach((l) => {
        all_monsters.forEach((m) => {
            if (isIntersected(l, m)) {
                l.dead = true;
                m.dead = true;
                createExplode(m.x + m.width/5, m.y + m.height/3, explodeImg)
                fighter.score += 100;
            }
        })
    })
    all_monsters.forEach((m) => {
        if (isIntersected(m, fighter)) {
            fighter.life -= 1;
            m.dead = true;
            createBang((m.x+fighter.x+m.width)/2, (m.y+fighter.y+fighter.height)/2, bangImg)
        }
    })
    all_objects = all_objects.filter(obj => obj.dead==false);
}

function loadImage(path) {
    return new Promise(resolve => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img)
            }
    })
}

function preventDefaultKeyDown (e) {
    switch (e.keyCode) {
        case 37:
        case 38:
        case 39:
        case 40:
        case 32:
            e.preventDefault();
            break;
        default:
            break;
    }
};

function initGame(canvas, fighterImg, monsterImg, laserImg) {
    let fighter = createFighter(canvas, fighterImg);
    let monsters = createMonsters(canvas, monsterImg);
    all_objects.push(fighter)
    all_objects.push(...monsters)
    let eventEmitter = new EventEmitter();
    messageRegistry(eventEmitter, Messages, fighter, laserImg)
    window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowUp': 
            eventEmitter.emit(Messages['up']);
            break;
        case 'ArrowDown': 
            eventEmitter.emit(Messages['down']);
            break;
        case 'ArrowLeft': 
            eventEmitter.emit(Messages['left']);
            break;
        case 'ArrowRight': 
            eventEmitter.emit(Messages['right']);
            break;
        case ' ':
            eventEmitter.emit(Messages['shoot']);
            break;
    }
    })
}

function isIntersected(obj1, obj2) {
    return !(
        obj1.right() < obj2.left() ||
        obj1.left() > obj2.right() ||
        obj1.bottom() < obj2.top() ||
        obj1.top() > obj2.bottom()) 
}

function createFighter(canvas, fighterImg) {
    let fighter = new Fighter(canvas.width / 2 - 45, canvas.height * 0.85)
    fighter.img = fighterImg
    return fighter
}

function createMonsters(canvas, monsterImg) {
    let monsters = [];
    let monster_row = 4;
    let monster_col = 5;
    let monster_width = monsterImg.width
    let monster_height = monsterImg.height
    let x_start = (canvas.width - monster_col * monster_width) / 2;
    let x_end = x_start + (monster_col - 1) * monster_width;
    let y_end = (monster_row - 1) * monster_height;
    for (let x=x_start; x<=x_end; x+=monster_width) {
        for (let y=0; y<=y_end; y+=monster_height) {
            let monster = new Monster(x, y, canvas);
            monster.img = monsterImg;
            monsters.push(monster)
        }
    }
    return monsters
}

function createExplode(x, y, Img) {
    let explode = new Explode(x, y);
    explode.img = Img;
    all_objects.push(explode)
}

function createBang(x, y, Img) {
    let bang = new Explode(x, y);
    bang.img = Img;
    bang.height = 53;
    bang.width = 56;
    bang.type = 'Bang';
    all_objects.push(bang)
}

function messageRegistry(eventEmitter, Messages, fighter, laserImg) {
    eventEmitter.on(Messages['up'], () => {
        fighter.y -= 15;
    })
    eventEmitter.on(Messages['down'], () => {
        fighter.y += 15;
    })
    eventEmitter.on(Messages['left'], () => {
        fighter.x -= 15;
    })
    eventEmitter.on(Messages['right'], () => {
        fighter.x += 15;
    })
    eventEmitter.on(Messages['shoot'], () => {
        if (fighter.canFire()) {
            let laser = fighter.fire();
            laser.img = laserImg;
            all_objects.push(laser)
        }
    })
}

class GameObject {
    constructor (x, y) {
        this.x = x;
        this.y = y;
        this.dead = false;
        this.type = '';
        this.width = 0;
        this.height = 0;
        this.img = undefined; 
    }
    top = () => this.y;
    bottom = () => this.y + this.height;
    left = () => this.x;
    right = () => this.x + this.width;

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}

class Explode extends GameObject {
    constructor(x, y) {
        super(x, y)
        this.height = 54;
        this.width = 56;
        this.type = 'Explode';
    }
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        setTimeout(() => {this.dead=true}, 50)
    }
}

class Laser extends GameObject {
    constructor (x, y) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = 'Laser';
        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 15;
            }else {
                this.dead = true;
                clearInterval(id);
            }
        }, 50)
    }
}

class Fighter extends GameObject {
    constructor (x, y) {
        super(x, y);
        this.width = 100;
        this.height = 78;
        this.speed = 0;
        this.coolDown = 0;
        this.score = 0;
        this.life = 3;
        this.type = 'Fighter';
    }
    canFire() {
        return this.coolDown === 0;
    }
    fire() {
        this.coolDown = 1000;
        let laser = new Laser(this.x + 45, this.y);
        let id = setInterval(() => {
            if (this.coolDown > 0) {
                this.coolDown -= 100;
            }else{
                clearInterval(id)
            }
        }, 100)
        return laser
    }   
}

class Monster extends GameObject {
    constructor (x, y, canvas) {
        super(x, y);
        this.width = 98;
        this.height = 88;
        this.type = 'Enemy';
        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 5;
            } else {
                clearInterval(id);
            }
        }, 300)
    }
}

class EventEmitter {
    constructor() {
        this.listeners = {}
    }
    on(message, listener) {
        if (!this.listeners[message]) {
            this.listeners[message] = [];
        }
        this.listeners[message].push(listener)
    }
    emit(message, payload=null) {
        if (this.listeners[message]) {
            this.listeners[message].forEach((l) => l(message, payload))
        }
    }
}
