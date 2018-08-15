let canvas = document.getElementById('canvas') || document.createElement('canvas');
let ctx = canvas.getContext('2d');
let rains = [];
let pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, hold: false };
let d = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight) * .65;
let config = {
    clearColor: '#000000',
    particles: {
        total: 500,
        speed: 100,
        gravity: 0.2,
        radius: 0,
        minRadius: 20,
        color: '#ffffff'
    }
}

//
const Rain = function(options = {}) {
    this.options = options;

    this.init = () => {
        this.velocity = this.options.velocity || { direction: Math.PI * 0.6 + Math.random() * 0.4, length: config.particles.speed };
        this.velocity.length += (Math.random() - 0.8) * this.velocity.length;
        this.accelerate = this.options.accelerate || { max: this.velocity.direction + 0.2, min: this.velocity.direction - 0.2, change: (Math.random() - 0.5) * 0.06 }
        this.gravity = this.options.gravity || config.particles.gravity + Math.random() * 0.2;
        this.color = this.options.color || config.particles.color;
        this.x = Math.random() * canvas.width + canvas.width * 0.2;
        this.y = -Math.random() * canvas.height;
        this.hz = 30;
        this.minHz = 1;
        this.baseHz = 30;
        this.distance = 1;
        this.now = Date.now();
        this.delta = 1;
    }

    this.update = () => {
        this.delta = (Date.now() - this.now) / this.hz;
        this.now += this.delta * this.hz;
        this.x += Math.cos(this.velocity.direction) * this.velocity.length * this.delta;
        this.y += Math.sin(this.velocity.direction) * this.velocity.length * this.delta;
        this.velocity.length += this.gravity * this.delta;
        this.velocity.direction += this.accelerate.change;
        this.distance = Math.sqrt(Math.pow(this.x - pointer.x, 2) + Math.pow(this.y - pointer.y, 2));
        this.distance > config.particles.radius && (this.distance = d);
        this.hz = Math.max(this.baseHz / Math.min((this.distance / config.particles.radius), 1), this.minHz);
        if (this.velocity.direction > this.accelerate.max || this.velocity.direction < this.accelerate.min) {
            this.accelerate.change *= -1;
        }
        //
        if (this.y > canvas.height) {
            this.init();
        }
    }

    this.render = (ctx) => {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.velocity.length * 0.02;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x - Math.cos(this.velocity.direction) * this.velocity.length * this.delta * 2, 
            this.y - Math.sin(this.velocity.direction) * this.velocity.length * this.delta * 2);
        ctx.stroke();
        ctx.closePath();
    }

    //
    this.init();
}

//
const init = () => {
    // reigster
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    [...Array(config.particles.total)].map(i => {
        rains.push(new Rain());
    })
    window.addEventListener('mousemove', e => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
    });
    window.addEventListener('mousedown', () => {
        pointer.hold = true;
    });
    window.addEventListener('mouseup', () => {
        pointer.hold = false;
    })
    // start
    loop();
}

const loop = () => {
    update();
    render();
    requestAnimationFrame(() => { loop(); });
}

const update = () => {
    if (pointer.hold) {
        config.particles.radius = Math.min(config.particles.radius + config.particles.minRadius, d);
    } else {
        config.particles.radius = Math.max(config.particles.radius - config.particles.minRadius, config.particles.minRadius);
    }
    rains.forEach(r => r.update());
}

const render = () => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = config.clearColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //
    ctx.globalCompositeOperation = 'screen';
    rains.forEach(r => r.render(ctx));
}

//
init();