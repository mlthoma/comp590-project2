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


let at = vec3(0.0,0.0,0.0);
let up = vec3(0.0,0.5,0.0);
let eye = vec3(-0.15,-0.15,0.35);
let viewMatrix = lookAt( eye, at, up );

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

function configure() {
    canvas = document.getElementById("xyz");
    

    // canvas = document.getElementById( "webgl-canvas" );
    
    webgl_context = canvas.getContext( "webgl" );


    program = initShaders( webgl_context, "vertex-shader", "fragment-shader" );
    webgl_context.useProgram( program );
    
    webgl_context.viewport( 0, 0, canvas.width, canvas.height );
    webgl_context.enable( webgl_context.DEPTH_TEST );
       
    attr_vertex = webgl_context.getAttribLocation( program, "vertex" );
    uniform_props = webgl_context.getUniformLocation( program, "props" );
    uniform_color = webgl_context.getUniformLocation( program, "color" );

    uniform_z_translation = webgl_context.getUniformLocation(program, "z_translation");
   
    uniform_view = webgl_context.getUniformLocation(program, "View");
    webgl_context.uniformMatrix4fv(uniform_view, false, flatten(viewMatrix));

    
}


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

function allocateMemory() {
    
    let buffer_id = webgl_context.createBuffer();
    
    webgl_context.bindBuffer( webgl_context.ARRAY_BUFFER, buffer_id );
    webgl_context.vertexAttribPointer( attr_vertex, size, webgl_context.FLOAT, false, 0, 0 );
    webgl_context.enableVertexAttribArray( attr_vertex );
    webgl_context.bufferData( webgl_context.ARRAY_BUFFER, flatten(vertex_data), webgl_context.STATIC_DRAW );
    
}

function draw() {
    function getSafeValue(id, defaultValue) {
        try {
            const elem = document.getElementById(id);
            return elem ? parseFloat(elem.value) || defaultValue : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }


    const xang = getSafeValue('xang', 0) * Math.PI / 180;
    const yang = getSafeValue('yang', 0) * Math.PI / 180;
    const zang = getSafeValue('zang', 0) * Math.PI / 180;
    const scaleValue = getSafeValue('scale', 1.75);
    const ztransValue = getSafeValue('ztrans', 0);

    let gravityEnabled = false;
    try {
        gravityEnabled = document.getElementById('gravity')?.checked || false;
    } catch (e) {
        gravityEnabled = false;
    }

    webgl_context.uniform4f(uniform_props, xang, yang, zang, scaleValue);
    webgl_context.uniform1f(uniform_z_translation, ztransValue);

    webgl_context.clear(webgl_context.COLOR_BUFFER_BIT | webgl_context.DEPTH_BUFFER_BIT);


    webgl_context.uniform4f(uniform_color, 0.81, 0.81, 0.81, 1.0);
    webgl_context.drawArrays(webgl_context.TRIANGLES, 0, Fpl.length * 3);


    webgl_context.uniform4f(uniform_color, 0.5, 0.5, 0.5, 1.0);
    if (gravityEnabled) {
        rot = (rot + 5) % 360;
        webgl_context.uniform4f(uniform_props, xang, yang, rot * Math.PI / 180, scaleValue);
    }
    webgl_context.drawArrays(webgl_context.TRIANGLES, Fpl.length * 3, Fpp.length * 3);


    const axisStart = (Fpl.length + Fpp.length) * 3;
    webgl_context.uniform4f(uniform_color, 1.0, 0.0, 0.0, 1.0); // Red
    webgl_context.drawArrays(webgl_context.LINES, axisStart, 2);
    webgl_context.uniform4f(uniform_color, 0.0, 1.0, 0.0, 1.0); // Green
    webgl_context.drawArrays(webgl_context.LINES, axisStart + 2, 2);
    webgl_context.uniform4f(uniform_color, 0.0, 0.0, 1.0, 1.0); // Blue
    webgl_context.drawArrays(webgl_context.LINES, axisStart + 4, 2);
}




createVertexData();
configure();
allocateMemory();
setInterval(draw,100);

// ----------------------------------------------
// End simuation control
// ----------------------------------------------



