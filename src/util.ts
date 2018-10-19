
export function createShader(gl: WebGLRenderingContext, type: WebGLRenderingContext['VERTEX_SHADER'], source: string) {
    const shader: WebGLShader = gl.createShader(type) as WebGLShader;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    gl.deleteShader(shader);
}

export function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    const program: WebGLProgram = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    gl.useProgram(program);
    if (success) {
        return program;
    }
    gl.deleteProgram(program);
}

export function createProgramFromShaderSource(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
    const vertShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    return createProgram(gl, vertShader, fragShader);
}

export function log(...params: any) {
    // tslint:disable-next-line:no-console
    console.log(...params);
}

export function warn(...params: any) {
    // tslint:disable-next-line:no-console
    console.warn(...params);
}
