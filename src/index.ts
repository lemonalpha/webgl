import * as util from "./util";
import point_vertex from "./shader/point.vert";
import point_fragment from "./shader/point.frag";
import vertex from "./shader/texture2d.vert";
import fragment from "./shader/texture2d.frag";
import avatar from './img/avatar.png';

class WebGL {
    constructor () {
    };

    drawPoint() {
        let canvas = document.getElementById('webgl_1') as HTMLCanvasElement;
        let gl: WebGLRenderingContext = canvas.getContext("webgl");
        // // 创建顶点着色器对象
        // let vertexShader: WebGLShader = util.createShader(gl, gl.VERTEX_SHADER, point_vertex);
        // // 创建片段着色器对象
        // let fragmentShader: WebGLShader = util.createShader(gl, gl.FRAGMENT_SHADER, point_fragment);
        // // 创建一个着色器程序
        // let glProgram: WebGLProgram = util.createProgram(gl, vertexShader, fragmentShader);
        let glProgram: WebGLProgram = util.createProgramFromShaderSource(gl, point_vertex, point_fragment);
        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        let position = new Float32Array([
            0, 0,
            0, 0.5,
            0.5, 0,
            0, -0.5,
            -0.5, 0,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);
        let a_position = gl.getAttribLocation(glProgram, "a_position");
        gl.enableVertexAttribArray(a_position);
        let size = 2;          // 每次迭代运行提取两个单位数据
        let type = gl.FLOAT;   // 每个单位的数据类型是32位浮点型
        let normalize = false; // 不需要归一化数据
        let stride = 0;        // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
                            // 每次迭代运行运动多少内存到下一个数据开始点
        gl.vertexAttribPointer(a_position, size, type, normalize, stride, 0);
        // 设置清空颜色
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // 用设置的颜色清空屏幕（参数代表的是清除颜色缓冲）
        gl.clear(gl.COLOR_BUFFER_BIT);

        let primitiveType = gl.POINTS;
        // let primitiveType = gl.TRIANGLES;
        let count = 5;
        gl.drawArrays(primitiveType, 0, count);
    }
    drawImage() {
        let img = new Image();
        img.src = avatar;
        img.onload = () => {
            this.render(img);
        }
    }
    render(image: HTMLImageElement) {
        let canvas = document.getElementById('webgl_2') as HTMLCanvasElement;
        let gl: WebGLRenderingContext = canvas.getContext("webgl");
        // // 创建顶点着色器对象
        // let vertexShader: WebGLShader = util.createShader(gl, gl.VERTEX_SHADER, vertex);
        // // 创建片段着色器对象
        // let fragmentShader: WebGLShader = util.createShader(gl, gl.FRAGMENT_SHADER, fragment);
        // // 创建一个着色器程序
        // let program: WebGLProgram = util.createProgram(gl, vertexShader, fragmentShader);
        let program: WebGLProgram = util.createProgramFromShaderSource(gl, vertex, fragment);
        // look up where the vertex data needs to go.
        let positionLocation = gl.getAttribLocation(program, "a_position");
        let texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

        // Create a buffer to put three 2d clip space points in
        let positionBuffer = gl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Set a rectangle the same size as the image.
        this.setRectangle(gl, 0, 0, image.width, image.height);

        // provide texture coordinates for the rectangle.
        let texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0,
        ]), gl.STATIC_DRAW);

        // Create a texture.
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // lookup uniforms
        let resolutionLocation = gl.getUniformLocation(program, "u_resolution");

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // Turn on the position attribute
        gl.enableVertexAttribArray(positionLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        let size = 2;          // 2 components per iteration
        let type = gl.FLOAT;   // the data is 32bit floats
        let normalize = false; // don't normalize the data
        let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionLocation, size, type, normalize, stride, offset)

        // Turn on the teccord attribute
        gl.enableVertexAttribArray(texcoordLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        size = 2;          // 2 components per iteration
        type = gl.FLOAT;   // the data is 32bit floats
        normalize = false; // don't normalize the data
        stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            texcoordLocation, size, type, normalize, stride, offset)

        // set the resolution
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

        // Draw the rectangle.
        let primitiveType = gl.TRIANGLES;
        offset = 0;
        let count = 6;
        gl.drawArrays(primitiveType, offset, count);
    }
    setRectangle(gl:WebGLRenderingContext, x:number, y:number, width:number, height:number) {
        let x1 = x;
        let x2 = x + width;
        let y1 = y;
        let y2 = y + height;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
           x1, y1,
           x2, y1,
           x1, y2,
           x1, y2,
           x2, y1,
           x2, y2,
        ]), gl.STATIC_DRAW);
      }
}
let gl = new WebGL();
gl.drawPoint();
gl.drawImage();
