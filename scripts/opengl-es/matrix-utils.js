if (typeof glUtils === 'undefined') {
    glUtils = {};
}
/**
 *  Tao - one full turn around a circle
 *
 *  @var float
 */
glUtils.TAO = 6.28318531;
/**
 *  One degree in terms of TAO
 *
 *  @var float
 */
glUtils.ONE_DEGREE = glUtils.TAO/360;
/**
 *  Inits our matrices
 *
 *  @since  Fri Sep 17 15:38:58 PDT 2010
 */
glUtils.initGL = function (ctx) {
    glUtils.gl = ctx;
    glUtils.MATRIX_UTILS = true;
    glUtils.perspectiveMatrix = {};
    glUtils.mvMatrix = {}; 
    glUtils.mvMatrixStack = [];
    glUtils.pointSize = 1.0;
    glUtils.VERTEX_PROGRAM_POINT_SIZE = 0x8642;
}
/**
 *  Pushes the current matrix onto the stack, to be used later
 *
 *  @param  param desc
 *  @return type desc
 *  @author Schell Scivally
 *  @since  Tue Apr  6 14:29:12 PDT 2010
 */
glUtils.mvPushMatrix = function (m) {
    if (m) {
        glUtils.mvMatrixStack.push(m.dup());
        glUtils.mvMatrix = m.dup();
    } else {
        glUtils.mvMatrixStack.push(glUtils.mvMatrix.dup());
    }
}

glUtils.mvPopMatrix = function (m) {
    if (! glUtils.mvMatrixStack.length) {
        console.error('Cannot pop matrix. Matrix stack is empty.');
    }
    
    glUtils.mvMatrix = glUtils.mvMatrixStack.pop();
    return glUtils.mvMatrix;
}

glUtils.loadIdentity = function () {
  glUtils.mvMatrix = Matrix.I(4);
}

glUtils.multMatrix = function (m) {
  glUtils.mvMatrix = glUtils.mvMatrix.x(m);
}

glUtils.mvTranslate = function (v) {
  glUtils.multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

glUtils.mvRotate = function (angle, v) {
    var inRads = angle * Math.PI / 180;
    var m = Matrix.Rotation(inRads, $V([v[0], v[1], v[2]])).ensure4x4();
    glUtils.multMatrix(m);
}

glUtils.setMatrixUniforms = function () {
  var pUniform = glUtils.gl.getUniformLocation(glUtils.shaderProgram, "uPMatrix");
  glUtils.gl.uniformMatrix4fv(pUniform, false, new Float32Array(glUtils.perspectiveMatrix.flatten()));

  var mvUniform = glUtils.gl.getUniformLocation(glUtils.shaderProgram, "uMVMatrix");
  glUtils.gl.uniformMatrix4fv(mvUniform, false, new Float32Array(glUtils.mvMatrix.flatten()));
  
  var nUniform = glUtils.gl.getUniformLocation(glUtils.shaderProgram, "uNMatrix");
  var normalMatrix = glUtils.mvMatrix.inverse();
  normalMatrix = normalMatrix.transpose();
  glUtils.gl.uniformMatrix4fv(nUniform, false, new Float32Array(normalMatrix.flatten()));
}

glUtils.setPointSize = function () {
    var pUniform = glUtils.gl.getUniformLocation(glUtils.shaderProgram, "pointSize");
    glUtils.gl.uniform1f(pUniform, glUtils.pointSize)
}      

glUtils.matrixToString = function (m) {
    if(m.length) {
        m = $M(m);
    }
    var s = '[';           
    var ylen = m.elements.length;
    for (var y = 0; y < ylen; y++) {
        s += y == 0 ? '[' : '],\n [';   
        var xlen = m.elements[y].length;
        for (var x = 0; x < xlen; x++) {
            s += x == 0 ? '' : ', ';
            s += m.elements[y][x].toFixed(3);
        }
    }
    s += ']]';
    return s;
}

glUtils.moveMatrixBackward = function (matrix, amount) {
    amount = amount || 1;
    if (matrix.length) {
        matrix = $M(matrix);
    }
    var u = matrix.out().flatten();
    var x = matrix.elements[0][3] + (u[0] * amount);
    var y = matrix.elements[1][3] + (u[1] * amount);
    var z = matrix.elements[2][3] + (u[2] * amount);
    
    var newmat = $M(matrix.elements);
    newmat.elements[0][3] = x;
    newmat.elements[1][3] = y;
    newmat.elements[2][3] = z;
    return newmat;
}

glUtils.moveMatrixForward = function (matrix, amount) {
    amount = amount || 1;
    if (matrix.length) {
        matrix = $M(matrix);
    }
    return glUtils.moveMatrixBackward(matrix, -amount);
}

glUtils.moveMatrixUp = function (matrix, amount) {
    amount = amount || 1;
    if (matrix.length) {
        matrix = $M(matrix);
    }
    var newmat = $M(matrix.elements);
    var u = matrix.up().flatten();
    newmat.elements[0][3] += u[0] * amount;
    newmat.elements[1][3] += u[1] * amount;
    newmat.elements[2][3] += u[2] * amount;
    return newmat;
}

glUtils.moveMatrixDown = function (matrix, amount) {
    amount = amount || 1;
    if (matrix.length) {
        matrix = $M(matrix);
    }
    return glUtils.moveMatrixUp(matrix, -amount);
}

glUtils.moveMatrixRight = function (matrix, amount) {
    amount = amount || 1;
    if (matrix.length) {
        matrix = $M(matrix);
    }
    var newmat = $M(matrix.elements);
    var u = matrix.right().flatten();
    newmat.elements[0][3] += u[0] * amount;
    newmat.elements[1][3] += u[1] * amount;
    newmat.elements[2][3] += u[2] * amount;
    return newmat;
}

glUtils.moveMatrixLeft = function (matrix, amount) {
    amount = amount || 1;
    if (matrix.length) {
        matrix = $M(matrix);
    }
    return glUtils.moveMatrixRight(matrix, -amount);
}

glUtils.spinMatrixLeft = function (matrix, amount) {
    amount = amount || glUtils.ONE_DEGREE;
    if (matrix.length) {
        matrix = $M(matrix);
    }
    var newmat = $M(matrix.elements);
    var rotation = Matrix.Rotation(amount, $V([0, 1, 0])).ensure4x4();
    return newmat.x(rotation);
}

glUtils.spinMatrixRight = function (matrix, amount) {
    amount = amount || glUtils.ONE_DEGREE;
    if (matrix.length) {
        matrix = $M(matrix);
    }
    return glUtils.spinMatrixLeft(matrix, -amount);
}

glUtils.spinMatrixUp = function (matrix, amount) {
    amount = amount || glUtils.ONE_DEGREE;
    if (matrix.length) {
        matrix = $M(matrix);
    }
    var newmat = $M(matrix.elements);
    var rotation = Matrix.Rotation(amount, $V([1, 0, 0])).ensure4x4();
    return newmat.x(rotation);
}

glUtils.spinMatrixDown = function (matrix, amount) {
    amount = amount || glUtils.ONE_DEGREE;
    if (matrix.length) {
        matrix = $M(matrix);
    }
    return glUtils.spinMatrixUp(matrix, -amount);
}

glUtils.spinMatrixClockwise = function (matrix, amount) {
    amount = amount || glUtils.ONE_DEGREE;
    if (matrix.length) {
        matrix = $M(matrix);
    }
    var newmat = $M(matrix.elements);
    var rotation = Matrix.Rotation(amount, $V([0, 0, 1])).ensure4x4();
    return newmat.x(rotation);
}

glUtils.spinMatrixCounterClockwise = function (matrix, amount) {
    amount = amount || glUtils.ONE_DEGREE;
    if (matrix.length) {
        matrix = $M(matrix);
    }
    return glUtils.spinMatrixClockwise(matrix, -amount);
}

