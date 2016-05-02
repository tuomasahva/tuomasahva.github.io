var RenderFragment = function () {

	var dom = document.createElement( 'div' );
	dom.style.position = 'absolute';

	var renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	dom.appendChild( renderer.domElement );

	//


	var camera = new THREE.OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, 0, 1 );

	var scene = new THREE.Scene();

	var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
	var material = new THREE.ShaderMaterial( {
		uniforms: {
			time: { type: "f", value: 0 },
			resolution: { type: "v2", value: new THREE.Vector2() },
			tFFT: { type: "t", value: null },
		}
	} );
	var mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	//

	function resize() {

		var width = dom.clientWidth;
		var height = dom.clientHeight;

		material.uniforms.resolution.value.set( width, height );

		// renderer.setClearColor( 0xffffff * Math.random() );
		renderer.setSize( width, height );

	}

	function render() {

		var time = performance.now() / 1000;

		material.uniforms.time.value = time;

		renderer.render( scene, camera );

	}

	return {
		dom: dom,
		resize: resize,
		render: render,
		setRenderShader: function ( shader ) {

			material.vertexShader = shader.vertex;
			material.fragmentShader = shader.fragment;
			material.needsUpdate = true;

		},
		setAudioTexture: function( t ) {

			material.uniforms.tFFT.value = t;

		}
	};

};
