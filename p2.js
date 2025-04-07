console.clear();

// ----------------------------------------------
// Axis data (do not modify)
// ----------------------------------------------

let A = [
    [0.0, 0.0, 0.0],
    [1.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 1.0]
];

// ----------------------------------------------
// end axis data
// ----------------------------------------------

// ----------------------------------------------
// Simuation control (do not modify)
// ----------------------------------------------

let xang = 0;
let yang = 0;
let zang = 0;
let rot = 0;
let axisRotation = null;
let rot_inc = 10;

function startRotation(rotationFunc) {
    if (axisRotation !== null) clearInterval(axisRotation);
    axisRotation = setInterval(rotationFunc, 100);
}

function stopRotation() {
    clearInterval(axisRotation);
    axisRotation = null;
}

document.addEventListener('mouseup', stopRotation);

document.addEventListener('mousedown', function (event) {
    switch ( event.target.id ) {
        case "pitch-up":
            startRotation(() => { xang = ( xang + rot_inc ) % 360; });
            break;
        case "pitch-down":
            startRotation(() => { xang = ( xang - rot_inc ) % 360; });
            break;
        case "roll-left":
            startRotation(() => { zang = ( zang + rot_inc ) % 360; });
            break;
        case "roll-right":
            startRotation(() => { zang = ( zang - rot_inc ) % 360; });
            break;
        case "yaw-left":
            startRotation(() => { yang = ( yang + rot_inc ) % 360; });
            break;
        case "yaw-right":
            startRotation(() => { yang = ( yang - rot_inc ) % 360; });
            break;
        case "reset":
            xang = yang = zang = 0; 
            break;
        default:
            stopRotation();
    }
});

// ----------------------------------------------
// End simuation control
// ----------------------------------------------

function configure(canvasId, viewMatrix) {

    let canvas = document.getElementById( canvasId );

    let webgl_context = canvas.getContext( "webgl" );
    let program = initShaders(webgl_context, "vertex-shader", "fragment-shader" );
    webgl_context.useProgram( program );

    webgl_context.viewport( 0, 0, canvas.width, canvas.height );
    webgl_context.enable( webgl_context.DEPTH_TEST );

    let attr_vertex = webgl_context.getAttribLocation( program, "vertex" );
    let uniform_props = webgl_context.getUniformLocation( program, "props" );
    let uniform_color = webgl_context.getUniformLocation( program, "color" );

    let uniform_z_translation = webgl_context.getUniformLocation( program, "z_translation" );
    let uniform_view = webgl_context.getUniformLocation( program, "View" );
    

    let buffer = allocateMemory(webgl_context, program, attr_vertex, vertex_data);

    webgl_context.uniformMatrix4fv( uniform_view, false, flatten(viewMatrix) );

    return {
        webgl_context,
        program,
        uniform_props,
        uniform_z_translation,
        uniform_color,
        uniform_view,
        buffer,
        canvasId
    };
}


let vertex_data = [];
let axis_index = 0;

function createVertexData() {
    let row = 0;

    for (let i = 0; i < F.length; i++) {
        vertex_data[row++] = V[F[i][0]];
        vertex_data[row++] = V[F[i][1]];
        vertex_data[row++] = V[F[i][2]];
    }

    axis_index = vertex_data.length;

    for (let i = 0; i < A.length; i++) {
        vertex_data[row++] = A[i];
    }
}

function allocateMemory(webgl_context, program, attr_vertex, vertex_data) {

    let buffer_id = webgl_context.createBuffer();

    webgl_context.bindBuffer( webgl_context.ARRAY_BUFFER, buffer_id);
    webgl_context.vertexAttribPointer( attr_vertex, 3, webgl_context.FLOAT, false, 0, 0 );
    webgl_context.enableVertexAttribArray( attr_vertex );
    webgl_context.bufferData( webgl_context.ARRAY_BUFFER, flatten(vertex_data), webgl_context.STATIC_DRAW );

    return buffer_id;

}

function draw(context) {

    context.webgl_context.uniform3f( context.uniform_props,
        radians(xang),
        radians(yang),
        radians(zang)
    );

    context.webgl_context.uniform1f(context.uniform_z_translation, 0.0);

    context.webgl_context.uniform4f(context.uniform_color, 0.7, 0.7, 0.7, 1.0);
    context.webgl_context.drawArrays(context.webgl_context.TRIANGLES, 0, axis_index);

    context.webgl_context.uniform4f(context.uniform_color, 1.0, 0.0, 0.0, 1.0);
    context.webgl_context.drawArrays(context.webgl_context.LINES, axis_index + 0, 2);

    context.webgl_context.uniform4f(context.uniform_color, 0.0, 1.0, 0.0, 1.0);
    context.webgl_context.drawArrays(context.webgl_context.LINES, axis_index + 2, 2);

    context.webgl_context.uniform4f(context.uniform_color, 0.0, 0.0, 1.0, 1.0);
    context.webgl_context.drawArrays(context.webgl_context.LINES, axis_index + 4, 2);
}


let eye = vec3(0.0, 0.0, 1.0);
let at = vec3(0.0, 0.0, 0.0);

let view_xy = lookAt(eye, at, vec3(0.0, 1.0, 0.0));
let view_yz = lookAt(eye, at, vec3(0.0, 0.0, 1.0));
let view_xz = lookAt(eye, at, vec3(1.0, 0.0, 0.0));
let view_xyz = lookAt(vec3(-0.15, -0.15, 0.35), at, vec3(0.0, 1.0, 0.0));

createVertexData();

let ctx_xy   = configure("xy", view_xy);
let ctx_yz   = configure("yz", view_yz);
let ctx_xz   = configure("xz", view_xz);
let ctx_xyz  = configure("xyz", view_xyz);

let allContexts = [ctx_xy, ctx_yz, ctx_xz, ctx_xyz];

function drawAll() {
    for (let i = 0; i < allContexts.length; i++) {
        draw(allContexts[i]);
    }
}

setInterval(drawAll, 100);
