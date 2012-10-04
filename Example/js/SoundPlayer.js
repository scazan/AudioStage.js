//Sound player class ---------------------------------------------------------
//author: Scott Cazan

function SoundPlayer(passedContext, passedBufferArray, masterGainNode) {
	this.buffer = passedBufferArray;
	this.context = passedContext;
	this.output = masterGainNode;
	this.masterFader = this.context.createGainNode();

	var passedBufferArrayLength = passedBufferArray.length;
	this.sourceFiles = new Array(passedBufferArrayLength);

	//Parameter defaults (these are passed in with the object [potentially])
	this.volume;
	this.loop = false;
	this.pan = [0.7,0.5,0.5];
	this.crossfade = 0;
	this.crossfadeStyle = 'normal';
	this.poly = false;
	this.playbackRate = 1;
	this.convolveBuffer = null;
	this.playing = false;
}

SoundPlayer.prototype.createGraph = function() {
	var bufferLength = this.buffer.length;

	this.gainNodes = new Array(bufferLength);
	this.panners = new Array(bufferLength);

	this.masterFader.gain.value = this.volume;
	
	for(var i=0; i<bufferLength; i++)
	{
		this.panners[i] = this.context.createPanner();
		this.panners[i].setPosition(this.pan[0], this.pan[1], this.pan[2]);

		//Setup individual GainNodes
		this.gainNodes[i] = this.context.createGainNode();

		this.gainNodes[i].connect(this.panners[i]);
		this.panners[i].connect(this.masterFader);

		this.sourceFiles[i] = this.context.createBufferSource();
		this.sourceFiles[i].buffer = this.buffer[i];
		this.sourceFiles[i].loop = this.loop;
		this.sourceFiles[i].playbackRate.value = this.playbackRate;
		this.sourceFiles[i].connect(this.gainNodes[i]);
	}

	this.setCrossFade(this.crossfade);
}

SoundPlayer.prototype.play = function(callbackHasStopped) {
	if(!this.playing || this.poly )
	{
		this.createGraph();
		this.masterFader.connect(this.output);
	}

	if(this.sourceFiles[0])
	{
		var sourceFilesLength = this.sourceFiles.length;
		for(var i=0; i<sourceFilesLength; i++)
		{
			// Only do a noteOn if it is not playing (unless it is polyphonic)
			if(!this.playing || this.poly )
			{
				this.sourceFiles[i].noteOn(0);
				this.playing = true;

				if(!this.loop)
				{
					setTimeout(function() {
						this.playing = false;
						if(callbackHasStopped)
						{
							callbackHasStopped();
						};
					}, (this.sourceFiles[i].buffer.duration / this.playbackRate) * 1000);
				}
			}
		}
	}
}

SoundPlayer.prototype.stop = function() {
	this.sourceFiles[0].noteOff(0);
	this.masterFader.disconnect();
	this.playing = false;
}

SoundPlayer.prototype.setVolume = function(value) {
	this.volume = value;

	if(this.sourceFiles[0])
	{
		this.masterFader.gain.value = value;
	}
}

SoundPlayer.prototype.setLoop = function(value) {
	this.loop = value;

	// We can only do this if the graphs have already been created
	if(this.sourceFiles[0])
	{
		for(var i=0; i<this.sourceFiles.length;i++)
		{
			this.sourceFiles[i].loop = value;	
		}	
	}
}

SoundPlayer.prototype.setPan = function(value) {
	//VELOCITY CODE FROM Ilmari Heikkinen. http://www.html5rocks.com/en/tutorials/webaudio/positional_audio/
	// var dt = secondsSinceLastFrame;
	// var dx = value[0]-this.pan[0], dy = value[1]-this.pan[1], dz = value[2]-this.pan[2];
	// sound.panner.setVelocity(dx/dt, dy/dt, dz/dt);

	this.pan = value;

	if(this.sourceFiles[0])
	{
		for(var i=0; i<this.panners.length; i++)
		{
			this.panners[i].setPosition(this.pan[0],this.pan[1],this.pan[2]);

			if(velocity[0])
			{
				this.panners[i].setVelocity(velocity[0],velocity[1],velocity[2]);
			}
		}
	}
}

SoundPlayer.prototype.setPolyphony = function(value) {
	this.poly = value;
}

SoundPlayer.prototype.setPlaybackRate = function(value) {
	this.playbackRate = value;

	if(this.sourceFiles[0])
	{
		for(var i=0; i<this.sourceFiles.length;i++)
		{
			this.sourceFiles[i].playbackRate.value = value;
		}
	}
}

SoundPlayer.prototype.changeConvolverVolume = function(value) {
	this.gainNodeConvolver.gain.value = value;
}

SoundPlayer.prototype.changeFilterFreq = function(value) {
	this.biQuad.frequency.value = value;
}

SoundPlayer.prototype.changeFilterQ = function(value) {
	this.biQuad.Q.value = value;
}

SoundPlayer.prototype.setCrossfadeStyle = function(value) {
	this.crossfadeStyle = value;
};


SoundPlayer.prototype.setCrossFade = function(val) {

	this.crossfade = val;

	if(this.sourceFiles[0])
	{
		// TODO: optimize this
		switch(this.crossfadeStyle)
		{
			case 'cumulative':
				var gainNodesLength = this.gainNodes.length;
				var value = val * (gainNodesLength - 1); // First reset gains on all nodes.

				for (var i = 0; i < gainNodesLength; i++) {
				  this.gainNodes[i].gain.value = 0;
				}

				// Decide which two nodes we are currently between, and do an equal
				// power crossfade between them.
				var leftNode = Math.floor(value);
				// Normalize the value between 0 and 1.
				var x = value - leftNode;
				var gain1 = Math.cos(x * 0.5*Math.PI);
				var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);
				// Set the two gains accordingly.
				this.gainNodes[leftNode].gain.value = gain1;
				// Check to make sure that there's a right node.
				if (leftNode < this.gainNodes.length - 1) {
				  // If there is, adjust its gain.
				  this.gainNodes[leftNode + 1].gain.value = gain2;
				}

				break;

			default:
				// Taken from an article on www.html5rocks.com by Boris Smus, Feb 28, 2012
				// with some basic optimizations
				var gainNodesLength = this.gainNodes.length;
				var value = val * (gainNodesLength - 1); // First reset gains on all nodes.

				for (var i = 0; i < gainNodesLength; i++) {
				  this.gainNodes[i].gain.value = 0;
				}

				// Decide which two nodes we are currently between, and do an equal
				// power crossfade between them.
				var leftNode = Math.floor(value);
				// Normalize the value between 0 and 1.
				var x = value - leftNode;
				var gain1 = Math.cos(x * 0.5*Math.PI);
				var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);
				// Set the two gains accordingly.
				this.gainNodes[leftNode].gain.value = gain1;
				// Check to make sure that there's a right node.
				if (leftNode < this.gainNodes.length - 1) {
				  // If there is, adjust its gain.
				  this.gainNodes[leftNode + 1].gain.value = gain2;
				}
		}
		
	}

};

SoundPlayer.prototype.setConvolveBuffer = function(buffer) {
	this.convolveBuffer = buffer;
};

SoundPlayer.prototype.addEffects = function(effectNames) {

	var i = 0,
		effectNamesLength = effectNames.length,
		convolver;


	do {
		// TODO: OPTIMIZE THIS
		if(effectNames[i] == 'reverb')
		{
			//Create a reverb and an aux gainNode to connect it to.
			convolver = this.context.createConvolver();
			convolver.buffer = this.convolveBuffer;

			this.reverb = this.context.createGainNode();
			this.reverb.gain.value = 0;
			this.reverb.connect(this.output);
			convolver.connect(this.reverb);

			// Remove from the effects array and reduce the length variable by one
			// We want a separate aux for reverb to control wet/dry
			effectNames.splice(i,1);
			effectNamesLength--;

		} else if(effectNames[i] == 'hpfilter') {
			effectNames[i] = this.context.createBiquadFilter();
			this.filter = effectNames[i];
			this.filter.type = 1;
			this.filter.Q = 1;
			this.filter.gain = 2;

			i++;
		}
	}
	while(i<effectNamesLength);


	//Connect the effects audio chain in the order that it was passed in.
	i = 0;
	do {
		if(i == effectNamesLength - 1)
		{
			effectNames[i].connect(this.output);	
		}
		else {
			effectNames[i].connect(effectNames[i+1])
		}
	}
	while(++i<effectNamesLength);

	//Set this effects chain to be the output for the rest of the graph
	if(effectNamesLength > 0)
	{
		this.output = effectNames[0];
	}

	//Connect the output of the effect chain to the reverb unit as well (if it exists)
	if(convolver) 
	{
		effectNames[effectNamesLength-1].connect(convolver);
	}
}

// End SoundPlayer class ---------------------------------------------------------