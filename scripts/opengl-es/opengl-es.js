function OpenGlEs() {
    var map = [];
    
    var gl, drawMode, verticesBuffer, textureBuffer, timer = 0;
    var rotation = [0, 0, 0];
    var lastPoint = [0, 0]; 
    var points;

    var dirFlag = 1;
    var self = this;
    
    this.init = function(width, height) {
        
        stage = document.createElement('canvas')
        stage.id = 'stage';
        width = width || 100
        height = height || 100
        stage.setAttribute('width', width);
        stage.setAttribute('height', height);
        stage.innerHTML = 'Your browser does not support webgl';
        
        document.body.insertBefore(stage, document.body.firstChild);
        
        camera = new Camera(1);
        
        display = new Display(width, height);
        
        self.initGL();
        glUtils.frameCount = 0;
        self.initShaders();
        self.initBuffers();
		self.initTextures(function () {
		    setInterval(function(){
		        self.drawScene(width, height)
		    }, 48); //TODO blenderScene.cameras.Camera.fps*2
		});
    }
    
    this.initGL = function() {
        try {
            gl = stage.getContext('experimental-webgl');
            gl.clearColor(0, 0, 0, 0);
            gl.clearDepth(1.0);
		    gl.enable(gl.DEPTH_TEST);
		    gl.enable(gl.BLEND);
		    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		    
        } catch(e) {
            console.error('Could not get webgl context.');
        }
        
        if (! gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
        
		glUtils.initGL(gl);
		
        rotation = [35, -45, 0];
    }
    
    this.initShaders = function() {    
        glUtils.initShaders([
            'fragment_shader',
            'vertex_shader'
        ]);
		// varying atts
        glUtils.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(glUtils.shaderProgram, 'aVertexPosition');
        gl.enableVertexAttribArray(glUtils.shaderProgram.vertexPositionAttribute);
		glUtils.shaderProgram.textureCoordAttribute = gl.getAttribLocation(glUtils.shaderProgram, 'aTextureCoord');
		gl.enableVertexAttribArray(glUtils.shaderProgram.textureCoordAttribute);
		glUtils.shaderProgram.normalAttribute = gl.getAttribLocation(glUtils.shaderProgram, 'aVertexNormal');
		gl.enableVertexAttribArray(glUtils.shaderProgram.normalAttribute);
		// uniforms
		glUtils.shaderProgram.texturedUniform = gl.getUniformLocation(glUtils.shaderProgram, 'uTextured');
		glUtils.shaderProgram.samplerUniform = gl.getUniformLocation(glUtils.shaderProgram, 'uSampler');
		glUtils.shaderProgram.lightingUniform = gl.getUniformLocation(glUtils.shaderProgram, 'uLighting');
		glUtils.shaderProgram.ambientColorUniform = gl.getUniformLocation(glUtils.shaderProgram, 'uAmbientColor');
		glUtils.shaderProgram.sunColorUniform = gl.getUniformLocation(glUtils.shaderProgram, 'uSunColor');
		glUtils.shaderProgram.sunDirectionUniform = gl.getUniformLocation(glUtils.shaderProgram, 'uSunDir');
    }
    
    this.initBuffers = function() {
		blenderScene = glUtils.attachBuffersToModels(blenderScene);
    }

	this.initTextures = function(callback) {
	    var textures = glUtils.gatherTextureFilenames(blenderScene.models);
		glUtils.loadTextures(textures, callback, 'blender/textures/');
	}
	
    this.drawScene = function() {
         gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

         var disparity = 0;
         var interaxialShift = 0;

         if (camera.mode != "cyclopean-eye-view") {
             disparity = 0.5 * camera.interaxialSeparation * display.zNear / camera.focalLength;
             interaxialShift = camera.interaxialSeparation / 2;
         }

         // animation
         glUtils.frameCount += dirFlag
         if (glUtils.frameCount == blenderScene.models.Cube.faces[0].verts.length - 1)  glUtils.frameCount = 0; //dirFlag = -1; 
         //else if (glUtils.frameCount == 0) dirFlag = 1;
         
         // light
         var sun = blenderScene.lamps.Sun;
         glUtils.shaders.config.useLighting = true;
         var sunDir = $V(sun.rotation_euler).toUnitVector().flatten();
         var sunColor = sun.color;
         var ambientColor = [1.0,1.0,1.0];

         glUtils.gl.uniform3f(glUtils.shaderProgram.sunColorUniform, sunColor[0], sunColor[1], sunColor[2]);
         if (camera.mode != "anaglyph") glUtils.gl.uniform3f(glUtils.shaderProgram.ambientColorUniform, ambientColor[0], ambientColor[1], ambientColor[2]);
         glUtils.gl.uniform3f(glUtils.shaderProgram.sunDirectionUniform, sunDir[0], sunDir[1], sunDir[2]);

         // left
         if (camera.mode == "sideBySide") gl.viewport(0, 0, display.width/2, display.height);
         if (camera.mode == "anaglyph") glUtils.gl.uniform3f(glUtils.shaderProgram.ambientColorUniform, 1.0, 0.0, 0.0);
         glUtils.perspectiveMatrix = makeFrustum( -display.aspectRatio * display.center + disparity, 
                                display.aspectRatio * display.center + disparity, 
                                -display.center, 
                                display.center, 
                                display.zNear, 
                                display.zFar);
         glUtils.mvMatrix = makeLookAt( -interaxialShift, 0, camera.focalLength,
                                -interaxialShift, 0, camera.focalLength-1, 0, 1, 0);
         // Blender cam to mv matrix
         glUtils.mvTranslate([0.0, 0.0, blenderScene.cameras.Camera.dof_distance])
         glUtils.multMatrix($M(blenderScene.cameras.Camera.matrix_world).inv());
        
         
         
         // draw models
         glUtils.drawModels(blenderScene.models);
         
         if (camera.mode == "cyclopean-eye-view") return 
         
         // right 
         if (camera.mode == "sideBySide") gl.viewport(display.width/2, 0, display.width/2, display.height);
         if (camera.mode == "anaglyph") glUtils.gl.uniform3f(glUtils.shaderProgram.ambientColorUniform, 0.0, 1.0, 1.0);
         glUtils.perspectiveMatrix = makeFrustum( -display.aspectRatio * display.center - disparity, 
                                display.aspectRatio * display.center - disparity, 
                                -display.center, 
                                display.center, 
                                display.zNear, 
                                display.zFar);           
         glUtils.mvMatrix = makeLookAt( interaxialShift, 0, camera.focalLength, 
                                interaxialShift, 0, camera.focalLength-1, 0, 1, 0);

         glUtils.mvTranslate([0.0, 0.0, blenderScene.cameras.Camera.dof_distance])
         glUtils.multMatrix($M(blenderScene.cameras.Camera.matrix_world).inv());                       
         glUtils.drawModels(blenderScene.models);
    }


    function Camera(mode) {
        var modes  = ["anaglyph", "sideBySide", "cyclopean-eye-view"]
        if (mode === undefined) mode = 2;
        this.mode = modes[mode];
        // TODO why - blenderScene.cameras.Camera.location[0] ?
        this.focalLength = blenderScene.cameras.Camera.dof_distance - blenderScene.cameras.Camera.location[0];
        this.aperture = blenderScene.cameras.Camera.lens;
        this.interaxialSeparation = 1.2;
    }

    function Display(width, height) {
        var DEG2RAD = Math.PI / 180.0;
        var radians = DEG2RAD * camera.aperture / 2;
        this.zFar = blenderScene.cameras.Camera.clip_end;
        this.zNear = blenderScene.cameras.Camera.clip_start;
        this.aspectRatio = width / height;
        if (camera.mode == "side-by-side") this.aspectRatio / 2;
        this.center = this.zNear * Math.tan(radians);
        this.width = width;
        this.height = height;
    }
    
};