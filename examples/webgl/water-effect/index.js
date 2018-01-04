var canvas = document.getElementById('canvas');
var gl = canvas.getContext('webgl');
var img = new Image();
var fog = new Image();
var vx = `
	attribute vec2 aPosition;

	uniform vec2 vPosition;

	varying vec2 fPosition;

	void main() {
		gl_Position = vec4(vPosition * aPosition, 1.0, 1.0);
		fPosition = aPosition * 0.5;
		// fPosition = aPosition;
	}
`;
var fx = `
	precision mediump float;

	uniform sampler2D fTexture;
	uniform sampler2D fFog;
	uniform float delta;

	varying vec2 fPosition;

	void main() {
		vec2 texCoord = fPosition;
		texCoord.x += 0.5;
		texCoord.y *= -1.0;
		texCoord.y += 0.5;
		vec4 fogColor = texture2D(fFog, texCoord - delta * 0.05);
		float phi = (fogColor.r + fogColor.g + fogColor.b) / 3.0;
		vec2 reflectCoord = vec2(0.0);
		reflectCoord.x = texCoord.x + cos(phi) * 0.04 - 0.03;
		reflectCoord.y = texCoord.y + sin(phi) * 0.02 - 0.01;
		gl_FragColor = texture2D(fTexture, reflectCoord);
		gl_FragColor += fogColor * 0.5 - 0.5;
		// gl_FragColor = vec4(sin(delta), 0.0, 0.0, 1.0);
	}
`;

window.onload = function () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	img.src = '../../ocean.jpg';
	fog.src = '../../fog-noise.jpg';
	img.onload = init;
	// fog.onload = bindFog;
	var program = gl.createProgram();
	var vs = gl.createShader(gl.VERTEX_SHADER);
	var fs = gl.createShader(gl.FRAGMENT_SHADER);
	var delta = 0;

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

		var position = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, position);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1.0, -1.0,
			1.0, -1.0,
			-1.0, 1.0,
			1.0, 1.0
		]), gl.STATIC_DRAW);
		var vPosition = gl.getUniformLocation(program, 'vPosition');
		gl.uniform2fv(vPosition, [0.5, 0.5]);
		var aPosition = gl.getAttribLocation(program, 'aPosition');
		gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(aPosition);

		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		//
		var texture2 = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture2);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fog);

		var fTexture = gl.getUniformLocation(program, 'fTexture');
		var fFog = gl.getUniformLocation(program, 'fFog');
		gl.uniform1i(fTexture, 0);
		gl.uniform1i(fFog, 1);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, texture2);
		//
		loop();
	}

	function loop() {
		update();
		render();
		requestAnimationFrame(loop);
	}

	function update() {
		delta += Math.PI * 0.005;
		var d = gl.getUniformLocation(program, 'delta');
		gl.uniform1f(d, delta);
	}

	function render() {
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
}