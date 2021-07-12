import './main.css';
import * as THREE from "three";
import Chat from 'twitch-chat-emotes';

// a default array of twitch channels to join
let channels = ['moonmoon'];

// the following few lines of code will allow you to add ?channels=channel1,channel2,channel3 to the URL in order to override the default array of channels
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    query_vars[key] = value;
});

if (query_vars.channels) {
    channels = query_vars.channels.split(',');
}

// create our chat instance
const ChatInstance = new Chat({
    channels,
    duplicateEmoteLimit: 5,
});

const emoteSources = {};
const emoteTextures = {};
const emoteMaterials = {};

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.z = 10;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: false
});
document.body.appendChild(renderer.domElement);


function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
resize();
window.addEventListener('resize', resize);


let lastFrame = Date.now();
// Called once per frame
function draw() {
    window.requestAnimationFrame(draw);

    // number of seconds since the last frame was drawn
    const delta = (Date.now() - lastFrame) / 1000;

    // update materials for animated emotes
	for (const key in emoteMaterials) {
		if (Object.hasOwnProperty.call(emoteMaterials, key)) {
			emoteMaterials[key].needsUpdate = true;
			emoteTextures[key].needsUpdate = true;
		}
	}

    for (let index = emoteArray.length-1; index >= 0; index--) {
        const element = emoteArray[index];

	// Emotes will travel either towards or away from the camera as a basic example
        if (index % 2) {
            element.position.z += delta;
        } else {
            element.position.z -= delta;
        }
        
	// Remove a given set of emotes after 10 seconds have passed
        if (element.dateSpawned < Date.now() - 10000) {
            scene.remove(element);
            emoteArray.splice(index, 1);
        }
    }

    renderer.render(scene, camera);

    lastFrame = Date.now();
}

// add a callback function for when a new message with emotes is sent
const emoteArray = [];
ChatInstance.on("emotes", (emotes) => {
    const group = new THREE.Group();

    group.position.x = Math.random() * 5 - 2.5,
    group.position.y = Math.random() * 5 - 2.5,
    group.dateSpawned = Date.now()

    for (let index = 0; index < emotes.length; index++) {
        const emote = emotes[index];

	// cache textures/materials to save on GPU bandwidth, otherwise a material would need to be generated for every unique use of the same emote
        if (!emoteTextures[emote.id]) {
            emoteSources[emote.id] = emote;
            emoteTextures[emote.id] = new THREE.CanvasTexture(emote.gif.canvas);
            emoteTextures[emote.id].emote = emote;
	    
	    // Feel free to change this from a nearest neighbor upsampling method to match your visual style
            emoteTextures[emote.id].magFilter = THREE.NearestFilter;

            emoteMaterials[emote.id] = new THREE.SpriteMaterial({
                map: emoteTextures[emote.id],
                transparent: true,
            });
        }
        const sprite = new THREE.Sprite(emoteMaterials[emote.id]);
        sprite.position.x = index;

        group.add(sprite);
    }
    scene.add(group);
    emoteArray.push(group);
})

draw();
