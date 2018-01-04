//
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var img = new Image();
var parts = [];
var weight = 100;
var base = { x: 100, y: 100 };

//
window.onload = function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	img.src = '../../pic.jpg';
	img.onload = init;

	function init() {
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
					width: w + w * 0.5,
					height: h + h * 0.5
				});
			}
		}
		loop();
	}

	function loop() {
		update();
		render();
		requestAnimationFrame(loop);
	}

	function update() {
		var date = (new Date() - 0) * 0.004;
		for (var i = 0; i < parts.length; i++) {
			var part = parts[i];
			part.x = part.bx + Math.cos(date * 0.8 + part.by * 0.02) * part.x * 0.09;
			part.y = part.by + Math.sin(date + part.bx * 20) * part.x * 0.12;
		}
	}
	
	function render() {
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		for (var i = 0; i < parts.length; i++) {
			var part = parts[i];
			ctx.drawImage(img, part.bx, part.by, part.width, part.height, base.x + part.x, base.y + part.y, part.width, part.height);
		}
	}
}
