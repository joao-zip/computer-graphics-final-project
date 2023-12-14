import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 23.75);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
scene.add( ambientLight );

let mixer;
let live = 10;
let score = 0;
let inc = 0.08; // movement of enemy spaceship
let spaceship;
let spaceshipBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
let shoot;
let shootBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
let enemy;
let enemyBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
let enemyShoot;
let enemyShootBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
let sun;
let earth;
let space;

const loader = new GLTFLoader();

loader.load('/public/assets/nave_jogador_arredondadoV2.gltf', function (gltf) {
  spaceship = gltf.scene;
  spaceship.position.set(0, 0.25, 8)
  spaceship.scale.set(0.3, 0.3, 0.3);
  scene.add(spaceship);
});

loader.load('/public/assets/nave_inimigoV2.gltf', function (gltf){
    
    setInterval (() => {
        const num = Math.floor(Math.random() * 4);
        enemy = gltf.scene;
        enemy.scale.set(0.3, 0.3, 0.3);
        if(num == 0 || num == 1){
                enemy.position.set(0, 0.25, -6);
                enemy.rotation.y = Math.PI;
                scene.add(enemy); // enemy on bottom
        }
        else if(num == 2){
                enemy.position.set(0, 3.25, -6);
                enemy.rotation.y = Math.PI;
                scene.add(enemy); // enemy on mid
        }
        else if(num == 3){
                enemy.position.set(0, 6.25, -6);
                enemy.rotation.y = Math.PI;
                scene.add(enemy); // enemy on top
        }
    }, 5000); // each 5s an enemy spawns
});
 
loader.load('/public/assets/Tiro_Inimigo.gltf', function (gltf) {
    setInterval(() => {
        console.log(enemy);
        if(enemy.parent === scene){
            enemyShoot = gltf.scene;
            enemyShoot.scale.set(0.06, 0.06, 0.06);
            enemyShoot.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
            enemyShoot.rotation.y = Math.PI;
            scene.add(enemyShoot); // enemy spaceship shoot
        }
    }, 1000);
});
loader.load('/public/assets/sun/scene.gltf', function (gltf) {
    sun = gltf.scene;
    sun.scale.set(5, 5, 5);
    sun.position.set(20, 11, -510);
    sun.rotation.y = Math.PI / 2;
    mixer = new THREE.AnimationMixer(sun);
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
    
    scene.add(sun);
});

loader.load('/public/assets/space/scene.gltf', function (gltf) {
    space = gltf.scene;
    space.scale.set(110, 110, 110);
    space.position.set(0, 0, 0);
    
    scene.add(space);   
});

loader.load('/public/assets/earth/scene.gltf', function (gltf) {
    earth = gltf.scene;
    earth.scale.set(0.1, 0.1, 0.1);
    earth.position.set(-20, 11, -530);
    earth.rotation.y = Math.PI / 2;
    
    scene.add(earth);   
});

const spotLight = new THREE.SpotLight( 0xffffff, 0.7 );
spotLight.position.set(0, 70, 8);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.5;
spotLight.decay = 1;
spotLight.distance = 0;

const sunLight = new THREE.SpotLight( 0xffffff, 7 );
sunLight.position.set(20, 11, -510);
sunLight.angle = Math.PI / 6;
sunLight.penumbra = 0.02;
sunLight.decay = 0.5;
sunLight.distance = 0;

scene.add( sunLight );
scene.add( sunLight.target );

spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 60;

scene.add( spotLight );
scene.add( spotLight.target );

const axesHelper = new THREE.AxesHelper( 50 );
scene.add( axesHelper );

const controls = new OrbitControls( camera, renderer.domElement );

let isTurningLeft = false;
let isTurningRight = false;
let isMovingUp = false;
let isMovingDown = false;
let rotationSpeed = 0.2;

let movement = new THREE.Vector3(0, 0, 0);

document.addEventListener('keydown', (event) => {
    const moveDistance = 0.3; // Adjust this value to change the movement speed
    
    switch (event.keyCode) { 
        case 32: // Space key - shoot
            const loaderShoot = new GLTFLoader();
            loaderShoot.load('/public/assets/Tiro_jogoadorV4.gltf', function (gltf) {
                    shoot = gltf.scene;
                    shoot.position.set(spaceship.position.x, spaceship.position.y, spaceship.position.z);
                    shoot.scale.set(0.06, 0.06, 0.06);
                    scene.add(shoot); // spacebar = shoot that follows our spaceship
            });
            break;
        case 65: // Tecla A
            isTurningLeft = true;
            movement.x = -1;
            break;
        case 68: // Tecla D
            isTurningRight = true;
            movement.x = 1;
            break;
        case 87: // Tecla W
            movement.y = 1;
            break;
        case 83: // Tecla S
            movement.y = -1;
            break;
    }
});

document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
        case 65: // A
            isTurningLeft = false;
            movement.x = 0;
            break;
        case 68: // D
            isTurningRight = false;
            movement.x = 0;
            break;
        case 87: // Tecla W
        case 83: // Tecla S
            movement.y = 0;
            break;
    }
});

function checkCollisions(){ // check if the hitbox collides
    if(shoot){
        if(shootBox.intersectsBox(enemyBox)){
            scene.remove(enemy);
            score += 1000;
        }
    }
    if (enemyShoot){
        if(enemyShootBox.intersectsBox(spaceshipBox)){
            scene.remove(enemyShoot)
            live -= 1;
        }
    }
}

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}, false);

function checkBounds() {
    const minY = 0.25; 
    const maxY = 6.25;

    if (spaceship.position.y < minY) {
        spaceship.position.y = minY;
    } else if (spaceship.position.y > maxY) {
        spaceship.position.y = maxY;
    }

    const maxX = 5;
    const minX = -5;

    if (spaceship.position.x > maxX) {
        spaceship.position.x = maxX;
    } else if (spaceship.position.x < minX) {
        spaceship.position.x = minX;
    }

}

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    //console.log(score);
    console.log(live);
    
    checkCollisions();

    spaceshipBox.setFromObject(spaceship);
    
    if(enemy){
        enemyBox.setFromObject(enemy);
        enemy.position.x += inc;
        if(enemy.position.x >= 5){
            inc = -0.09; // enemy spaceship going to right limit
        }
        else if(enemy.position.x <= -5){
            inc = +0.09; // enemy spaceship going to left limit
        }
    }
    if (shoot){
        shootBox.setFromObject(shoot); 
        //console.log(shootBox);
        shoot.position.z -= 0.6;
        if (shoot.position.z <= -8){
            scene.remove(shoot);
        } 
    }

    if (enemyShoot){
        enemyShootBox.setFromObject(enemyShoot);
        //console.log(enemyShootBox);
        enemyShoot.position.z += 0.6; // adjust this value to change shoot speed
        if (enemyShoot.position.z >= 12){
            scene.remove(enemyShoot);
        }
    }

    // Aplica o movimento à posição da nave
    spaceship.position.add(movement.clone().multiplyScalar(0.25));
    
    checkBounds();
    
    if (isTurningLeft) {
        if (spaceship.rotation.z < Math.PI / 4) {
            spaceship.rotation.z += rotationSpeed;
        }
    } 
    else if (spaceship.rotation.z > 0) {
        // Retornar à posição neutra
        spaceship.rotation.z = Math.max(spaceship.rotation.z - rotationSpeed, 0);
    }

    if (isTurningRight) {
        if (spaceship.rotation.z > -Math.PI / 4) {
            spaceship.rotation.z -= rotationSpeed;
        }
    } else if (spaceship.rotation.z < 0) {
        // Retornar à posição neutra
        spaceship.rotation.z = Math.min(spaceship.rotation.z + rotationSpeed, 0);
    }

    sun.rotation.z += 0.01;
    
    document.getElementById('score').innerText = `Score: ${score}`;

    renderer.render( scene, camera );
}
    
animate();

export { score };