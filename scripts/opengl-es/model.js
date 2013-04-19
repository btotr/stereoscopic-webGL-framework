if (typeof glUtils === 'undefined') {
    glUtils = {};
}
/**
 *  Gets all the textures used in our blender models
 *
 *  @return Array an array of our blender textures
 *  @since  Wed Sep  8 01:04:42 PDT 2010
 */
glUtils.gatherTextureFilenames = function (bmodObj) {
    var texs = {};
    
    for (var modelName in bmodObj) {
        var n = bmodObj[modelName].faces.length;
        for (var i = 0; i < n; i++) {
            var texName = bmodObj[modelName].faces[i].texture;
            texs[texName] = true;
        }
    }
    
    var textures = [];
    for (var tex in texs) {
        textures.push(tex);
    }
    return textures;
};
/**
 *  Gets all the vertices (geom and uv) as flat arrays
 *
 *  @param  Object the model object
 *  @return Object two arrays
 *  @since  Sat Sep 11 12:10:39 PDT 2010
 */
glUtils.gatherFlatVertices = function (model, frame) {
    var vertices = [];
    var uvs = [];
    var normals = [];
    var n = model.faces.length;
    for (var i = 0; i < n; i++) {
        var face = model.faces[i];
        var o = face.verts[0].length;
        for (var j = 0; j < o; j++) {
            var vertex = face.verts[frame][j];
            vertices = vertices.concat(vertex);
            // for every vertex we have a normal
            normals = normals.concat(face.normal);
        }
        var p = face.uvs.length;
        for (var k = 0; k < p; k++) {
            var uv = face.uvs[k];
            uvs = uvs.concat(uv);
        }
    }
    return {
        verts : vertices,
        uvs : uvs, 
        normals : normals
    };
};
/**
 *  Loads up an exported model with vertex and tex buffers
 *
 *  @param  Object the model
 *  @return Object the model
 *  @since  Sat Sep 11 12:11:53 PDT 2010
 */
glUtils.attachBuffersToModel = function (model, options) {
    options = options || {};
    for (var option in options) {
        model[option] = options[option];
    }
    
    // first frame
    var points = glUtils.gatherFlatVertices(model, 0);
	
    var verticesBuffer = glUtils.gl.createBuffer();
    glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER, verticesBuffer);
    glUtils.gl.bufferData(glUtils.gl.ARRAY_BUFFER, 
        new Float32Array(points.verts), glUtils.gl.STATIC_DRAW);
        
    var normalsBuffer = glUtils.gl.createBuffer();
    glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER, normalsBuffer);
    glUtils.gl.bufferData(glUtils.gl.ARRAY_BUFFER, 
        new Float32Array(points.normals), glUtils.gl.STATIC_DRAW);
	
	var textureBuffer = glUtils.gl.createBuffer();
	glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER, textureBuffer);
	glUtils.gl.bufferData(glUtils.gl.ARRAY_BUFFER, 
		new Float32Array(points.uvs), glUtils.gl.STATIC_DRAW);
		
    var vertexIndexBuffer = glUtils.gl.createBuffer();
    glUtils.gl.bindBuffer(glUtils.gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    var vertexIndices = [];    
    vertices = [];
    
    for (var i = 0, fl=blenderScene.models.Cube.faces.length; i < fl; i++)
        for (var j = 0, l=blenderScene.models.Cube.faces[0].verts[0].length; j < l; j++)
            vertices = vertices.concat(blenderScene.models.Cube.faces[i].verts[0][j]);  
    for (var i=0,l=vertices.length;i<l;i++) 
        vertexIndices.push(i);
    glUtils.gl.bufferData(glUtils.gl.ELEMENT_ARRAY_BUFFER, 
        new Uint16Array(vertexIndices), glUtils.gl.STATIC_DRAW);

		
	model.vertexBuffer = verticesBuffer;
	model.normalBuffer = normalsBuffer;
	model.textureBuffer = textureBuffer;
	model.vertexIndexBuffer = vertexIndexBuffer;
	model.vertexIndexItems = vertices.length/3
	model.numPoints = points.verts.length/3;
	
	return model;
};
/**
 *  Transmogs all the models in a scene (destructive)
 *
 *  @param  Object the scene
 *  @return Object the scene
 *  @since  Sat Sep 11 12:12:39 PDT 2010
 */
glUtils.attachBuffersToModels = function (scene) {
    for (var name in scene.models) {
        scene.models[name] = glUtils.attachBuffersToModel(scene.models[name], {drawMode:'TRIANGLES'});
    }
    return scene;
};
/**
 *  Draws a model to the webgl context
 *
 *  @param  Object the model
 *  @since  Sat Sep 11 12:22:46 PDT 2010
 */
glUtils.drawModel = function (model) {

    // vertices
    
    glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER, model.vertexBuffer);
    glUtils.gl.vertexAttribPointer(glUtils.shaderProgram.vertexPositionAttribute, 3, glUtils.gl.FLOAT, false, 0, 0);
    
    vertices = [];
    for (var i = 0, fl=blenderScene.models.Cube.faces.length; i < fl; i++)
        for (var j = 0, l=blenderScene.models.Cube.faces[0].verts[0].length; j < l; j++)
            vertices = vertices.concat(blenderScene.models.Cube.faces[i].verts[glUtils.frameCount][j]);
    glUtils.gl.bufferData(glUtils.gl.ARRAY_BUFFER, new Float32Array(vertices), glUtils.gl.STATIC_DRAW);

    // texture
    var textureName = model.faces[0].texture;
    if (textureName != 'null') {
        glUtils.gl.uniform1i(glUtils.shaderProgram.texturedUniform, true);
        var textureSrc = 'blender/textures/'+textureName;
       // glUtils.gl.activeTexture(glUtils.storedTexturesBySrc[textureSrc]);
        glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D, glUtils.storedTexturesBySrc[textureSrc]);
        glUtils.gl.uniform1i(glUtils.shaderProgram.samplerUniform, 0); 
        // set lighting
        glUtils.gl.uniform1i(glUtils.shaderProgram.lightingUniform, glUtils.shaders.config.useLighting);  
    } else {
        glUtils.gl.uniform1i(glUtils.shaderProgram.texturedUniform, false);
        // set lighting
        glUtils.gl.uniform1i(glUtils.shaderProgram.lightingUniform, false);
    }
    
    glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER, model.textureBuffer);
    glUtils.gl.vertexAttribPointer(glUtils.shaderProgram.textureCoordAttribute, 2, glUtils.gl.FLOAT, false, 0, 0);
    glUtils.gl.bindBuffer(glUtils.gl.ARRAY_BUFFER, model.normalBuffer);
    glUtils.gl.vertexAttribPointer(glUtils.shaderProgram.normalAttribute, 3, glUtils.gl.FLOAT, false, 0, 0);
    //glUtils.multMatrix($M(model.matrix_local));
    glUtils.gl.bindBuffer(glUtils.gl.ELEMENT_ARRAY_BUFFER, model.vertexIndexBuffer);    
    glUtils.setMatrixUniforms();
    glUtils.gl.drawElements(glUtils.gl[model.drawMode], model.vertexIndexItems, glUtils.gl.UNSIGNED_SHORT, 0);

};
/**
 *  Draws all the models in a scene
 *
 *  @since  Sat Sep 11 16:17:18 PDT 2010
 */
glUtils.drawModels = function (models) {
    for (var modelName in models) {
        glUtils.drawModel(models[modelName]);
    }
};