import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(18, 7, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });

const planeGeometry = new THREE.PlaneGeometry( 100, 100 );
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xbcbcbc });

const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add( plane );

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
scene.add( ambientLight );

let inc = 0.08; // movement of enemy spaceship
let spaceship;
let shoot;
let enemy;
let enemyShoot;

const loader = new GLTFLoader();

loader.load('/public/assets/nave_jogador_arredondadoV2.gltf', function (gltf) {
  spaceship = gltf.scene;
  spaceship.position.set(0, 0.25, 8)
  spaceship.scale.set(0.3, 0.3, 0.3);

  scene.add(spaceship);
});

const enemyLoader = new GLTFLoader();   

enemyLoader.load('/public/assets/nave_inimigoV2.gltf', function (gltf){
    setInterval (() => {
        const num = Math.floor(Math.random() * 4);
        enemy = gltf.scene;
        enemy.scale.set(0.3, 0.3, 0.3);
        if(num == 0 || num == 1){
                enemy.position.set(0, 0.25, -6);
                scene.add(enemy); // enemy on bottom
        }
        else if(num == 2){
                enemy.position.set(0, 3.25, -6);
                scene.add(enemy); // enemy on mid
        }
        else if(num == 3){
                enemy.position.set(0, 6.25, -6);
                scene.add(enemy); // enemy on top
        }
    }, 5000); // each 5s an enemy spawns
});

const loaderEnemyShoot = new GLTFLoader();      
loaderEnemyShoot.load('/public/assets/Tiro_Inimigo.gltf', function (gltf) {
    setInterval(() => {
        enemyShoot = gltf.scene;
        enemyShoot.scale.set(0.06, 0.06, 0.06);
        enemyShoot.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
        scene.add(enemyShoot); // enemy spaceship shoot
    }, 1000);
});

const spotLight = new THREE.SpotLight( 0xffffff, 0.7 );
spotLight.position.set(0, 70, 8);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.5;
spotLight.decay = 1;
spotLight.distance = 0;

spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 60;

scene.add( spotLight );
scene.add( spotLight.target );

const spotLightHelper = new THREE.SpotLightHelper( spotLight );
scene.add( spotLightHelper );

const axesHelper = new THREE.AxesHelper( 50 );
scene.add( axesHelper );

const controls = new OrbitControls( camera, renderer.domElement );

let isTurningLeft = false;
let isTurningRight = false;

document.addEventListener('keydown', (event) => {
    const keyCode = event.keyCode;
    const moveDistance = 0.1; // Adjust this value to change the movement speed
    
    switch (keyCode) { 
        case 32: // Space key - shoot
            const loaderShoot = new GLTFLoader();
            loaderShoot.load('/public/assets/Tiro_jogoadorV4.gltf', function (gltf) {
                    shoot = gltf.scene;
                    shoot.position.set(spaceship.position.x, spaceship.position.y, spaceship.position.z);
                    shoot.scale.set(0.06, 0.06, 0.06);
                    scene.add(shoot); // spacebar = shoot that follows our spaceship
            });
            break;
            case 65: // A key
            spaceship.position.x -= moveDistance;
            isTurningLeft = true;
            break;
            case 68: // D key
            spaceship.position.x += moveDistance;
            isTurningRight = true;
            break;
            case 87: // W key
            spaceship.position.y += moveDistance;
            break;
            case 83: // S key
            const groundHeight = 0.25; // Adjust this value to change the ground height
            if (spaceship.position.y > groundHeight) {
                spaceship.position.y -= moveDistance;
            }   
            break;s
            case 65 && 87: // A and W keys (diagonal movement)
            spaceship.position.x -= moveDistance;
            spaceship.position.y += moveDistance;
            isTurningLeft = true;
            break;
            case 68 && 87: // D and W keys (diagonal movement)
            spaceship.position.x += moveDistance;
            spaceship.position.y += moveDistance;
            isTurningRight = true;
            break;
            case 65 && 83: // A and S keys (diagonal movement)
            spaceship.position.x -= moveDistance;
            spaceship.position.y -= moveDistance;
            isTurningLeft = true;
            break;
            case 68 && 83: // D and S keys (diagonal movement)
            spaceship.position.x += moveDistance;
            spaceship.position.y -= moveDistance;
            isTurningRight = true;
        }
    });
    document.addEventListener('keyup', (event) => {
        const keyCode = event.keyCode;
        
        switch (keyCode) {
            case 65: // A key
            isTurningLeft = false;
            spaceship.rotation.z = 0;
            break;
            case 68: // D key
            isTurningRight = false;
            spaceship.rotation.z = 0;
            break;
        }
    });
    
    function animate() {
        requestAnimationFrame( animate );
        renderer.render( scene, camera );

        if(enemy){
            enemy.position.x += inc;
            if(enemy.position.x >= 5){
                inc = -0.08; // enemy spaceship going to right limit
            }
            else if(enemy.position.x <= -5){
                inc = +0.08; // enemy spaceship going to left limit
            }
        }
        if (shoot){
            shoot.position.z -= 0.25; // adjust this value to change shoot speed
        }

        if (enemyShoot){
            enemyShoot.position.z += 0.25; // adjust this value to change shoot speed
        }

        if (isTurningLeft) {
            if (spaceship.rotation.z < Math.PI / 4) {
                spaceship.rotation.z += 0.001;
            }
        }
    
        if (isTurningRight) {
            if (spaceship.rotation.z > -Math.PI / 4) {
                spaceship.rotation.z -= 0.001;
            }
        }
    }
    
    animate();