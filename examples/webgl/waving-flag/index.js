var canvas = document.getElementById('canvas');
var gl = canvas.getContext('webgl');
var img = new Image();
var vx = `
	attribute vec2 aPosition;

	uniform vec2 vPosition;

	varying vec2 fPosition;

	void main() {
		gl_Position = vec4(vPosition + aPosition, 1.0, 1.0);
		fPosition = aPosition;
		fPosition.y = 2.0 - fPosition.y;
	}
`;
var fx = `
	precision mediump float;

	uniform sampler2D fTexture;
	uniform float delta;

	varying vec2 fPosition;

	void main() {
		vec2 textCoord = vec2(0.0);
		textCoord.x = fPosition.x - 0.1 + cos(delta * 0.8 + fPosition.y * 5.0) * fPosition.x * 0.06;
		textCoord.y = fPosition.y - 0.1 + sin(delta + fPosition.x * 10.0) * fPosition.x * 0.09;
		//
		gl_FragColor = texture2D(fTexture, textCoord);
		// gl_FragColor = texture2D(fTexture, fPosition);
	}
`;

window.onload = function () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	img.onload = init;
	img.src = '../../pic.jpg';
	var program = gl.createProgram();
	var vs = gl.createShader(gl.VERTEX_SHADER);
	var fs = gl.createShader(gl.FRAGMENT_SHADER);
	var time = 0;
	function init() {
		gl.shaderSource(vs, vx);
		gl.shaderSource(fs, fx);
		gl.compileShader(vs);
		gl.compileShader(fs);
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		gl.useProgram(program);
		gl.viewport(0, 0, canvas.width, canvas.height);

		//
		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			0.0, 0.0,
			2.0, 0.0,
			0.0, 2.0,
			2.0, 2.0
		]), gl.STATIC_DRAW);
		var aPosition = gl.getAttribLocation(program, 'aPosition');
		gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(aPosition);
		var vPosition = gl.getUniformLocation(program, 'vPosition');
		gl.uniform2fv(vPosition, [-1, -1]);

		//
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		gl.activeTexture(gl.TEXTURE0);

		//
		loop();
	}

	function loop() {
		update();
		render();
		requestAnimationFrame(loop);
	}

	function update() {
		var delta = gl.getUniformLocation(program, 'delta');
		time += 0.05;
		gl.uniform1f(delta, time);
	}

	function render() {
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
}