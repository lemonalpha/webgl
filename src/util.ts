
export function createShader(gl: WebGLRenderingContext, type: WebGLRenderingContext["VERTEX_SHADER"], source: string) {
    let shader: WebGLShader = gl.createShader(type) as WebGLShader;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

export function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    let program: WebGLProgram = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    gl.useProgram(program);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

export function createProgramFromShaderSource(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
    let vertShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    let fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    return createProgram(gl, vertShader, fragShader);
}
