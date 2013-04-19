if (typeof glUtils === 'undefined') {
    glUtils = {};
}

glUtils.SHADER_UTILS = true;
glUtils.vshaders = {};
glUtils.fshaders = {};
glUtils.shaders = {
    vshaders : glUtils.vshaders,
    fshaders : glUtils.fshaders,
    config : {}
}
glUtils.getShader = function (id) {
    
    var shaderScript = document.getElementById(id);
    if (shaderScript) {
        var shader;
        if (shaderScript.type === "x-shader/x-fragment") {  
            shader = glUtils.gl.createShader(glUtils.gl.FRAGMENT_SHADER); 
            glUtils.fshaders[id] = shader; 
        } else if (shaderScript.type === "x-shader/x-vertex") {  
            shader = glUtils.gl.createShader(glUtils.gl.VERTEX_SHADER);  
            glUtils.vshaders[id] = shader;
        } else {  
            return null;  // Unknown shader type  
        }
        
        glUtils.gl.shaderSource(shader, shaderScript.text);
        glUtils.gl.compileShader(shader);
        if (! glUtils.gl.getShaderParameter(shader, glUtils.gl.COMPILE_STATUS)) {
            console.error('Failed to compile shader ' + id + ':' + glUtils.gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
        
    } else {
        return null;
    }
}

glUtils.initShaders = function (shaders) {
    
    glUtils.shaderProgram = glUtils.gl.createProgram();
    var n = shaders.length;
    for (var i = 0; i < n; i++) {
        var shader = glUtils.getShader(shaders[i]);
        glUtils.gl.attachShader(glUtils.shaderProgram, shader);
    }
    glUtils.gl.linkProgram(glUtils.shaderProgram);
    
    if (! glUtils.gl.getProgramParameter(glUtils.shaderProgram, glUtils.gl.LINK_STATUS)) {
        console.error('LINK_STATUS: '+glUtils.gl.LINK_STATUS+', unable to init the shader program.\n'+glUtils.gl.getProgramInfoLog(glUtils.shaderProgram));
    }
    
    glUtils.gl.useProgram(glUtils.shaderProgram);
}