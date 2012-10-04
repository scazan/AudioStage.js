// A class for setting up multiple sounds that are tied to specific "cues."
// Requirements:
//	All control data should be normalized as 0...1 before being used
// riffwave.js (http://codebase.es/riffwave/) 
// TODO: add a way of using filters


// function AudioStage()
var AudioStage = function() {
	this.context = new webkitAudioContext();
	this.masterFader = this.getNewMasterFader();

	//Create object to hold all sounds and their associated events
	this.cues = {};

	// Callback function for when all sounds have been loaded
	this.ready;
}

AudioStage.prototype.getNewMasterFader = function() {
	var fader = this.context.createGainNode(),
		compressor = this.context.createDynamicsCompressor();

	fader.connect(compressor);
	compressor.connect(this.context.destination);

	return fader;
};

AudioStage.prototype.addCues = function(cueObject) {
	var bufferPaths = new Array(), 
		objectInstance = this;

	for (cue in cueObject) {
		//Don't add duplicates
		if(cueObject[cue].signalArray instanceof Array)
		{
			console.debug('DSP!');
		}
		else {
			
			if(bufferPaths.indexOf(cueObject[cue].file) == -1)
			{
				bufferPaths.push(cueObject[cue].file);	
			}
		}
	}

	this.loadSoundBuffers(bufferPaths, function(bufferList) {
		

		// TODO: Can this be optimized to not use a For-in?
		for (cue in cueObject) {
			var cueFileLength = cueObject[cue].file.length,
				bufferArray = [];

			if(cue != 'convolveBuffer')
			{
				if(cueObject[cue].file instanceof Array)
				{
					var i = 0;
						//Optimized with do-while
						do {
							bufferArray.push(bufferList[ cueObject[cue].file[i] ] );	
							i++;
						}
						while(i<cueFileLength);
				}
				else {
					bufferArray.push(bufferList[cueObject[cue].file]);
				}

				objectInstance.cues[cue] = new SoundPlayer(objectInstance.context, bufferArray, objectInstance.masterFader);
				// console.debug(objectInstance.cues[cue]);
				objectInstance.cues[cue].setLoop(cueObject[cue].loop);
				objectInstance.cues[cue].setVolume(cueObject[cue].vol);
				objectInstance.cues[cue].setPolyphony(cueObject[cue].poly);
				objectInstance.cues[cue].setCrossfadeStyle(cueObject[cue].crossfade);

				if(cueObject[cue].effects)
				{
					objectInstance.cues[cue].setConvolveBuffer(bufferList[cueObject['convolveBuffer'].file]);
					objectInstance.cues[cue].addEffects(cueObject[cue].effects);
				}

				if(cueObject[cue].pan)
				{
					objectInstance.cues[cue].setPan(cueObject[cue].pan);	
				}
			}
		}

		objectInstance.ready();
	});
};


//utility method for loading in all the sound buffers.
AudioStage.prototype.loadSoundBuffers = function(soundFileArray, completionFunc) {
	var bufferLoader, objectInstance = this;

	bufferLoader = new BufferLoader(
			objectInstance.context,
			soundFileArray,
			function(list) {
				completionFunc(list);
			}
		);
	
		bufferLoader.load();
}
