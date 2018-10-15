//
var canvas = document.getElementById('canvas') || document.createElement('canvas');
var ctx = canvas.getContext('2d');
var config = {
	mask: 10,
	hz: 30
}
var delta = Date.now();
var buffer = document.createElement('canvas');
var imgGrey, imgColor, imgMask;
var masks = [];
//
window.onload = function () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	preload();

	function preload() {
		var total = 3;
		var loaded = 0;
		imgGrey = new Image();
		imgGrey.addEventListener('load', function () {
			loaded++;
			if (loaded >= total) {
				init();
			}
		});
		imgGrey.src = '../../ocean-grey.jpg';
		//
		imgColor = new Image();
		imgColor.addEventListener('load', function () {
			loaded++;
			if (loaded >= total) {
				init();
			}
		});
		imgColor.src = '../../ocean.jpg';
		//
		imgMask = new Image();
		imgMask.addEventListener('load', function () {
			loaded++;
			if (loaded >= total) {
				init();
			}
		});
		imgMask.src = '../../alpha-noise.png';
	}

	function init() {
		for (var i = 0; i < config.mask; i++) {
			masks.push(new Mask({
				x: imgColor.width * 0.4 + imgColor.width * 0.2 * Math.random(),
				y: imgColor.height * 0.4 + imgColor.height * 0.2 * Math.random(),
				w: imgColor.width,
				h: imgColor.height,
				alpha: Math.random(),
				sprite: imgMask
			}));
		}
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
		masks.forEach(m => m.update(delta));
	}

	function render(delta) {
		ctx.globalCompositeOperation = 'source-over';
		ctx.drawImage(imgColor, 0, 0);
		ctx.globalCompositeOperation = 'destination-in';
		masks.forEach(m => m.render(ctx));
		ctx.globalCompositeOperation = 'destination-atop';
		ctx.drawImage(imgGrey, 0, 0);
	}

	function Mask(options) {
		this.rotation = options.rotation || Math.random() * 2 * Math.PI;
		this.rchange = options.rchange || Math.random() * 0.002 + 0.002;
		this.rchange = Math.random() < 0.5 ? -this.rchange : this.rchange;
		this.scale = options.scale || 0;
		this.maxscale = options.maxscale || 5;
		this.schange = options.schange || Math.random() * 0.005 + 0.01;
		this.alpha = options.alpha || 0;
		this.maxalpha = options.maxalpha || 1;
		this.achange = options.achange || Math.random() * 0.05 + 0.05;
		this.x = options.x || 0;
		this.y = options.y || 0;
		this.w = options.w || 256;
		this.h = options.h || 256;
		this.sprite = options.sprite || new Image();

		this.update = function (delta) {
			this.rotation += this.rchange * delta;
			this.scale += this.schange * delta;
			this.scale = Math.min(this.scale, this.maxscale);
			this.alpha += this.achange * delta;
			this.alpha = Math.min(this.alpha, this.maxalpha);
		}

		this.render = function (ctx) {
			ctx.globalAlpha = this.alpha;
			ctx.translate(this.x, this.y);
			ctx.rotate(this.rotation);
			ctx.drawImage(this.sprite, -this.scale * this.w * 0.5, -this.scale * this.h * 0.5, this.scale * this.w, this.scale * this.h);
			ctx.rotate(-this.rotation);
			ctx.translate(-this.x, -this.y);
			ctx.globalAlpha = 1;
		}
	}
}
