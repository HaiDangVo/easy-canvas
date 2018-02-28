var canvas = document.getElementById('canvas');
var gl = canvas.getContext('webgl');
var vx = `
    attribute vec2 aPos;

    uniform vec2 uPos;

    varying vec2 vPos;

    void main() {
        gl_Position = vec4(uPos + aPos, 0.0, 1.0);
        vPos = aPos.xy / 2.0;
    }
`;
var fx = `
    precision mediump float;

    uniform float delta;
    uniform float pixel;

    varying vec2 vPos;

    bool is(float p, float f, float w) {
        return p - f > 0.0 && p - f < w;
    }

    void main() {
        gl_FragColor = vec4(vPos, 0.0, 1.0);
        float width = 20.0 * pixel;
        float cw = 0.08;
        // if (vPos.x - vPos.y < width && vPos.x - vPos.y > 0.0) {
        //     gl_FragColor = vec4(1.0);
        // }
        // hello world
        // H (x:25-35, y:40-60)
        if (is(vPos.x, 0.25, width) || is(vPos.x, 0.25 + cw - width, width)) {
            if (is(vPos.y, 0.4, 0.2)) {
                gl_FragColor = vec4(1.0);
            }
        }
        if (is(vPos.x, 0.25, cw) && is(vPos.y, 0.5 - width, width * 2.0)) {
            gl_FragColor = vec4(1.0);
        }
        
        // E (x:35-45, y:40-60)
        if (is(vPos.x, 0.35, width) && is(vPos.y, 0.4, 0.2)) {
            gl_FragColor = vec4(1.0);
        }
        if (is(vPos.x, 0.35, cw) && 
        (is(vPos.y, 0.4, width) || is(vPos.y, 0.5 - width, width * 2.0) || is(vPos.y, 0.6 - width, width))) {
            gl_FragColor = vec4(1.0);
        }
        
        // L (x:45-55, y:40-60)
        if (is(vPos.x, 0.45, width) && is(vPos.y, 0.4, 0.2)) {
            gl_FragColor = vec4(1.0);
        }
        if (is(vPos.x, 0.45, cw) && is(vPos.y, 0.4, width)) {
            gl_FragColor = vec4(1.0);
        }

        // L (x:55-65, y:40-60)
        if (is(vPos.x, 0.55, width) && is(vPos.y, 0.4, 0.2)) {
            gl_FragColor = vec4(1.0);
        }
        if (is(vPos.x, 0.55, cw) && is(vPos.y, 0.4, width)) {
            gl_FragColor = vec4(1.0);
        }
        
        // O (x:65-75, y:40-60)
        float cx = 0.7;
        float cy = 0.5;
        float t = distance(vPos, vec2(cx, cy));
        if (is(t, cw, width)) {
            gl_FragColor = vec4(1.0);
        }
    }
`;
var program = gl.createProgram();
var vs = gl.createShader(gl.VERTEX_SHADER);
var fs = gl.createShader(gl.FRAGMENT_SHADER);
var delta = 0.0;

window.onload = function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;


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
        var pos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pos);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            2.0, 0.0,
            0.0, 2.0,
            2.0, 2.0
        ]), gl.STATIC_DRAW);
        var uPos = gl.getUniformLocation(program, 'uPos');
        gl.uniform2fv(uPos, [-1.0, -1.0]);
        var uPixel = gl.getUniformLocation(program, 'pixel');
        gl.uniform1f(uPixel, 1.0 / canvas.width);
        var aPos = gl.getAttribLocation(program, 'aPos');
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPos);
        //
        loop();
    }
    init();

    function loop() {
        update();
        render();
        // requestAnimationFrame(loop);
        setTimeout(loop, 100);
    }

    function update() {
        var d = gl.getUniformLocation(program, 'delta');
        delta++;
        gl.uniform1f(d, delta);
    }

    function render() {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}