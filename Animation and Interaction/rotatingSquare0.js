
var canvas;
var gl;

var theta = 0.0;
var program;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    render();
};


function render() 
{
    
	var rotatedVertices = [];
	
    theta += 0.1;
	rotatedVertices.push(vec2(-Math.sin(theta), Math.cos(theta)));
	rotatedVertices.push(vec2(Math.cos(theta), Math.sin(theta)));
	rotatedVertices.push(vec2(-Math.cos(theta), -Math.sin(theta)))
	rotatedVertices.push(vec2(Math.sin(theta), -Math.cos(theta)));
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(rotatedVertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    gl.clear( gl.COLOR_BUFFER_BIT );


    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    setTimeout(function (){requestAnimFrame(render);}, 600);
	//requestAnimFrame(render);
	//setInterval(render, 60);
	
	//render();
}    
