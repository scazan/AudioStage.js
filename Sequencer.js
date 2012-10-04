// Basic Sequencer object



function Sequencer(playerObject) {
	this.sequencedObject = playerObject;

	this.tempo = 0.25;
	this.step = 0;
	this.running = false;

	this.sequence = [0,1,0,0,1,0,1,0];
}

Sequencer.prototype.createGUI = function() {

	
};

Sequencer.prototype.constructGUIRow = function(first_argument) {
	var row = document.createElement('div');

	for(i=0; i<sequence.length; i++)
	{
		var step = document.createElement('li');
		row.appendChild(step);

		$(step).click(function() {
			this.changeStep(i, 1);
		});

	}
};

Sequencer.prototype.start = function() {
	var rootObject = this;

	this.running = true;

	var loopTimer = setInterval(function() {
		if(rootObject.running)
		{
			rootObject.playStep(rootObject.step);
			rootObject.step = (rootObject.step + 1) % rootObject.sequence.length;
		}
		else
		{
			clearInterval(rootObject.loopTimer);
		}
	}, this.tempo * 1000);
};


Sequencer.prototype.stop = function() {
	this.running = false;
};


Sequencer.prototype.playStep = function(currentStep) {
	if(this.sequence[currentStep] == 1)
	{
		this.sequencedObject.play();
	}
	else
	{
		this.sequencedObject.stop();
	}
}

Sequencer.prototype.changeStep = function(step, value) {
	this.sequence[step] = value;
};