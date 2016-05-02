var Audio = function () {

	var audioContext = new AudioContext();
	var audio;

	var analyser = audioContext.createAnalyser();
	analyser.fftSize = 128;
	analyser.smoothingTimeConstant = .75;
	var frequencyData = new Uint8Array( analyser.fftSize );
	analyser.connect( audioContext.destination );

	var spectrumTexture = new THREE.DataTexture( frequencyData, .5 * frequencyData.length, 1, THREE.LuminanceFormat );
	spectrumTexture.minFilter = THREE.NearestFilter;
	spectrumTexture.magFilter = THREE.NearestFilter;
	spectrumTexture.needsUpdate = true;

	function init() {

		audio = document.createElement( 'audio' );
		audio.src = 'assets/track.ogg';
		audio.controls = true;
		audio.className = 'player';
		document.body.appendChild( audio );

		var audioSource = audioContext.createMediaElementSource( audio );
		audioSource.connect( analyser );

	}

	function update() {

		analyser.getByteFrequencyData( frequencyData );
		spectrumTexture.needsUpdate = true;

	}

	return {
		init: init,
		update: update,
		getSpectrumTexture: function() { return spectrumTexture; }
	};

};
