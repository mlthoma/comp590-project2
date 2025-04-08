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

// ----------------------------------------------
// Start of our code
// ----------------------------------------------

let webgl_context = null;

let xy_attr_vertex = null;
let xy_uniform_props = null;
let xy_uniform_color = null;
let xy_uniform_z_translation = null;
let xy_uniform_view = null;

let yz_attr_vertex = null;
let yz_uniform_props = null;
let yz_uniform_color = null;
let yz_uniform_z_translation = null;
let yz_uniform_view = null;

let xz_attr_vertex = null;
let xz_uniform_props = null;
let xz_uniform_color = null;
let xz_uniform_z_translation = null;
let xz_uniform_view = null;

let xyz_attr_vertex = null;
let xyz_uniform_props = null;
let xyz_uniform_color = null;
let xyz_uniform_z_translation = null;
let xyz_uniform_view = null;

let vertex_data = [];
let canvas = null;

let xyprogram = null;
let yzprogram = null;
let xzprogram = null;
let xyzprogram = null;

let count = 2;
let size = 3;
let axis_index = 0;
let propeller_index = 0;

function configure(webgl_context, id) {


    canvas = document.getElementById( id );

    webgl_context = canvas.getContext("webgl");
    switch(id){
        case "xy":
            xyprogram = initShaders( webgl_context, "vertex-shader", "fragment-shader" );
            webgl_context.useProgram( xyprogram );
            xy_attr_vertex = webgl_context.getAttribLocation( xyprogram, "vertex" );
            xy_uniform_props = webgl_context.getUniformLocation( xyprogram, "props" );
            xy_uniform_color = webgl_context.getUniformLocation( xyprogram, "color" );
            xy_uniform_z_translation = webgl_context.getUniformLocation(xyprogram, "z_translation");
            xy_uniform_view = webgl_context.getUniformLocation(xyprogram, "View");
            xy_uniform_view = webgl_context.uniformMatrix4fv(xy_uniform_view, false, flatten(viewMatrix));
            break;
        case "yz":
            yzprogram = initShaders( webgl_context, "vertex-shader", "fragment-shader" );
            webgl_context.useProgram( yzprogram );
            yz_attr_vertex = webgl_context.getAttribLocation( yzprogram, "vertex" );
            yz_uniform_props = webgl_context.getUniformLocation( yzprogram, "props" );
            yz_uniform_color = webgl_context.getUniformLocation( yzprogram, "color" );
            yz_uniform_z_translation = webgl_context.getUniformLocation(yzprogram, "z_translation");
            yz_uniform_view = webgl_context.getUniformLocation(yzprogram, "View");
            yz_uniform_view = webgl_context.uniformMatrix4fv(yz_uniform_view, false, flatten(viewMatrix));
            break;
        case "xz":
            xzprogram = initShaders( webgl_context, "vertex-shader", "fragment-shader" );
            webgl_context.useProgram( xzprogram );
            xz_attr_vertex = webgl_context.getAttribLocation( xzprogram, "vertex" );
            xz_uniform_props = webgl_context.getUniformLocation( xzprogram, "props" );
            xz_uniform_color = webgl_context.getUniformLocation( xzprogram, "color" );
            xz_uniform_z_translation = webgl_context.getUniformLocation(xzprogram, "z_translation");
            xz_uniform_view = webgl_context.getUniformLocation(xzprogram, "View");
            xz_uniform_view = webgl_context.uniformMatrix4fv(xz_uniform_view, false, flatten(viewMatrix));
            break;
        case "xyz":
            xyzprogram = initShaders( webgl_context, "vertex-shader", "fragment-shader" );
            webgl_context.useProgram( xyzprogram );
            xyz_attr_vertex = webgl_context.getAttribLocation( xyzprogram, "vertex" );
            xyz_uniform_props = webgl_context.getUniformLocation( xyzprogram, "props" );
            xyz_uniform_color = webgl_context.getUniformLocation( xyzprogram, "color" );
            xyz_uniform_z_translation = webgl_context.getUniformLocation(xyzprogram, "z_translation");
            xyz_uniform_view = webgl_context.getUniformLocation(xyzprogram, "View");
            xyz_uniform_view = webgl_context.uniformMatrix4fv(xyz_uniform_view, false, flatten(viewMatrix));
            break;
    }

    webgl_context.viewport( 0, 0, canvas.width, canvas.height );
    webgl_context.enable( webgl_context.DEPTH_TEST );

    return webgl_context;

}

function createVertexData() {
    let row = 0;

    // plane
    for (let i=0; i<Fpl.length; i++ ) {
        vertex_data[row++] = Vpl[Fpl[i][0]];
        vertex_data[row++] = Vpl[Fpl[i][1]];
        vertex_data[row++] = Vpl[Fpl[i][2]];
    }

    //propeller
    propeller_index = vertex_data.length;
    for (let i=0; i<Fpp.length; i++ ) {
        vertex_data[row++] = Vpp[Fpp[i][0]];
        vertex_data[row++] = Vpp[Fpp[i][1]];
        vertex_data[row++] = Vpp[Fpp[i][2]];
    }

    //axes
    axis_index = vertex_data.length; //adjust after prop?
    for (let i=0; i<A.length; i++) {
        vertex_data[row++] = A[i];
    }
}

function allocateMemory(webgl_context, id) {
    let buffer_id = webgl_context.createBuffer();
   
    webgl_context.bindBuffer( webgl_context.ARRAY_BUFFER, buffer_id );

    switch (id) {
        case "xy":
            webgl_context.vertexAttribPointer( xy_attr_vertex, size, webgl_context.FLOAT, false, 0, 0 );
            webgl_context.enableVertexAttribArray( xy_attr_vertex );
            break;
        case "yz":
            webgl_context.vertexAttribPointer( yz_attr_vertex, size, webgl_context.FLOAT, false, 0, 0 );
            webgl_context.enableVertexAttribArray( yz_attr_vertex );
            break;
        case "xz":
            webgl_context.vertexAttribPointer( xz_attr_vertex, size, webgl_context.FLOAT, false, 0, 0 );
            webgl_context.enableVertexAttribArray( xz_attr_vertex );
            break;
        case "xyz":
            webgl_context.vertexAttribPointer( xyz_attr_vertex, size, webgl_context.FLOAT, false, 0, 0 );
            webgl_context.enableVertexAttribArray( xyz_attr_vertex );
            break;
    }
   
    webgl_context.bufferData( webgl_context.ARRAY_BUFFER, flatten(vertex_data), webgl_context.STATIC_DRAW );

    return webgl_context;
}

function draw(webgl_context, id) {
    let xrad = xang*(Math.PI/180); //might not need
    let yrad = yang*(Math.PI/180);
    let zrad = zang*(Math.PI/180);
    let scale = 1.75;

    let uniform_props = null;
    let uniform_color = null;
    let uniform_z_translation = null;
    switch (id) {
        case "xy":
            uniform_props = xy_uniform_props;
            uniform_color = xy_uniform_color;
            uniform_z_translation = xy_uniform_z_translation;
            xrad = 0;
            yrad = 0;
            break;
        case "yz":
            uniform_props = yz_uniform_props;
            uniform_color = yz_uniform_color;
            uniform_z_translation = yz_uniform_z_translation;
            yrad = 0;
            zrad = 0;
            break;
        case "xz":
            uniform_props = xz_uniform_props;
            uniform_color = xz_uniform_color;
            uniform_z_translation = xz_uniform_z_translation;
            xrad = 0;
            zrad = 0;
            break;
        case "xyz":
            uniform_props = xyz_uniform_props;
            uniform_color = xyz_uniform_color;
            uniform_z_translation = xyz_uniform_z_translation;
            break;

    }


    webgl_context.uniform4f(uniform_props, xrad, yrad, zrad, scale); //zang for plane, axes and rot for propeller?
   
    let i = 0;
    let j = 0;
   
    // draw plane lines
    webgl_context.uniform4f( uniform_color, 0.60, 0.60, 0.60, 1.0 );
    for ( j=0; j<propeller_index; j+=size) {
        webgl_context.drawArrays( webgl_context.LINE_STRIP, j, size );    
    }

    // draw plane faces
    webgl_context.uniform4f( uniform_color, 0.81, 0.81, 0.81, 1.0 );
    webgl_context.drawArrays( webgl_context.TRIANGLES, 0, i+=propeller_index );

    // translate propeller along z-axis and change z rotation variable
    webgl_context.uniform1f(uniform_z_translation, -0.38);
    rot += rot_inc;
    let rrad = rot*(Math.PI/180);
    webgl_context.uniform4f(uniform_props, xrad, yrad, rrad, scale);

    // draw propeller lines
    webgl_context.uniform4f( uniform_color, 0.60, 0.60, 0.60, 1.0 );
    for ( j=propeller_index; j<axis_index; j+=size) {
        webgl_context.drawArrays( webgl_context.LINE_STRIP, j, size );    
    }

    // // draw propeller faces
    webgl_context.uniform4f( uniform_color, 0.81, 0.81, 0.81, 1.0 );
    webgl_context.drawArrays( webgl_context.TRIANGLES, propeller_index, axis_index - propeller_index);
    i = axis_index;

    // translate along z-axis back to origin and reset z rotation variable
    webgl_context.uniform1f(uniform_z_translation, 0);
    webgl_context.uniform4f(uniform_props, xrad, yrad, zrad, scale);
 
    // draw coordinate axes
    webgl_context.uniform4f( uniform_color, 1.0, 0.0, 0.0, 1.0 );
    webgl_context.drawArrays( webgl_context.LINES, i, count);
    i+=count;
   
    webgl_context.uniform4f( uniform_color, 0.0, 1.0, 0.0, 1.0 );
    webgl_context.drawArrays( webgl_context.LINES, i, count);
    i+=count;
   
    webgl_context.uniform4f( uniform_color, 0.0, 0.0, 1.0, 1.0 );
    webgl_context.drawArrays( webgl_context.LINES, i, count);

}

function drawYZ() { draw(yz); }

createVertexData();

let at = vec3(0.0,0.0,0.0);
let up = vec3(0.0,0.5,0.0);
let eye = vec3(-0.15,-0.15,0.35);
let viewMatrix = lookAt( eye, at, up );

eye = vec3(0.1, 0, 0);
up = vec3(0.0,0.5,0.0);
viewMatrix = lookAt( eye, at, up );
xy = configure(xy, "xy");
xy = allocateMemory(xy, "xy");
setInterval(() => draw(xy, "xy"), 100);

eye = vec3(0, 0, 0.1);
up = vec3(0.0,0.5,0.0);
viewMatrix = lookAt( eye, at, up );
yz = configure(yz, "yz");
yz = allocateMemory(yz, "yz");
setInterval(() => draw(yz, "yz"), 100);

eye = vec3(0, -0.1, 0);
up = vec3(0.0,0.0,0.5);
viewMatrix = lookAt( eye, at, up );
xz = configure(xz, "xz");
xz = allocateMemory(xz, "xz");
setInterval(() => draw(xz, "xz"), 100);

eye = vec3(-0.05,-0.05,0.25);
up = vec3(0.0,0.5,0.0);
viewMatrix = lookAt( eye, at, up );
xyz = configure(xyz, "xyz");
xyz = allocateMemory(xyz, "xyz");
setInterval(() => draw(xyz, "xyz"), 100);
