
var context;
// var concreteDigitalSound = null;
var soundPanels = new Array();
var bufferList;
var sequencers = new Array();
var sequence = [0,1,0,1,1,0,0,1];


// LOAD FUNCTION
$(document).ready(function() {
	

	try {

		try {
			context = new webkitAudioContext();	
		}
		catch(e)
		{
			//Just in case in the future this is supported outside of webkit browsers
			// context = new AudioContext();
			document.getElementById('soundCanvas').innerHTML = "<h1>Your browser does not support WebAudio yet. Try Chrome!</h1>";
		}
		
		
		//Load a SoundPlayer for each Buffer in the bufferList array, skipping the first (using that as the convolution buffer)
		loadSoundBuffers( function() {
			var numPlayers = 10;
			for(i=1; i <= numPlayers; i++)
			{
				var soundPlayer = new SoundPlayer(context, bufferList[1], '#soundCanvas' );
				soundPlayer.convolveBuffer = bufferList[0];

				soundPanels.push( soundPlayer );
				sequencers.push(new Sequencer(soundPlayer, 8) );

				console.debug(sequencers.length);
			}
			
			$('#sequencer').click(function() {
				
				if($(this).hasClass('active') )
				{
					$(this).removeClass('active');

					for(i=0; i < sequencers.length; i++)
					{
						sequencers[i].stop();	
					}		
				}
				else
				{
					$(this).addClass('active');
					for(i=0; i<sequencers.length; i++)
					{
						sequencers[i].start();	
					}	
				}

			});
		});

	}
	catch(e) {
		//Catch for AudioContext browsers
		alert(e);
	}

});


function loadSoundBuffers(completionFunc) {
	var bufferLoader = new BufferLoader(
			context,
			[
				"snd/WierdSpringer.mp3",
				"snd/concreteDigital.mp3"
			],
			function(list) {
				bufferList = list;
				completionFunc();
			}
		);
	bufferLoader.load();
}

