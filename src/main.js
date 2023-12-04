import TwitchChat from "twitch-chat-emotes-threejs";
import * as THREE from "three";
import Stats from 'three/examples/jsm/libs/stats.module'
import "./style.css";


/**
 * URL Parameters and configuration
 */
// a default array of twitch channels to join
let channels = ['moonmoon'];

// the following few lines of code will allow you to add ?channels=channel1,channel2,channel3 to the URL in order to override the default array of channels
const params = new URL(window.location).searchParams;

if (params.has('channels') || params.has('channel')) {
	const temp = params.get('channels') + ',' + params.get('channel');
	channels = temp.split(',').filter(value => value.length > 0 && value !== 'null');
}

// performance stats enabled using ?stats=true in the browser URL
let stats = false;
if (params.get('stats') === 'true') {
	stats = new Stats();
	stats.showPanel(1);
	document.body.appendChild(stats.dom);
}


/*
** Initiate ThreeJS scene
*/

const camera = new THREE.PerspectiveCamera(
	70,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.z = 5;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);

// separate from three.js hierarchy, we want to keep track of emotes
// to update them with custom logic every render tick
const sceneEmoteArray = [];

function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('DOMContentLoaded', () => {
	window.addEventListener('resize', resize);
	if (stats) document.body.appendChild(stats.dom);
	document.body.appendChild(renderer.domElement);
	draw();
})



/*
** Draw loop
*/

let lastFrame = performance.now();
function draw() {
	if (stats) stats.begin();
	requestAnimationFrame(draw);
	const delta = Math.min(1, Math.max(0, (performance.now() - lastFrame) / 1000));
	lastFrame = performance.now();


	for (let index = sceneEmoteArray.length - 1; index >= 0; index--) {
		const element = sceneEmoteArray[index];
		element.position.addScaledVector(element.data.velocity, delta);
		if (element.data.timestamp + element.data.lifespan < Date.now()) {
			sceneEmoteArray.splice(index, 1);
			scene.remove(element);
		} else {
			element.update();
		}
	}

	renderer.render(scene, camera);
	if (stats) stats.end();
};



/*
** Twitch chat configuration
*/

const ChatInstance = new TwitchChat({
	// If using planes, consider using MeshBasicMaterial instead of SpriteMaterial
	materialType: THREE.SpriteMaterial,

	// Passed to material options
	materialOptions: {
		transparent: true,
	},

	textureHook: (texture) => {
		//fix emotes looking washed out on new THREE.js versions
		texture.colorSpace = THREE.SRGBColorSpace;

		//give a nice pixelated look when emotes are scaled up, but not down
		texture.magFilter = THREE.NearestFilter;
	},

	channels,
	maximumEmoteLimit: 3,
});


/*
** Handle Twitch Chat Emotes
*/
const spawnEmote = (emotes) => {
	//prevent lag caused by emote buildup when you tab out from the page for a while
	if (performance.now() - lastFrame > 1000) return;

	const group = new THREE.Group();
	group.data = {
		lifespan: 5000,
		timestamp: Date.now(),
		velocity: new THREE.Vector3(
			(Math.random() - 0.5) * 2,
			(Math.random() - 0.5) * 2,
			(Math.random() - 0.5) * 2
		).normalize(),
	}

	let i = 0;
	emotes.forEach((emote) => {
		const sprite = new THREE.Sprite(emote.material);
		// ensure emotes from the same message don't overlap each other
		sprite.position.x = i;

		group.add(sprite);
		i++;
	})

	group.update = () => { // called every frame
		let progress = (Date.now() - group.data.timestamp) / group.data.lifespan;
		if (progress < 0.25) { // grow to full size in first quarter
			group.scale.setScalar(progress * 4);
		} else if (progress > 0.75) { // shrink to nothing in last quarter
			group.scale.setScalar((1 - progress) * 4);
		} else { // maintain full size in middle
			group.scale.setScalar(1);
		}
	}

	scene.add(group);
	sceneEmoteArray.push(group);
};

ChatInstance.listen(spawnEmote);

// spawn some fake emotes for testing purposes
const placeholder_mats = [
	new THREE.SpriteMaterial({ color: 0xff4444 }),
	new THREE.SpriteMaterial({ color: 0x44ff44 }),
	new THREE.SpriteMaterial({ color: 0x4444ff }),
]
setInterval(() => {
	spawnEmote([{
		material: placeholder_mats[Math.floor(Math.random() * placeholder_mats.length)]
	}]);
}, 1000);
