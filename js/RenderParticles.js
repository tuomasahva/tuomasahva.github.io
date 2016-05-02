var RenderParticles = function () {

	var dom = document.createElement( 'div' );
	dom.style.position = 'absolute';

	var renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	dom.appendChild( renderer.domElement );

	//

	var camera = new THREE.PerspectiveCamera( 50, 1, 0.01, 1000 );
	camera.position.z = 50;

	var controls;

	controls = new THREE.TrackballControls( camera, renderer.domElement );

	setTimeout( function () {

		// HACK Renderer is not in the dom yet

		controls = new THREE.TrackballControls( camera, renderer.domElement );

	}, 0 );

	var scene = new THREE.Scene();

	// gpgpu

	var geometry = new THREE.IcosahedronGeometry( 15, 4 );

	var size = 512;
	var data = new Float32Array( size * size * 4 );

	var point = new THREE.Vector3();
	var facesLength = geometry.faces.length;

	for ( var i = 0, l = data.length; i < l; i += 4 ) {

		var point = geometry.vertices[ Math.floor( Math.random() * geometry.vertices.length ) ];

		data[ i ] = point.x;
		data[ i + 1 ] = point.y;
		data[ i + 2 ] = point.z;
		data[ i + 3 ] = Math.random();

	}

	var gpgpu = new GPGPU( renderer );

	//

	var originsTexture = new THREE.DataTexture( data, size, size, THREE.RGBAFormat, THREE.FloatType );
	originsTexture.minFilter = THREE.NearestFilter;
	originsTexture.magFilter = THREE.NearestFilter;
	originsTexture.generateMipmaps = false;
	originsTexture.needsUpdate = true;

	var renderTexture1 = new THREE.WebGLRenderTarget( size, size, {
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat,
		type: THREE.FloatType,
		depthBuffer: false,
		stencilBuffer: false
	} );

	var renderTexture2 = renderTexture1.clone();

	var copyShader = new GPGPU.CopyShader();

	gpgpu.pass( copyShader.setTexture( originsTexture ), renderTexture1 );

	var simulationMaterial = new THREE.ShaderMaterial( {

		uniforms: {
			tPositions: { type: "t", value: renderTexture1 },
			tOrigins: { type: "t", value: originsTexture },
			tFFT: { type: "t", value: null },
			timer: { type: "f", value: 0 }
		}

	} );

	//

	var positions = new Float32Array( size * size * 3 );

	for ( var i = 0, j = 0, l = positions.length / 3; i < l; i ++, j += 3 ) {

		positions[ j + 0 ] = ( i % size ) / size;
		positions[ j + 1 ] = Math.floor( i / size ) / size;

	}

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

	var material = new THREE.ShaderMaterial( {

		uniforms: {

			map: { type: "t", value: renderTexture1 },
			size: { type: "f", value: size },
			tFFT: { type: "t", value: null }

		},
		blending: THREE.AdditiveBlending,
		depthWrite: false,
		transparent: true

	} );

	var points = new THREE.Points( geometry, material );
	points.frustumCulled = false;
	scene.add( points );

	// debug

	var mesh = new THREE.Mesh(
		new THREE.PlaneGeometry( 10, 10 ),
		new THREE.MeshBasicMaterial( { map: renderTexture1 } )
	);

	if ( location.search === '?debug' ) {

		scene.add( mesh );

	}

	//

	function resize() {

		var width = dom.clientWidth;
		var height = dom.clientHeight;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		// renderer.setClearColor( 0xffffff * Math.random() );
		renderer.setSize( width, height );

	}

	var frame = 0;

	function render() {

		var time = performance.now() / 1000;

		simulationMaterial.uniforms.timer.value = time;

		if ( frame % 2 === 0 ) {

			simulationMaterial.uniforms.tPositions.value = renderTexture1;

			gpgpu.pass( simulationMaterial, renderTexture2 );
			material.uniforms.map.value = renderTexture2;

		} else {

			simulationMaterial.uniforms.tPositions.value = renderTexture2;

			gpgpu.pass( simulationMaterial, renderTexture1 );
			material.uniforms.map.value = renderTexture1;

		}

		controls.update();

		renderer.render( scene, camera );

		frame ++;

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
		setSimulationShader: function ( shader ) {

			simulationMaterial.vertexShader = shader.vertex;
			simulationMaterial.fragmentShader = shader.fragment;
			simulationMaterial.needsUpdate = true;

		},
		setAudioTexture: function( t ) {
			simulationMaterial.uniforms.tFFT.value = t;
			material.uniforms.tFFT.value = t;
			// mesh.material.map = t;
		}
	};

};
