    //face #$iface
    face = {};
    face.texture = '$texture';
    face.verts = [];
    face.uvs = [];
    face.normal = [
    	$nx,
    	$ny,
    	$nz
    ];
$vertexcode
    face.uvs.push([$t1u, $t1v]);
    face.uvs.push([$t2u, $t2v]);
    face.uvs.push([$t3u, $t3v]);
    faces.push(face);
