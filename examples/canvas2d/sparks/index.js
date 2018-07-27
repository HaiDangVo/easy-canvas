//
var canvas = document.getElementById('canvas') || document.createElement('canvas');
var ctx = canvas.getContext('2d');
var pointer = { x: window.innerWidth * 0.5, y: window.innerHeight, hold: true };
var particles = [];
var config = {
	clearColor: '#000000',
	gearColor: '#333333',
	gearRadius: 150,
	sparkColor: ['rgba(225, 242, 24, 0.9)', 'rgba(240, 222, 24, 0.35)', 'rgba(245, 186, 48, 0.2)', 'rgba(255, 112, 64, 0.1)', 'rgba(255, 96, 96, 0)'],
	sparkWidth: 6,
	maxParticles: 300,
	perParticles: 4,
	hz: 1000 / 30,
	maxHz: 1000 / 30,
	minHz: 1000 / 5,
	isSlowMotion: false,
	isExposure: false,
	debug: false,
	speed: {
		current: 0,
		increment: 0.001,
		max: Math.PI * 0.12
	}
}
var gears = [];
var delta = new Date() - 0;
var buffer = document.createElement('canvas');
//
window.onload = function () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	init();

	function init() {
		ctx.fillStyle = config.clearColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		//
		var temp = buffer.getContext('2d');
		buffer.width = 128;
		buffer.height = 128;
		if (config.debug) {
			buffer.style.cssText = 'position: absolute; left: 0; top: 0;';
			document.body.appendChild(buffer);
		}
		var ct = buffer.width * 0.5;
		var gradient = temp.createRadialGradient(ct, ct, 0, ct, ct, ct);
		gradient.addColorStop(0.12, config.sparkColor[0]);
		gradient.addColorStop(0.35, config.sparkColor[1]);
		gradient.addColorStop(0.65, config.sparkColor[2]);
		gradient.addColorStop(0.82, config.sparkColor[3]);
		gradient.addColorStop(0.99, config.sparkColor[4]);
		temp.fillStyle = gradient;
		temp.arc(ct, ct, ct, 0, Math.PI * 2);
		temp.fill();
		//
		[0, 1, 2, 3, 4, 5].forEach(i => {
			gears.push({
				rotation: 0 + (i + 1) * 1 / 9 * Math.PI,
				radius: config.gearRadius,
				edge: 3,
				center: { x: 0, y: 0 }
			});
		});
		//
		loop();
	}

	function loop() {
		var now = new Date() - 0;
		var d = (now - delta) / config.hz;
		delta = now;
		update(d);
		render(d);
		requestAnimationFrame(loop);
	}

	function update(delta) {
		gears.forEach(g => {
			g.center.x = pointer.x;
			g.center.y = pointer.y;
			g.rotation -= config.speed.current;
		});
		if (pointer.hold) {
			config.speed.current = Math.min(config.speed.max, config.speed.current + config.speed.increment * delta);
		} else if (config.speed.current > 0) {
			config.speed.current = Math.max(0, config.speed.current - config.speed.increment * delta);
		}
		if (config.isSlowMotion) {
			config.hz = Math.min(config.minHz, config.hz * 1.1);
		} else {
			config.hz = Math.max(config.maxHz, config.hz / 1.1);
		}
		config.speed.max = Math.PI * 0.12 * delta;
		particles.forEach(p => p.update(delta));
		//
		if (config.speed.current > 0 && pointer.y + config.gearRadius > canvas.height) {
			if (particles.length < config.maxParticles && Math.random() < config.speed.current * delta / config.speed.max) {
				let count = ~~(Math.random() * config.perParticles + 1);
				[...new Array(count)].forEach(() => {
					particles.push(particle({
						x: pointer.x + Math.random() * config.gearRadius * 0.25 + (config.gearRadius - ~~(canvas.height - pointer.y) * 0.8),
						y: canvas.height,
						direction: -Math.random() - 0.1,
						length: 100
					}));
				});
			}
		}
	}

	function render(delta) {
		ctx.globalAlpha = 0.65 * !config.isExposure ? 1 : 0.02;
		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = config.clearColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.globalAlpha = 1;

		// fill gears
		ctx.globalAlpha = 0.8;
		ctx.fillStyle = config.gearColor;
		gears.forEach(g => {
			ctx.beginPath();
			let center = g.center;
			let point = {
				x: Math.cos(g.rotation) * g.radius + center.x,
				y: Math.sin(g.rotation) * g.radius + center.y
			}
			ctx.moveTo(point.x, point.y);
			[...new Array(g.edge)].forEach((v, i) => {
				if (i == 0) return;
				let point = {
					x: Math.cos(g.rotation + i * 2 / 3 * Math.PI) * g.radius + center.x,
					y: Math.sin(g.rotation + i * 2 / 3 * Math.PI) * g.radius + center.y
				}
				ctx.lineTo(point.x, point.y);
			})
			ctx.closePath();
			ctx.fill();
		});

		// particles
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = 'screen';
		particles.forEach(p => p.render(ctx, delta));
	}

	function particle(options) {
		return {
			x: options.x,
			y: options.y,
			thickness: Math.random() + 0.5,
			velocity: { base: options.base || 0.65, direction: options.direction, length: options.length * Math.max(config.speed.current / config.speed.max, 0.2) },
			accelarate: { max: 0, min: -Math.PI * 0.5, change: Math.random() * 0.2 - 0.1 },
			gravity: { direction: Math.PI * 0.5, force: 0.04 + Math.random() * 0.02 },
			friction: 0.725 + Math.random() * 0.12,
			lifespan: 40 + Math.random() * 24,
			first: options.first || 1,
			update(delta) {
				this.lifespan -= 1 * delta;
				this.velocity.length = Math.max(this.velocity.length - (1 - this.friction) * this.velocity.length * delta, 2);
				let x = this.x + Math.cos(this.velocity.direction) * this.velocity.length * delta;
				let y = this.y + Math.sin(this.velocity.direction) * this.velocity.length * delta;
				this.rotation = Math.atan2(y - this.y, x - this.x);
				this.x = x;
				this.y = y;
				this.combine(delta);
				if (this.lifespan < 0) {
					let index = particles.findIndex(p => p === this);
					particles.splice(index, 1);
				}
			},
			combine(delta) {
				if (this.first == 1) {
					this.accelarate.max = this.velocity.direction + this.velocity.base;
					this.accelarate.min = this.velocity.direction - this.velocity.base;
				}
				let step = this.accelarate.change * delta;
				this.velocity.direction += step;
				if (this.velocity.direction > this.accelarate.max || this.velocity.direction < this.accelarate.min) {
					this.accelarate.change *= -1;
				}
				this.velocity.direction += this.gravity.force * delta;
				this.first = Math.max(0, this.first - delta);
				if ((Math.random() < 0.004 * delta) && (this.velocity.length > 10)) {
					let count = ~~(Math.random() * config.perParticles + 2);
					[...new Array(count)].forEach(() => {
						particles.push(particle({
							x: this.x,
							y: this.y,
							base: Math.PI,
							direction: -Math.random() * Math.PI * 2,
							length: Math.min(this.velocity.length * (Math.random() + 1), 40)
						}));
					});
				}
			},
			render(ctx, delta) {
				let w = config.sparkWidth * this.thickness * this.velocity.length * delta;
				let h = config.sparkWidth * this.thickness * this.lifespan * 1.45 / 80;
				w = Math.max(w, h);
				ctx.translate(this.x, this.y);
				ctx.rotate(this.rotation);
				ctx.drawImage(buffer, -w * 0.5, -h * 0.5, w, h);
				ctx.rotate(-this.rotation);
				ctx.translate(-this.x, -this.y);
				if (this.first > 0) {
					w /= delta * 5;
					ctx.globalAlpha = Math.random() * 0.8;
					ctx.drawImage(buffer, this.x - w, this.y - w, w * 2, w * 2);
					ctx.globalAlpha = 1;
				}
			}
		}
	}

	window.onmousemove = function (e) {
		pointer.x = e.clientX;
		pointer.y = e.clientY;
	}

	window.onmousedown = function () {
		pointer.hold = true;
	}

	window.onmouseup = function () {
		pointer.hold = false;
	}

	window.onkeydown = function (e) {
		if (e.keyCode == 17) {
			config.isSlowMotion = true;
		}
	}

	window.onkeyup = function (e) {
		if (e.keyCode == 17) {
			config.isSlowMotion = false;
		}
		if (e.keyCode == 32) {
			config.isExposure = !config.isExposure;
		}
	}
}
