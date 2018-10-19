import * as util from './util';
import point_vertex from './shader/point.vert';
import point_fragment from './shader/point.frag';
import vertex from './shader/texture2d.vert';
import fragment from './shader/texture2d.frag';
import galaxy_vertex from './shader/galaxy.vert';
import galaxy_fragment from './shader/galaxy.frag';
import fragment2 from './shader/textureTrans.frag';
import avatar from './img/avatar.png';

class WebGL1 {
    public drawPoint() {
        const canvas = document.getElementById('webgl_1') as HTMLCanvasElement;
        const webgl: WebGLRenderingContext = canvas.getContext('webgl');
        const glProgram: WebGLProgram = util.createProgramFromShaderSource(webgl, point_vertex, point_fragment);
        const buffer = webgl.createBuffer();
        webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
        const position = new Float32Array([
            0, 0,
            0, 0.5,
            0.5, 0,
            0, -0.5,
            -0.5, 0
        ]);
        webgl.bufferData(webgl.ARRAY_BUFFER, position, webgl.STATIC_DRAW);
        const aPosition = webgl.getAttribLocation(glProgram, 'a_position');
        webgl.enableVertexAttribArray(aPosition);
        const size = 2;          // 每次迭代运行提取两个单位数据
        const type = webgl.FLOAT;   // 每个单位的数据类型是32位浮点型
        const normalize = false; // 不需要归一化数据
        const stride = 0;        // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
        // 每次迭代运行运动多少内存到下一个数据开始点
        webgl.vertexAttribPointer(aPosition, size, type, normalize, stride, 0);
        // 设置清空颜色
        webgl.clearColor(0.0, 0.0, 0.0, 1.0);
        // 用设置的颜色清空屏幕（参数代表的是清除颜色缓冲）
        webgl.clear(webgl.COLOR_BUFFER_BIT);

        const primitiveType = webgl.POINTS;
        // const primitiveType = gl.TRIANGLES;
        const count = 5;
        webgl.drawArrays(primitiveType, 0, count);
    }

    public drawImage() {
        const img = new Image();
        img.src = avatar;
        img.onload = () => {
            this.render(img);
        };
    }

    public drawGalaxy() {
        const img = new Image();
        img.src = avatar;
        img.onload = () => {
            this._drawGalaxy(img);
        };
    }

    public setRectangle(webgl: WebGLRenderingContext, x: number, y: number, width: number, height: number) {
        const x1 = x;
        const x2 = x + width;
        const y1 = y;
        const y2 = y + height;
        webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2
        ]), webgl.STATIC_DRAW);
    }

    protected render(image: HTMLImageElement) {
        const canvas = document.getElementById('webgl_2') as HTMLCanvasElement;
        const webgl: WebGLRenderingContext = canvas.getContext('webgl');
        const program: WebGLProgram = util.createProgramFromShaderSource(webgl, vertex, fragment);
        // look up where the vertex data needs to go.
        const positionLocation = webgl.getAttribLocation(program, 'a_position');
        const texcoordLocation = webgl.getAttribLocation(program, 'a_texCoord');

        // Create a buffer to put three 2d clip space points in
        const positionBuffer = webgl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        webgl.bindBuffer(webgl.ARRAY_BUFFER, positionBuffer);
        // Set a rectangle the same size as the image.
        this.setRectangle(webgl, 0, 0, image.width, image.height);

        // provide texture coordinates for the rectangle.
        const texcoordBuffer = webgl.createBuffer();
        webgl.bindBuffer(webgl.ARRAY_BUFFER, texcoordBuffer);
        webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0
        ]), webgl.STATIC_DRAW);

        // Create a texture.
        const texture = webgl.createTexture();
        webgl.bindTexture(webgl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);

        // Upload the image into the texture.
        webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, image);

        // lookup uniforms
        const resolutionLocation = webgl.getUniformLocation(program, 'u_resolution');

        // Tell WebGL how to convert from clip space to pixels
        webgl.viewport(0, 0, webgl.canvas.width, webgl.canvas.height);

        // Clear the canvas
        webgl.clearColor(0, 0, 0, 0);
        webgl.clear(webgl.COLOR_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        // gl.useProgram(program);

        // Turn on the position attribute
        webgl.enableVertexAttribArray(positionLocation);

        // Bind the position buffer.
        webgl.bindBuffer(webgl.ARRAY_BUFFER, positionBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        let size = 2;          // 2 components per iteration
        let type = webgl.FLOAT;   // the data is 32bit floats
        let normalize = false; // don't normalize the data
        let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0;        // start at the beginning of the buffer
        webgl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

        // Turn on the teccord attribute
        webgl.enableVertexAttribArray(texcoordLocation);

        // Bind the position buffer.
        webgl.bindBuffer(webgl.ARRAY_BUFFER, texcoordBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        size = 2;          // 2 components per iteration
        type = webgl.FLOAT;   // the data is 32bit floats
        normalize = false; // don't normalize the data
        stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        offset = 0;        // start at the beginning of the buffer
        webgl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);
        // set the resolution
        webgl.uniform2f(resolutionLocation, webgl.canvas.width, webgl.canvas.height);

        // Draw the rectangle.
        const primitiveType = webgl.TRIANGLES;
        offset = 0;
        const count = 6;
        webgl.drawArrays(primitiveType, offset, count);
    }

    private _drawGalaxy(image: HTMLImageElement) {
        const canvas = document.getElementById('webgl_3') as HTMLCanvasElement;
        const webgl: WebGLRenderingContext = canvas.getContext('webgl');
        const program: WebGLProgram = util.createProgramFromShaderSource(webgl, galaxy_vertex, galaxy_fragment);
        // look up where the vertex data needs to go.
        const positionLocation = webgl.getAttribLocation(program, 'a_position');
        const texcoordLocation = webgl.getAttribLocation(program, 'a_texCoord');

        // Create a buffer to put three 2d clip space points in
        const positionBuffer = webgl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        webgl.bindBuffer(webgl.ARRAY_BUFFER, positionBuffer);
        // Set a rectangle the same size as the image.
        this.setRectangle(webgl, 0, 0, image.width, image.height);

        // provide texture coordinates for the rectangle.
        const texcoordBuffer = webgl.createBuffer();
        webgl.bindBuffer(webgl.ARRAY_BUFFER, texcoordBuffer);
        webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0
        ]), webgl.STATIC_DRAW);

        // Create a texture.
        const texture = webgl.createTexture();
        webgl.bindTexture(webgl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);

        // Upload the image into the texture.
        webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, image);

        // lookup uniforms
        const resolutionLocation = webgl.getUniformLocation(program, 'u_resolution');

        // Tell WebGL how to convert from clip space to pixels
        webgl.viewport(0, 0, webgl.canvas.width, webgl.canvas.height);

        // Clear the canvas
        webgl.clearColor(0, 0, 0, 0);
        webgl.clear(webgl.COLOR_BUFFER_BIT);
        // Turn on the position attribute
        webgl.enableVertexAttribArray(positionLocation);

        // Bind the position buffer.
        webgl.bindBuffer(webgl.ARRAY_BUFFER, positionBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        let size = 2;          // 2 components per iteration
        let type = webgl.FLOAT;   // the data is 32bit floats
        let normalize = false; // don't normalize the data
        let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0;        // start at the beginning of the buffer
        webgl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

        // Turn on the teccord attribute
        webgl.enableVertexAttribArray(texcoordLocation);

        // Bind the position buffer.
        webgl.bindBuffer(webgl.ARRAY_BUFFER, texcoordBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        size = 2;          // 2 components per iteration
        type = webgl.FLOAT;   // the data is 32bit floats
        normalize = false; // don't normalize the data
        stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        offset = 0;        // start at the beginning of the buffer
        webgl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);

        // set the resolution
        webgl.uniform2f(resolutionLocation, webgl.canvas.width, webgl.canvas.height);

        // Draw the rectangle.
        const primitiveType = webgl.TRIANGLES;
        offset = 0;
        const count = 6;
        webgl.drawArrays(primitiveType, offset, count);
        this.update(webgl, program);
    }

    private update(webgl: WebGLRenderingContext, program: WebGLProgram) {
        let time = 0;
        setTimeout(() => {
            time += 0.05;
            let sin = Math.sin(time);
            if (sin > 0.99) {
                sin = 0;
                time = 0;
            }
            webgl.uniform1f(webgl.getUniformLocation(program, 'sys_time'), sin);
            this.update(webgl, program);
        }, 50);
    }

}

const gl = new WebGL1();
gl.drawPoint();
gl.drawImage();
gl.drawGalaxy();

interface Vec3 {
    [key: string]: number[];
}

class WebGL2 extends WebGL1{
    private canvas = document.getElementById('webgl_4') as HTMLCanvasElement;
    private webgl: WebGLRenderingContext;
    private glProgram: WebGLProgram;
    private positionBuffer: WebGLBuffer;
    private texcoordBuffer: WebGLBuffer;
    private kernels: Vec3;
    private image: HTMLImageElement;
    private positionLocation: number;
    private texcoordLocation: number;
    private resolutionLocation: WebGLUniformLocation;
    private textureSizeLocation: WebGLUniformLocation;
    private kernelLocation: WebGLUniformLocation;
    private kernelWeightLocation: WebGLUniformLocation;
    public drawImage() {
        const kernels: Vec3 ={
            normal: [
              0, 0, 0,
              0, 1, 0,
              0, 0, 0
            ],
            gaussianBlur: [
              0.045, 0.122, 0.045,
              0.122, 0.332, 0.122,
              0.045, 0.122, 0.045
            ],
            gaussianBlur2: [
              1, 2, 1,
              2, 4, 2,
              1, 2, 1
            ],
            gaussianBlur3: [
              0, 1, 0,
              1, 1, 1,
              0, 1, 0
            ],
            unsharpen: [
              -1, -1, -1,
              -1,  9, -1,
              -1, -1, -1
            ],
            sharpness: [
               0,-1, 0,
              -1, 5,-1,
               0,-1, 0
            ],
            sharpen: [
               -1, -1, -1,
               -1, 16, -1,
               -1, -1, -1
            ],
            edgeDetect: [
               -0.125, -0.125, -0.125,
               -0.125,  1,     -0.125,
               -0.125, -0.125, -0.125
            ],
            edgeDetect2: [
               -1, -1, -1,
               -1,  8, -1,
               -1, -1, -1
            ],
            edgeDetect3: [
               -5, 0, 0,
                0, 0, 0,
                0, 0, 5
            ],
            edgeDetect4: [
               -1, -1, -1,
                0,  0,  0,
                1,  1,  1
            ],
            edgeDetect5: [
               -1, -1, -1,
                2,  2,  2,
               -1, -1, -1
            ],
            edgeDetect6: [
               -5, -5, -5,
               -5, 39, -5,
               -5, -5, -5
            ],
            sobelHorizontal: [
                1,  2,  1,
                0,  0,  0,
               -1, -2, -1
            ],
            sobelVertical: [
                1,  0, -1,
                2,  0, -2,
                1,  0, -1
            ],
            previtHorizontal: [
                1,  1,  1,
                0,  0,  0,
               -1, -1, -1
            ],
            previtVertical: [
                1,  0, -1,
                1,  0, -1,
                1,  0, -1
            ],
            boxBlur: [
                0.111, 0.111, 0.111,
                0.111, 0.111, 0.111,
                0.111, 0.111, 0.111
            ],
            triangleBlur: [
                0.0625, 0.125, 0.0625,
                0.125,  0.25,  0.125,
                0.0625, 0.125, 0.0625
            ],
            emboss: [
               -2, -1,  0,
               -1,  1,  1,
                0,  1,  2
            ]
        };
        this.kernels = kernels;
        const ui = document.getElementById('ui');
        const select = document.createElement('select');
        const initialSelection = 'edgeDetect2';
        for (const key in kernels) {
            if (kernels.hasOwnProperty(key)) {
                const option = document.createElement('option');
                option.value = key;
                if (key === initialSelection) {
                    option.selected = true;
                }
                option.appendChild(document.createTextNode(key));
                select.appendChild(option);
            }
        }
        select.onchange = function() {
            const value = select.options[select.selectedIndex].value;
            this.drawWithKernel(value);
        }.bind(this);
        ui.appendChild(select);
        const img = new Image();
        img.src = avatar;
        img.onload = () => {
            this.render(img);
            this.drawWithKernel(initialSelection);
        };
    }

    protected render(image: HTMLImageElement) {
        this.image = image;
        const webgl: WebGLRenderingContext = this.canvas.getContext('webgl');
        this.webgl = webgl;
        const glProgram: WebGLProgram = util.createProgramFromShaderSource(webgl, vertex, fragment2);
        this.glProgram = glProgram;
        this.positionLocation = webgl.getAttribLocation(glProgram, 'a_position');
        this.texcoordLocation = webgl.getAttribLocation(glProgram, 'a_texCoord');
        this.positionBuffer = webgl.createBuffer();
        webgl.bindBuffer(webgl.ARRAY_BUFFER, this.positionBuffer);
        this.setRectangle(webgl, 0, 0, image.width, image.height);
        this.texcoordBuffer = webgl.createBuffer();
        webgl.bindBuffer(webgl.ARRAY_BUFFER, this.texcoordBuffer);
        webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0
        ]), webgl.STATIC_DRAW);
        const texture = webgl.createTexture();
        webgl.bindTexture(webgl.TEXTURE_2D, texture);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);
        //
        webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, image);
        //
        this.resolutionLocation = webgl.getUniformLocation(glProgram, 'u_resolution');
        this.textureSizeLocation = webgl.getUniformLocation(glProgram, 'u_textureSize');
        this.kernelLocation = webgl.getUniformLocation(glProgram, 'u_kernel[0]');
        this.kernelWeightLocation = webgl.getUniformLocation(glProgram, 'u_kernelWeight');
    }

    private drawWithKernel(name: string) {
        // Tell WebGL how to convert from clip space to pixels
        const webgl = this.webgl;
        webgl.viewport(0, 0, webgl.canvas.width, webgl.canvas.height);

        // Clear the canvas
        webgl.clearColor(0, 0, 0, 0);
        webgl.clear(webgl.COLOR_BUFFER_BIT);
        const program = this.glProgram;
        // Tell it to use our program (pair of shaders)
        webgl.useProgram(program);

        // Turn on the position attribute
        webgl.enableVertexAttribArray(this.positionLocation);

        // Bind the position buffer.
        webgl.bindBuffer(webgl.ARRAY_BUFFER, this.positionBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        let size = 2;          // 2 components per iteration
        let type = webgl.FLOAT;   // the data is 32bit floats
        let normalize = false; // don't normalize the data
        let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0;        // start at the beginning of the buffer
        webgl.vertexAttribPointer(this.positionLocation, size, type, normalize, stride, offset);

        // Turn on the teccord attribute
        webgl.enableVertexAttribArray(this.texcoordLocation);

        // Bind the position buffer.
        webgl.bindBuffer(webgl.ARRAY_BUFFER, this.texcoordBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        size = 2;          // 2 components per iteration
        type = webgl.FLOAT;   // the data is 32bit floats
        normalize = false; // don't normalize the data
        stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        offset = 0;        // start at the beginning of the buffer
        webgl.vertexAttribPointer(this.texcoordLocation, size, type, normalize, stride, offset);

        // set the resolution
        webgl.uniform2f(this.resolutionLocation, webgl.canvas.width, webgl.canvas.height);

        // set the size of the image
        webgl.uniform2f(this.textureSizeLocation, this.image.width, this.image.height);

        // set the kernel and it's weight
        webgl.uniform1fv(this.kernelLocation, this.kernels[name]);
        webgl.uniform1f(this.kernelWeightLocation, this.computeKernelWeight(this.kernels[name]));

        // Draw the rectangle.
        const primitiveType = webgl.TRIANGLES;
        offset = 0;
        const count = 6;
        webgl.drawArrays(primitiveType, offset, count);
    }
    private computeKernelWeight(kernel: number[]) {
        const weight = kernel.reduce(function(prev, curr) {
            return prev + curr;
        });
        return weight <= 0 ? 1 : weight;
      }
}
const test = new WebGL2();
test.drawImage();
