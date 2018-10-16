//
var canvas = document.getElementById('canvas') || document.createElement('canvas');
var ctx = canvas.getContext('2d');
var config = {
	mask: 6,
	hz: 30
}
var delta = Date.now();
var temp = document.createElement('canvas');
var buffer = temp.getContext('2d');
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
		imgGrey.src = '../../train-grey.png';
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
		imgColor.src = '../../train-color.png';
		//
		imgMask = new Image();
		imgMask.addEventListener('load', function () {
			loaded++;
			if (loaded >= total) {
				init();
			}
		});
		imgMask.src = '../../alpha-noise4.png';
	}

	function init() {
		for (var i = 0; i < config.mask; i++) {
			masks.push(new Mask({
				x: imgColor.width * Math.random(),
				y: imgColor.height * Math.random(),
				w: imgColor.width,
				h: imgColor.width,
				alpha: Math.random() * 0.5,
				scale: 0.001,
				sprite: imgMask
			}));
		}
		canvas.addEventListener('mousedown', function (e) {
			masks.forEach(m => {
				m.x = e.clientX + (Math.random() * 100 - 50);
				m.y = e.clientY + (Math.random() * 100 - 50);
				m.action = '+'
			});
		});
		canvas.addEventListener('mouseup', function () {
			masks.forEach(m => {
				m.delta = Math.max(m.delta, 1);
				m.action = '-';
			});
		});
		temp.width = canvas.width;
		temp.height = canvas.height;
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
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.globalCompositeOperation = 'source-over';
		ctx.drawImage(imgColor, 0, 0);
		ctx.globalCompositeOperation = 'destination-in';
		buffer.clearRect(0, 0, temp.width, temp.height);
		masks.forEach(m => m.render(buffer));
		ctx.drawImage(temp, 0, 0);
		ctx.globalCompositeOperation = 'destination-atop';
		ctx.drawImage(imgGrey, 0, 0);
	}

	function Mask(options) {
		this.rotation = options.rotation || Math.random() * 2 * Math.PI;
		this.maxrotation = this.rotation + Math.random() * 0.04 - 0.02;
		this.scale = options.scale || 0;
		this.maxscale = options.maxscale || 3;
		this.alpha = options.alpha || 0;
		this.maxalpha = options.maxalpha || 1;
		this.x = options.x || 0;
		this.y = options.y || 0;
		this.w = options.w || 256;
		this.h = options.h || 256;
		this.delta = options.delta || 0;
		this.d = options.d || 0.025;
		this.base = { rotation: this.rotation, scale: this.scale, alpha: this.alpha };
		this.action = options.action || '';
		this.sprite = options.sprite || new Image();

		this.update = function (delta) {
			if (!this.action) return;
			if (this.action == '-' && this.delta < 0) {
				this.action = '';
				return;
			}
			this.delta = this.action == '+' ? (this.delta + this.d * delta) : this.action == '-' ? (this.delta - this.d * delta) : this.delta;
			this.rotation = this.base.rotation + ((this.maxrotation - this.base.rotation) * this.delta);
			this.scale = this.maxscale * this.delta * 0.25;
			this.alpha = this.base.alpha + this.maxalpha * this.delta * 2.5;
		}

		this.render = function (ctx) {
			if (!this.action) return;
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
