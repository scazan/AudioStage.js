AudioStage.js
=============

A sound cueing and playback library for Google Chrome to easily map soundfiles to named events via a configuration file. 

Initially written for an upcoming JavaScript video game, the library was written with the sound designer in mind, enabling a designer to easily add and map sounds events and apply sound processing via a simple configuration file (JSON).

See the Example/Demo.html for an example.

Example configuration:
<code>
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
	</code>