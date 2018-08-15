let canvas = document.getElementById('canvas') || document.createElement('canvas');
let ctx = canvas.getContext('2d');
let rains = [];
let pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, hold: false };
let d = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight);
let buffer;
let config = {
    clearColor: '#000000',
    debug: false,
    particles: {
        total: 1500,
        speed: window.innerHeight * 0.15,
        width: 2,
        gravity: 6.9,
        radius: 0,
        minRadius: 20,
        color: ['rgba(180, 165, 220, 0)', 'rgba(92, 120, 185, 0.4)', 'rgba(90, 100, 205, 0.1)', 'rgba(120, 140, 255, 0.8)']
    }
}

//
const Rain = function(options = {}) {
    this.options = options;

    this.init = () => {
        this.velocity = this.options.velocity || { direction: Math.PI * 0.6 + Math.random() * 0.4, length: config.particles.speed };
        this.velocity.length += (Math.random() - 0.8) * this.velocity.length;
        this.accelerate = this.options.accelerate || { max: this.velocity.direction + 0.2, min: this.velocity.direction - 0.2, change: (Math.random() - 0.5) * 0.05 }
        this.gravity = this.options.gravity || config.particles.gravity + Math.random() * 3.2;
        this.color = this.options.color || config.particles.color[1];
        this.sprite = buffer;
        this.width = this.options.width || config.particles.width;
        this.w = this.width;
        this.x = Math.random() * canvas.width + canvas.width * 0.2;
        this.y = -Math.random() * canvas.height;
        this.z = Math.min(this.velocity.length / config.particles.speed, 1);
        this.hz = 30;
        this.minHz = 3;
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
        this.velocity.direction += this.accelerate.change * this.delta;
        this.distance = Math.sqrt(Math.pow(this.x - pointer.x, 2) + Math.pow(this.y - pointer.y, 2));
        this.distance > config.particles.radius && (this.distance = config.particles.radius);
        this.hz = Math.max(this.baseHz / Math.min((this.distance / 2 / this.z / config.particles.radius), 1), this.minHz);
        this.w = this.width + Math.min((this.hz / this.baseHz) - 1, this.width * 2);
        if (this.velocity.direction > this.accelerate.max || this.velocity.direction < this.accelerate.min) {
            this.accelerate.change *= -1;
        }
        //
        if (this.y > canvas.height) {
            this.init();
        }
    }

    this.render = (ctx) => {
        //
        ctx.translate(this.x, this.y);
        ctx.rotate(this.velocity.direction);
        ctx.drawImage(this.sprite, 0, 0, this.velocity.length * 2 * this.delta + this.z * this.w, this.z * this.w);
        ctx.rotate(-this.velocity.direction);
        ctx.translate(-this.x, -this.y);
    }

    this.debug = (ctx) => {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.z * 2.5 * (this.hz / this.baseHz);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x - Math.cos(this.velocity.direction) * this.velocity.length * this.delta,
            this.y - Math.sin(this.velocity.direction) * this.velocity.length * this.delta);
        ctx.stroke();
        ctx.closePath();
    }

    //
    this.init();
}

//
const init = () => {
    buffer = document.createElement('canvas');
    buffer.width = 128;
    buffer.height = 128;
    let half = buffer.width * 0.5;
    temp = buffer.getContext('2d');
    let gradient = temp.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0.08, config.particles.color[0]);
    gradient.addColorStop(0.45, config.particles.color[1]);
    gradient.addColorStop(0.65, config.particles.color[2]);
    gradient.addColorStop(0.96, config.particles.color[3]);
    let fade = temp.createLinearGradient(0, 0, buffer.width, 0);
    fade.addColorStop(0, 'rgba(0, 0, 0, 0)');
    fade.addColorStop(1, 'rgba(255, 255, 255, 1)');
    temp.arc(half, half, half, 0, Math.PI * 2);
    temp.fillStyle = gradient;
    temp.fill();
    temp.fillStyle = fade;
    temp.arc(half, half, half, 0, Math.PI * 2);
    temp.globalCompositeOperation = 'destination-in';
    temp.fill();
    if (config.debug) {
        document.body.appendChild(buffer);
        buffer.style.cssText = 'position: absolute; left: 0; top: 0;';
    }
    // reigster
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    [...Array(config.particles.total)].map(() => {
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
        config.particles.radius = Math.min(config.particles.radius + config.particles.minRadius, d * 0.75);
    } else {
        config.particles.radius = Math.max(config.particles.radius - config.particles.minRadius, config.particles.minRadius);
    }
    rains.forEach(r => r.update());
}

const render = () => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = config.clearColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'screen';
    rains.forEach(r => r.render(ctx));
}

//
init();