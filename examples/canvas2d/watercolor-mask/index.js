//
var canvas = document.getElementById('canvas') || document.createElement('canvas');
var ctx = canvas.getContext('2d');
var config = {
	mask: 4,
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
		imgGrey.src = '../../back-grey.png';
		//
		imgColor = new Image();
		imgColor.addEventListener('load', function () {
			loaded++;
			canvas.width = imgColor.width;
			canvas.height = imgColor.height;
			if (loaded >= total) {
				init();
			}
		});
		imgColor.src = '../../back-color.png';
		//
		imgMask = new Image();
		imgMask.addEventListener('load', function () {
			loaded++;
			if (loaded >= total) {
				init();
			}
		});
		imgMask.src = '../../alpha-noise3.png';
	}

	function init() {
		for (var i = 0; i < config.mask; i++) {
			masks.push(new Mask({
				x: imgColor.width * Math.random(),
				y: imgColor.height * Math.random(),
				w: imgColor.width,
				h: imgColor.width,
				alpha: Math.random() * 0.5 + 0.5,
				scale: Math.random() * 0.5 + 0.5,
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
		this.maxrotation = this.rotation + Math.random() * 0.02 - 0.01;
		this.scale = options.scale || 0;
		this.maxscale = options.maxscale || 8;
		this.alpha = options.alpha || 0;
		this.maxalpha = options.maxalpha || 1;
		this.x = options.x || 0;
		this.y = options.y || 0;
		this.w = options.w || 256;
		this.h = options.h || 256;
		this.delta = options.delta || 0;
		this.d = options.d || 0.02;
		this.base = { rotation: this.rotation, scale: this.scale, alpha: this.alpha };
		this.action = options.action || '+';
		this.sprite = options.sprite || new Image();

		this.update = function (delta) {
			if (this.delta * 0.15 > 1) {
				this.action = '-';
			}
			if (this.delta < 0) {
				this.action = '+'
			}
			this.delta = this.action == '+' ? (this.delta + this.d * delta) : this.action == '-' ? (this.delta - this.d * delta) : this.delta;
			this.rotation = this.base.rotation + ((this.maxrotation - this.base.rotation) * this.delta);
			this.scale = this.maxscale * this.delta * 0.15;
			this.alpha = this.maxalpha * this.delta * 0.65;
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
