if (typeof glUtils === 'undefined') {
    glUtils = {};
}

glUtils.TEXTURE_UTILS = true;
glUtils.storedTextures = [];
glUtils.storedTexturesBySrc = {};
glUtils.loadingTextures = 0;

glUtils.handleLoadedTexture = function (texture) {
	glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D, texture);
	glUtils.gl.pixelStorei(glUtils.gl.UNPACK_FLIP_Y_WEBGL, true);
	glUtils.gl.texImage2D(glUtils.gl.TEXTURE_2D, 0, glUtils.gl.RGBA, glUtils.gl.RGBA, glUtils.gl.UNSIGNED_BYTE, texture.image);
	glUtils.gl.texParameteri(glUtils.gl.TEXTURE_2D, glUtils.gl.TEXTURE_MAG_FILTER, glUtils.gl.NEAREST);
	glUtils.gl.texParameteri(glUtils.gl.TEXTURE_2D, glUtils.gl.TEXTURE_MIN_FILTER, glUtils.gl.NEAREST);
	glUtils.gl.bindTexture(glUtils.gl.TEXTURE_2D, null);
}

glUtils.texture = function (src, callback) {
    if (src === null) {
        return null;
    }
	var texture = glUtils.gl.createTexture();
	texture.image = new Image();
	texture.image.onload = function() {
		glUtils.handleLoadedTexture(texture);
		if (--glUtils.loadingTextures == 0 && typeof callback == 'function') {
		    callback();
		}
	}
	texture.image.src = src;
	glUtils.loadingTextures++;
	return texture;
}

glUtils.loadTextures = function (textures, callback, prefix) {
    prefix = prefix || '';
    var n = textures.length;
    for (var i = 0; i < n; i++) {
        if (textures[i] == 'null') {
            continue;
        }
        var texName = prefix + textures[i];
        var texture = glUtils.texture(texName, callback);
        glUtils.storedTextures.push(texture);
        glUtils.storedTexturesBySrc[texName] = texture;
    }
    if (glUtils.storedTextures.length == 0) {
        callback();
    }
}