/*
    Mert CACINA
    CS350 Project 3 - WebGL Earth and Moon
    
    * This assignment has two planets rotates on their own axis
    and the moon (small planet) orbits around the earth (big planet).
    
    * The moon is at the 4 times distance of the earth's radius.
    
    * The moon is quarter size of the earth.
    
    * The earth completes a day in 24 steps.
    
    * The moon orbits around the world every 20 days (480 steps).
    
    * User can double or half the time by using the buttons.
    
    * User can enable or disable lightning.
    
    * User can choose two different viewpoints to see orbiting from different sides.

*/
"use strict";

var canvas;
var gl;

var numTimesToSubdivide = 4;

var index = 0;

var time = 24;

var pointsArray = [];
var normalsArray = [];

var near = -10;
var far = 10;
var dr = 5.0 * Math.PI / 180.0;
// Motion control
var j = 0;
// Rotation degree control
var theta2 = 0;
// Rend works only one time.
var rend = 0;
// Values for lookat function
var left = -3.0;
var right = 3.0;
var ytop = 3.0;
var bottom = -3.0;
// New position multiplier depending on the speed.
var newPos = 0.48;
// Sphere
var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);
// Lightning values
var lightPosition = vec4(-1.0, 0, 0, 0.0);
var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var lightDiffuse = vec4(0.6, 0.6, 0.6, 1.0);
var lightSpecular = vec4(0.6, 0.6, 0.6, 1.0);
// Material values
var materialAmbient = vec4(0, 0.2, 1.0, 1.0);
var materialDiffuse = vec4(0, 0.8, 1.0, 1.0);
var materialSpecular = vec4(0, 1.0, 0, 1.0);
var materialShininess = 200.0;
// Material values
var materialAmbient2 = vec4(0.6, 0.6, 0.6, 1.0);
var materialDiffuse2 = vec4(0.7, 0.7, 0.7, 1.0);
var materialSpecular2 = vec4(0.7, 0.7, 0.7, 1.0);
var materialShininess2 = 200.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var eye = vec3(0, 0, 1);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var eyeboo = true;
// Motion control values
var orbitX = 0;
var orbitY = 0;
var orbitZ = 0;

var program;

function triangle(a, b, c) {

    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);

    // normals are vectors

    normalsArray.push(a[0], a[1], a[2], 0.0);
    normalsArray.push(b[0], b[1], b[2], 0.0);
    normalsArray.push(c[0], c[1], c[2], 0.0);


    index += 3;
}


function divideTriangle(a, b, c, count) {
    if (count > 0) {

        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    } else {
        triangle(a, b, c);
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);





    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
    

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");


    


    // Time doubling function
    document.getElementById('b1').addEventListener('click', function () {

        time = 48;
        theta2 = 0;
        orbitX = 0;
        orbitY = 0;
        orbitZ = 0;
        j = 0;
        init();



    });
    // Normal day function
    document.getElementById('b2').addEventListener('click', function () {

        time = 24;
        theta2 = 0;
        orbitX = 0;
        orbitY = 0;
        orbitZ = 0;
        j = 0;
        init();



    });
    // Time half function
    document.getElementById('b3').addEventListener('click', function () {

        time = 12;
        theta2 = 0;
        orbitX = 0;
        orbitY = 0;
        orbitZ = 0;
        j = 0;
        init();


    });
    // Lightning on
    document.getElementById('b4').addEventListener('click', function () {

        lightAmbient = vec4(1.0, 1.0, 1.0, 1.0);



    });
    // Lightning off
    document.getElementById('b5').addEventListener('click', function () {


        lightAmbient = vec4(0, 0, 0, 1.0);


    });
    // Viewpoint change
    document.getElementById('b6').addEventListener('click', function () {


        if (eyeboo) {
            eye = vec3(0, 0, 1);
        } else {
            eye = vec3(0, 1, 1);
        }

        eyeboo = !eyeboo;


    });
    
    // Works only one time.
    if (rend == 0) {
        
        eyeboo = !eyeboo;
        render();
        rend++;
    }
    

}





function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // Model view and Projection matrixes
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    
    // Rotation speed depending on time selected.
    theta2 += 360 / time;


    // Circle motion control.
    if (j == time * 20) {
        j = 0;
    }

    if (j < time * 20 / 4) {
        orbitX = 2*Math.cos(j*2*Math.PI/(time * 20));
        orbitY += newPos / time * 0;
        orbitZ += newPos / time;
    } else if (j < time * 20 / 2) {
        orbitX = 2*Math.cos(j*2*Math.PI/(time * 20));
        orbitY += newPos / time * 0;
        orbitZ -= newPos / time;
    } else if (j < time * 20 / 4 * 3) {
        orbitX = 2*Math.cos(j*2*Math.PI/(time * 20));
        orbitY += newPos / time * 0;
        orbitZ -= newPos / time;
    } else if (j < time * 20) {
        orbitX = 2*Math.cos(j*2*Math.PI/(time * 20));
        orbitY += newPos / time * 0;
        orbitZ += newPos / time;
    }
    // Needed Transformations.
    ctm = mat4();

    ctm = mult(ctm, modelViewMatrix);
    ctm = mult(ctm, translate(0, 0, 0));
    //ctm = mult(ctm, rotateX(theta2));
    ctm = mult(ctm, rotateY(theta2));
    //ctm = mult(ctm, rotateZ(theta2));

    ctm = mult(ctm, scalem(0.75, 0.75, 0.75));
    
    // Final matrixes for earth.
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    
    
    gl.uniform4fv(gl.getUniformLocation(program,
        "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);

    for (var i = 0; i < index; i += 3) {
        gl.drawArrays(gl.TRIANGLES, i, 3);
    }

    // Needed Transformations.
    ctm = mat4();

    ctm = mult(ctm, modelViewMatrix);

    //ctm = mult(ctm, translate(-2.5, 0, 0));
    ctm = mult(ctm, translate(orbitX, orbitY, orbitZ));
    //ctm = mult(ctm, rotateX(theta2));
    ctm = mult(ctm, rotateY(theta2));
    //ctm = mult(ctm, rotateZ(theta2));

    ctm = mult(ctm, scalem(0.18, 0.18, 0.18));



    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));


    // Final matrixes for moon.
    

    ambientProduct = mult(lightAmbient, materialAmbient2);
    diffuseProduct = mult(lightDiffuse, materialDiffuse2);
    specularProduct = mult(lightSpecular, materialSpecular2);

    gl.uniform4fv(gl.getUniformLocation(program,
        "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);

    for (var i = 0; i < index; i += 3) {
        gl.drawArrays(gl.TRIANGLES, i, 3);
    }

    j++;
    window.requestAnimFrame(render);
}
