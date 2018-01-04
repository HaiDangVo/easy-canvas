//
var canvas = document.getElementById('canvas');
var canvas2 = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var buffer = canvas2.getContext('2d');
var img = new Image();
var fog = new Image();
var dpmData = [];
var parts = [];
var weight = 100;
var base = { x: 100, y: 100 };
var n = 0;
var t = 0;
var delta = 0;

//
window.onload = function () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	img.src = '../../ocean.jpg';
	img.onload = init;
	fog.onload = bindBuffer;

	function init() {
		fog.src = '../../fog-noise.jpg';
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		//
		var w = img.width / weight;
		var h = img.height / weight;
		for (var i = 0; i < weight; i++) {
			for (var j = 0; j < weight; j++) {
				parts.push({
					bx: j * w,
					by: i * h,
					x: j * w,
					y: i * h,
					prev: 0,
					next: 0,
					alpha: 0.5,
					width: w * 2,
					height: h * 3
				});
			}
		}
		loop();
	}

	function bindBuffer() {
		var w = weight * 0.5;
		canvas2.width = w;
		canvas2.height = w;
		buffer.drawImage(fog, 0, 0, fog.width, fog.height, 0, 0, w, w);
		var temp = buffer.getImageData(0, 0, w, w);
		for (var i = 0; i < temp.data.length; i += 4) {
			var d = (temp.data[i] + temp.data[i + 1] + temp.data[i + 2]) / (255 * 3);
			parts[i].next = parts[i + 1].next = parts[i + 2].next = parts[i + 3].next = d;
			dpmData.push(d);
		}
	}

	function loop() {
		update();
		render();
		requestAnimationFrame(loop);
	}

	function update() {
		t += 0.05;
		t >= 1 && (dpmData.unshift(dpmData.pop())) && (t = 0);
		for (var i = 0; i < parts.length; i++) {
			var part = parts[i];
			var j = Math.round(i / 4);
			t == 0 && (part.prev = part.next) && (part.next = dpmData[j]);
			var phi = (part.next - part.prev) * t + part.prev;
			part.x = part.bx + Math.cos(phi * Math.PI - Math.PI * 0.5) * part.width * 0.5;
			part.y = part.by + Math.sin(phi * Math.PI - Math.PI * 0.5) * part.height * 0.5;
			part.alpha = phi * 1.75 - 0.75;
			part.alpha < 0 && (part.alpha = 0);
		}
	}

	function render() {
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.globalAlpha = 0.65;
		ctx.drawImage(img, base.x + parts[0].x, base.y + parts[0].y);
		for (var i = 0; i < parts.length; i++) {
			var part = parts[i];
			ctx.globalAlpha = part.alpha;
			ctx.drawImage(img, part.bx, part.by, part.width, part.height, base.x + part.x, base.y + part.y, part.width, part.height);
		}
		ctx.globalAlpha = 0.8;
	}
}
