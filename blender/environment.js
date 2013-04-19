blenderScene = {
    models : {},
    cameras : {},
    lamps : {}
};
// TODO in export script
blenderScene.lamps.Sun = function () {
    return {
        name : 'Sun', 
        location : [7.41127872467, -18.985452652, 8.91568565369],
        rotation_euler : [0.683919727802, 0.491136789322, 0.0],
        // Local matrix
        matrix_local : [[0.88179731369, 0.297991961241, 0.365560293198, 7.41127872467],
                        [0.0, 0.775102078915, -0.631836056709, -18.985452652],
                        [-0.471628606319, 0.557151317596, 0.683482885361, 8.91568565369],
                        [0.0, 0.0, 0.0, 1.0]],
        // World matrix
        matrix_world : [[0.88179731369, 0.297991961241, 0.365560293198, 7.41127872467],
                        [0.0, 0.775102078915, -0.631836056709, -18.985452652],
                        [-0.471628606319, 0.557151317596, 0.683482885361, 8.91568565369],
                        [0.0, 0.0, 0.0, 1.0]],
        // Light color
        color : [1.0, 1.0, 1.0],
        // Falloff distance - the light is at half the original intensity at this point
        distance : 25.0,
        // Amount of light that the lamp emits
        energy : 1.0,
        // Type of Lamp (enum in ['POINT', 'SUN', 'SPOT', 'HEMI', 'AREA'], default 'POINT')
        type : 'SUN',
        // Lamp does diffuse shading
        use_diffuse : true,
        // Lamp casts negative light
        use_negative : false,
        // Lamp creates specular highlights
        use_specular : true
    }
}();