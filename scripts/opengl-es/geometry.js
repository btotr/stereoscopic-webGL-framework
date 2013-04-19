if (typeof efnxUtils === 'undefined') {
    efnxUtils = {};
}
/**
 *  A point
 *
 *  @param  float x - x coord
 *  @param  float y - y coord
 *  @param  float z - z coord
 *  @return object point - the point object
 *  @since  Fri Aug 20 11:59:38 PDT 2010
 */
efnxUtils.point = function (x, y, z) {
    x = dfault(x, 0);
    y = dfault(y, 0);
    z = dfault(z, 0);
    
    function toArray () {
        return [x, y, z];
    }
    
    return {
        x : x,
        y : y,
        z : z,
        toArray : toArray
    };
}
/**
 *  A list of points, accepts any number of points or an array of vertices.
 *
 *  @since  Fri Aug 20 12:29:00 PDT 2010
 */
efnxUtils.pointList = function () {
    var args = Array.prototype.slice.call(arguments);
    var list = [];
    
    if (args[0] instanceof Array) {
        var n = args[0].length;
        for (var i = 0; i < n; i+=3) {
            list.push( this.point(args[0][i], args[0][i+1], args[0][i+2]) );
        }
    } else {
        list = args;
    }
    
    list.toArray = function () {
        var n = list.length;
        var a = [];
        for (var i = 0; i < n; i++) {
            if ('toArray' in list[i]) {
                a = a.concat(list[i].toArray());
            } else {
                throw 'pointList: element ' + list[i] + ' is not a point';
            }
        }
        return a;
    }
    
    list.combine = function (suffix) {
        var points = this.concat(suffix);
        return efnxUtils.pointList.apply(efnxUtils, points);
    }
    
    return list;
}
/**
 *  Four points on a square, clockwise from upper right.
 *
 *  @since  Wed Aug 25 13:29:00 PDT 2010
 */
efnxUtils.square = function () {
    var args = Array.prototype.slice.call(arguments);
    if (args.length > 0) {
        list = this.pointList();
        var n = args.length;
        for (var i = 0; i < n; i++) {
            list.push(args[i]);
        }
    } else {
        list = this.pointList(
            this.point( 1,  1, 1),
            this.point( 1, -1, 1),
            this.point(-1, -1, 1),
            this.point(-1,  1, 1)
        );
    }
    
    list.trianglePoints = function () {
        return efnxUtils.pointList(
            this[0], this[1], this[2],
            this[2], this[3], this[0]
        );
    }
    
    list.texturePoints = function () {
        return efnxUtils.pointList(
            1, 1,
			1, 0,
			0, 0,
			
			0, 0,
			0, 1,
			1, 1
        );
    }
    
    list.reflect = function (x, y, z) {
        
        x = typeof x == 'undefined' ? 1 : x;
        y = typeof y == 'undefined' ? 1 : y;
        z = typeof z == 'undefined' ? 1 : z;
        
        return efnxUtils.square(
            efnxUtils.point(this[0].x * x, this[0].y * y, this[0].z * z),
            efnxUtils.point(this[1].x * x, this[1].y * y, this[1].z * z),
            efnxUtils.point(this[2].x * x, this[2].y * y, this[2].z * z),
            efnxUtils.point(this[3].x * x, this[3].y * y, this[3].z * z)
        );
    }
    
    list.translate = function (x, y, z) {
        return efnxUtils.square(
            efnxUtils.point(this[0].x + x, this[0].y + y, this[0].z + z),
            efnxUtils.point(this[1].x + x, this[1].y + y, this[1].z + z),
            efnxUtils.point(this[2].x + x, this[2].y + y, this[2].z + z),
            efnxUtils.point(this[3].x + x, this[3].y + y, this[3].z + z)
        );
    }
    
    return list;
} 
/**
 *  A cuuuuuube
 *
 *  @since  Wed Aug 25 14:07:22 PDT 2010
 */
efnxUtils.cube = function () {
    var front = efnxUtils.square();
    var back = front.reflect(-1, 1, 1).translate(0, 0, -2);
    var right = efnxUtils.square(back[3], back[2], front[1], front[0]);
    var left = efnxUtils.square(front[3], front[2], back[1], back[0]);
    var top = efnxUtils.square(back[3], front[0], front[3], back[0]);
    var bottom = efnxUtils.square(front[1], back[2], back[1], front[2]);
    var textures = [0, 0, 0, 0, 0, 0]
    var quads = [front, back, right, left, top, bottom];
    
    var list = front.combine(back);
    
    list.trianglePoints = function () {
        var n = quads.length;
        var points = efnxUtils.pointList();
        for (var i = 0; i < n; i++) {
            points = points.combine(quads[i].trianglePoints());
        }
        return points;
    }
    
    list.texturePoints = function () {
        var n = quads.length;
        var points = efnxUtils.pointList();
        for (var i = 0; i < n; i++) {
            points = points.combine(quads[i].texturePoints());
        }
            return points;
    }
    
    list.texturize = function (f, bk, r, l, t, bt) {
        switch (arguments.length) {
            case 0:
                textures = [0, 0, 0, 0, 0, 0];
            break;
                
            case 1:
                textures = [f, f, f, f, f, f];
            break;
            
            case 2:
                textures = [f, bk, f, bk, f, bk];
            break;
            
            case 3:
                textures = [f, bk, r, f, bk, r];
            break;
            
            case 6:
                textures = [f, bk, r, l, t, bt];
            break;
            
            default:
                throw "Error: efnxUtils.cube.texturize takes 0, 1, 2, 3 or 6 args";
        }
        return this;
    }
    
    return list;
}
