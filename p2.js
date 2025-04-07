console.clear();


let webgl_context = null;
let attr_vertex = null;
let uniform_props = null;
let uniform_color = null;
let uniform_z_translation = null;
let uniform_view = null;
let vertex_data = [];
let canvas = null;
let program = null;
let count = 2;
let size = 3;
let rot = 0;
let axis_index = 0;
let axisRotation = null;
let xang = 0, yang = 0, zang = 0;
const rot_inc = 5;


let xzContext, yzContext, xyContext, xyzContext;

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

function createVertexData() {
    let row = 0;
    
    for (let i = 0; i < Fpl.length; i++) {
        vertex_data[row++] = Vpl[Fpl[i][0]];
        vertex_data[row++] = Vpl[Fpl[i][1]];
        vertex_data[row++] = Vpl[Fpl[i][2]];
    }
    
    for (let i = 0; i < Fpp.length; i++) {
        vertex_data[row++] = Vpp[Fpp[i][0]];
        vertex_data[row++] = Vpp[Fpp[i][1]];
        vertex_data[row++] = Vpp[Fpp[i][2]];
    }
    
    axis_index = vertex_data.length;
    
    for (let i = 0; i < A.length; i++) {
        vertex_data[row++] = A[i];
    }
}

function configure() {

    const xzCanvas = document.getElementById("xz");
    const yzCanvas = document.getElementById("yz");
    const xyCanvas = document.getElementById("xy");
    const xyzCanvas = document.getElementById("xyz");


    xzContext = xzCanvas.getContext("webgl");
    yzContext = yzCanvas.getContext("webgl");
    xyContext = xyCanvas.getContext("webgl");
    xyzContext = xyzCanvas.getContext("webgl");


    [xzContext, yzContext, xyContext, xyzContext].forEach(context => {
        const program = initShaders(context, "vertex-shader", "fragment-shader");
        context.useProgram(program);
        
        context.viewport(0, 0, context.canvas.width, context.canvas.height);
        context.enable(context.DEPTH_TEST);
        
        context.attr_vertex = context.getAttribLocation(program, "vertex");
        context.uniform_props = context.getUniformLocation(program, "props");
        context.uniform_color = context.getUniformLocation(program, "color");
        context.uniform_z_translation = context.getUniformLocation(program, "z_translation");
        context.uniform_view = context.getUniformLocation(program, "View");
    });


    let at = vec3(0.0, 0.0, 0.0);
    

    let viewMatrix = lookAt(vec3(0.0, 2.0, 0.0), at, vec3(0.0, 0.0, -1.0));
    xzContext.uniformMatrix4fv(xzContext.uniform_view, false, flatten(viewMatrix));
    

    viewMatrix = lookAt(vec3(2.0, 0.0, 0.0), at, vec3(0.0, 1.0, 0.0));
    yzContext.uniformMatrix4fv(yzContext.uniform_view, false, flatten(viewMatrix));
    

    viewMatrix = lookAt(vec3(0.0, 0.0, 2.0), at, vec3(0.0, 1.0, 0.0));
    xyContext.uniformMatrix4fv(xyContext.uniform_view, false, flatten(viewMatrix));
    

    viewMatrix = lookAt(vec3(-0.15, -0.15, 0.35), at, vec3(0.0, 0.5, 0.0));
    xyzContext.uniformMatrix4fv(xyzContext.uniform_view, false, flatten(viewMatrix));
}

function allocateMemory() {
    [xzContext, yzContext, xyContext, xyzContext].forEach(context => {
        const buffer_id = context.createBuffer();
        context.bindBuffer(context.ARRAY_BUFFER, buffer_id);
        context.vertexAttribPointer(context.attr_vertex, size, context.FLOAT, false, 0, 0);
        context.enableVertexAttribArray(context.attr_vertex);
        context.bufferData(context.ARRAY_BUFFER, flatten(vertex_data), context.STATIC_DRAW);
    });
}

function draw() {
    rot = (rot + 5) % 360;

    [xzContext, yzContext, xyContext, xyzContext].forEach(context => {
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);


        context.uniform4f(context.uniform_props, xang * Math.PI / 180, yang * Math.PI / 180, zang * Math.PI / 180, 1.75);
        context.uniform1f(context.uniform_z_translation, 0.0);
        context.uniform4f(context.uniform_color, 0.81, 0.81, 0.81, 1.0);
        context.drawArrays(context.TRIANGLES, 0, Fpl.length * 3);


        context.uniform4f(context.uniform_color, 0.5, 0.5, 0.5, 1.0);
        context.uniform4f(context.uniform_props, xang * Math.PI / 180, yang * Math.PI / 180, rot * Math.PI / 180, 1.75);
        context.drawArrays(context.TRIANGLES, Fpl.length * 3, Fpp.length * 3);


        const axisStart = (Fpl.length + Fpp.length) * 3;
        context.uniform4f(context.uniform_props, 0, 0, 0, 1.0);
        context.uniform4f(context.uniform_color, 1.0, 0.0, 0.0, 1.0);
        context.drawArrays(context.LINES, axisStart, 2);
        context.uniform4f(context.uniform_color, 0.0, 1.0, 0.0, 1.0);
        context.drawArrays(context.LINES, axisStart + 2, 2);
        context.uniform4f(context.uniform_color, 0.0, 0.0, 1.0, 1.0);
        context.drawArrays(context.LINES, axisStart + 4, 2);
    });
}

// ----------------------------------------------
// Simulation control (do not modify)
// ----------------------------------------------
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
    switch (event.target.id) {
        case "pitch-up":
            startRotation(() => { xang = (xang + rot_inc) % 360; });
            break;
        case "pitch-down":
            startRotation(() => { xang = (xang - rot_inc) % 360; });
            break;
        case "roll-left":
            startRotation(() => { zang = (zang + rot_inc) % 360; });
            break;
        case "roll-right":
            startRotation(() => { zang = (zang - rot_inc) % 360; });
            break;
        case "yaw-left":
            startRotation(() => { yang = (yang + rot_inc) % 360; });
            break;
        case "yaw-right":
            startRotation(() => { yang = (yang - rot_inc) % 360; });
            break;
        case "reset":
            xang = yang = zang = 0;
            break;
        default:
            stopRotation();
    }
});


createVertexData();
configure();
allocateMemory();
setInterval(draw, 100);

