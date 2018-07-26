//
var canvas = document.getElementById('canvas') || document.createElement('canvas');
var ctx = canvas.getContext('2d');
var pointer = { x: 0, y: 0, hold: false };
var particles = [];
var config = {
	gearColor: '#696969',
	gearRadius: 150,
	sparkColor: '#ffdd00',
	sparkWidth: 3,
	maxParticles: 300,
	hz: 1000 / 30,
	speed: {
		current: 0,
		increment: 0.002,
		max: Math.PI * 0.12
	}
}
var gears = [];
var delta = new Date() - 0;
//
window.onload = function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	init();

	function init() {
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		//
		[0, 1, 2, 3, 4, 5].forEach(i => {
			gears.push({
				rotation: 0 + (i + 1) * 1 / 6 * Math.PI,
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
		render();
		requestAnimationFrame(loop);
	}

	function update(delta) {
		gears.forEach(g => {
			g.center.x = pointer.x;
			g.center.y = pointer.y;
			g.rotation -= config.speed.current;
		});
		if (pointer.hold && config.speed.current < config.speed.max) {
			config.speed.current += config.speed.increment * delta;
		} else if (config.speed.current > 0) {
			config.speed.current -= config.speed.increment * delta;
		}
		particles.forEach(p => p.update(delta));
		//
		if (config.speed.current > 0 && pointer.y + config.gearRadius > canvas.height) {
			if (particles.length < config.maxParticles && Math.random() < delta) {
				let count = ~~(Math.random() * 3 + 1);
				[...new Array(count)].forEach(() => {
					particles.push({
						x: pointer.x + Math.random() * config.gearRadius * 0.25,
						y: canvas.height,
						thickness: Math.random(),
						velocity: { direction: -Math.random(), length: 60 * Math.max(config.speed.current / config.speed.max, 0.4) },
						accelarate: { direction: Math.random() * 0.12 - 0.06 },
						gravity: { direction: Math.PI * 0.5, force: 0.04 + Math.random() * 0.06 },
						friction: 0.96,
						lifespan: 70 + Math.random() * 30,
						update(delta) {
							this.lifespan -= 1 * delta;
							this.velocity.length -= (1 - this.friction) * this.velocity.length * delta;
							this.x += Math.cos(this.velocity.direction) * this.velocity.length * delta;
							this.y += Math.sin(this.velocity.direction) * this.velocity.length * delta;
							this.combine(delta);
							if (this.lifespan < 0) {
								let index = particles.findIndex(p => p === this);
								particles.splice(index, 1);
							}
						},
						combine(delta) {
							let step = this.gravity.force * delta;
							step += this.accelarate.direction * delta;
							this.velocity.direction += step;
						},
						render(ctx) {
							ctx.beginPath();
							ctx.strokeStyle = config.sparkColor;
							ctx.lineWidth = config.sparkWidth * this.thickness * this.lifespan / 80;
							ctx.moveTo(this.x, this.y);
							ctx.lineTo(
								this.x + Math.cos(this.velocity.direction) * this.velocity.length, 
								this.y + Math.sin(this.velocity.direction) * this.velocity.length
							);
							ctx.stroke();
							ctx.closePath();
						}
					});
				});
			}
		}
	}
	
	function render() {
		ctx.globalAlpha = 0.8;
		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.globalAlpha = 1;

		// fill gears
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
		ctx.globalCompositeOperation = 'screen';
		particles.forEach(p => p.render(ctx));
	}
	
	window.onmousemove = function(e) {
		pointer.x = e.clientX;
		pointer.y = e.clientY;
	}

	window.onmousedown = function() {
		pointer.hold = true;
	}

	window.onmouseup = function() {
		pointer.hold = false;
	}
}
