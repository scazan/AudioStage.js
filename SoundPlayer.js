//Sound player class ---------------------------------------------------------
//author: Scott Cazan
//Dependencies:
//	>jQuery
//	>jQuery-UI

function SoundPlayer(passedContext, passedBuffer, parentUIElement) {
	var widgetDiv = document.createElement('div');
	
	$(parentUIElement).append(widgetDiv);
	$(widgetDiv).addClass('soundPanel');

	var rotationHandle = document.createElement('div');
	$(rotationHandle).addClass('rotationHandle');
	widgetDiv.appendChild(rotationHandle);

	this.buffer = passedBuffer;
	this.context = passedContext;
	this.convolve = false;
	this.ui = widgetDiv;

	this.setupUI();
	this.createGraph();
	this.rotation = 0;
	this.mouseIsDown = false;

	this.convolveBuffer = null;

}

SoundPlayer.prototype.setupUI = function() {
	var referenceToSelf = this;

	$(this.ui).draggable({
		containment: "parent",
		drag: function(e) {
			referenceToSelf.changeSpeed(e.pageX / 1024);
			referenceToSelf.changeVolume(e.pageY / 1024);
		}
	});

	$(this.ui).find('.rotationHandle').draggable({
		containment: "parent",
		drag: function() {
			referenceToSelf.changeFilterFreq( $(this).position().left * 10 );
			referenceToSelf.changeFilterQ( ($(this).position().left / $(referenceToSelf.ui).height()) * 2);
		}
	});

	$(this.ui).bind('mouseup', function() { referenceToSelf.mouseIsDown = false;});

	$(this.ui).bind('contextmenu', function(e) {
		e.preventDefault();
		
		referenceToSelf.mouseIsDown = true;
		var bindingFunction = this;

		this.loopingRotation = setInterval(function() {
			if(referenceToSelf.mouseIsDown) 
			{
				$(referenceToSelf.ui).css({
			                "transform": "rotate("+ referenceToSelf.rotation + "deg)",
			                "-moz-transform": "rotate("+ referenceToSelf.rotation + "deg)",
			                "-webkit-transform": "rotate("+ referenceToSelf.rotation + "deg)",
			                "-o-transform": "rotate("+ referenceToSelf.rotation + "deg)"
			            });
			            
			            referenceToSelf.changeConvolverVolume( referenceToSelf.rotation / 360 );
			            referenceToSelf.rotation = (referenceToSelf.rotation + 6) % 360;
	        } else
	        {
	        	clearInterval(bindingFunction.loopRotation);
	        }

		}, 100);
		
	});

	$(this.ui).click(function(e) { 

		if($(referenceToSelf.ui).hasClass('active'))
		{
			referenceToSelf.stop();

		}
		else
		{
			referenceToSelf.play();
		}
		
	});
}

SoundPlayer.prototype.createGraph = function() {
	
	this.masterFader = this.context.createGainNode();
	this.source = this.context.createBufferSource();
	this.biQuad = this.context.createBiquadFilter();
	this.gainNode = this.context.createGainNode();
	this.compressor = this.context.createDynamicsCompressor();

	//Settings
	this.source.buffer = this.buffer;
	this.source.loop = true;
	this.source.playbackRate.value = $(this.ui).position().left / window.innerWidth;
	
	this.biQuad.type = 1;
	this.biQuad.Q = 0.5;
	this.biQuad.gain = 2;
	

	this.gainNode.gain.value = $(this.ui).position().top / window.innerHeight;

	//Connections
	this.source.connect(this.biQuad);
	this.biQuad.connect(this.gainNode);
	this.gainNode.connect(this.masterFader);


	// Second audio chain for convolution
	this.gainNodeConvolver = this.context.createGainNode();
	this.convolver = this.context.createConvolver();

	this.gainNodeConvolver.gain.value = 0;

	this.source.connect(this.convolver);

	if(this.convolveBuffer)
	{
		this.convolver.buffer = this.convolveBuffer;	
	}
	
	this.convolver.connect(this.gainNodeConvolver);
	this.gainNodeConvolver.connect(this.masterFader);

	this.masterFader.connect(this.compressor);

	this.compressor.connect(context.destination);
}

SoundPlayer.prototype.play = function() {
	$(this.ui).addClass('active');
	this.createGraph();
	this.source.noteOn(0);
}

SoundPlayer.prototype.stop = function() {
	$(this.ui).removeClass('active');
	this.source.noteOff(0);
}

SoundPlayer.prototype.changeVolume = function(value) {
	this.gainNode.gain.value = value;
}

SoundPlayer.prototype.changeSpeed = function(value) {
	this.source.playbackRate.value = value;
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
// End SoundPlayer class ---------------------------------------------------------