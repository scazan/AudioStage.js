
var stage = new AudioStage();

// var eventMappings = {
// 		death: {
// 			file: ['snd/WierdSpringer.mp3', 'snd/concreteDigital.mp3','snd/crash17.mp3','snd/concreteDigital.mp3'], 
// 			loop: true,
// 			vol: 0.5,
// 			pan: [0.5,0.5,0.5],
// 			poly: false,
// 			crossfade: 'normal',
// 			effects: ['hpfilter', 'reverb']
// 		},
// 		explosion: {
// 			file: 'snd/crash17.mp3', 
// 			loop: false,
// 			vol: 1,
// 			pan: [0,1,1],
// 			poly: true
// 		},
// 		laserFire: {
// 			file: 'snd/WierdSpringer.mp3', 
// 			loop: false,
// 			vol: 1,
// 			effects: ['hpfilter', 'reverb']
// 		},
// 		convolveBuffer: {
// 			file: 'snd/WierdSpringer.mp3'
// 		}
// 	};

var eventMappings = {
		death: {
			file: 'snd/concreteDigital.mp3', 
			loop: true,
			vol: 0.5,
			pan: [0.5,0.5,0.5],
			poly: false,
			crossfade: 'normal',
			effects: ['hpfilter', 'reverb']
		},
		explosion: {
			file: 'snd/crash17.mp3',
			loop: false,
			vol: 1,
			pan: [0,1,1],
			poly: true,
			effects: ['hpfilter', 'reverb']
		},
		laserFire: {
			file: 'snd/crash17.mp3',
			loop: false,
			vol: 1,
			effects: ['hpfilter', 'reverb'],
			poly: true
		},
		convolveBuffer: {
			file: 'snd/WierdSpringer.mp3'
		}
	};

$(document).ready(function() {
	stage.ready = main;
	stage.addCues(eventMappings);	
});



function main() {	
	console.debug('ready!')	;
	var panels = new Array(3);

	panels[0] = new SoundGUI(stage.cues.death, $('#soundCanvas'));
	panels[1] = new SoundGUI(stage.cues.explosion, $('#soundCanvas'));
	panels[2] = new SoundGUI(stage.cues.laserFire, $('#soundCanvas'));

};	

// GUI LAYER -------------------------------------
function SoundGUI(cue, parentUIElement) {
	var widgetDiv = document.createElement('div');
	
	$(parentUIElement).append(widgetDiv);
	$(widgetDiv).addClass('soundPanel');

	var rotationHandle = document.createElement('div');
	$(rotationHandle).addClass('rotationHandle');
	widgetDiv.appendChild(rotationHandle);

	this.cue = cue;
	this.ui = widgetDiv;

	this.setupUI();
	
	this.rotation = 0;
	this.mouseIsDown = false;
}

SoundGUI.prototype.setupUI = function() {
	var soundGuiObj = this;

	$(this.ui).draggable({
		containment: "parent",
		drag: function(e) {
			soundGuiObj.cue.setPlaybackRate(e.pageX / 1024);
			soundGuiObj.cue.setVolume(e.pageY / 1024);
		}
	});

	$(this.ui).find('.rotationHandle').draggable({
		containment: "parent",
		drag: function() {
			soundGuiObj.cue.filter.value = $(this).position().left * 100;
			soundGuiObj.cue.filter.Q.value =  ($(this).position().left / $(soundGuiObj.ui).height()) * 2;
		}
	});

	$(this.ui).bind('mouseup', function() { soundGuiObj.mouseIsDown = false;});

	$(this.ui).bind('contextmenu', function(e) {
		e.preventDefault();
		
		soundGuiObj.mouseIsDown = true;
		var bindingFunction = this;

		this.loopingRotation = setInterval(function() {
			if(soundGuiObj.mouseIsDown) 
			{
				$(soundGuiObj.ui).css({
			                "transform": "rotate("+ soundGuiObj.rotation + "deg)",
			                "-moz-transform": "rotate("+ soundGuiObj.rotation + "deg)",
			                "-webkit-transform": "rotate("+ soundGuiObj.rotation + "deg)",
			                "-o-transform": "rotate("+ soundGuiObj.rotation + "deg)"
			            });
			            
			            soundGuiObj.cue.reverb.gain.value = soundGuiObj.rotation / 360;
			            soundGuiObj.rotation = (soundGuiObj.rotation + 6) % 360;
	        } else
	        {
	        	clearInterval(bindingFunction.loopRotation);
	        }

		}, 100);
		
	});

	$(this.ui).click(function(e) { 

		// if($(soundGuiObj.ui).hasClass('active'))
		// {
		// 	$(soundGuiObj.ui).removeClass('active');
		// 	soundGuiObj.cue.stop();

		// }
		// else
		// {
		// 	$(soundGuiObj.ui).addClass('active');
			soundGuiObj.cue.play( 
			// 	function() {
			// 	$(soundGuiObj.ui).removeClass('active');
			// }
			);
		// }
		
	});
}

