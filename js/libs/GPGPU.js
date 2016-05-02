/**
 * @author mrdoob / http://www.mrdoob.com
 */

var GPGPU = function ( renderer ) {

	var camera = new THREE.OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, 0, 1 );

	var scene = new THREE.Scene();

	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1 ) );
	scene.add( mesh );

	this.pass = function ( material, renderTarget ) {

		mesh.material = material;
		renderer.render( scene, camera, renderTarget, false );

	};

	this.out = function ( shader ) {

		mesh.material = shader.material;
		renderer.render( scene, camera );

	};

};
