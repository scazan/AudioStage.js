

function AudioStage() {
	this.context = new webkitAudioContext();
	this.masterFader = createMasterFader();
	//Create oject to hold all sounds and their associated events
	this.soundPlayers = {};
}

AudioStage.prototype.createMasterFader = function() {
	var fader = this.context.createGainNode(),
		compressor = this.context.createDynamicsCompressor();

	fader.connect(compressor);
	compressor.connect(this.context.destination);

	return fader;
};

AudioStage.prototype.addPlayer = function(buffer, eventName) {
	this.soundPlayers[eventName] = new SoundPlayer(this.context, buffer, '#soundCanvas' );
};