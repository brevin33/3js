import * as THREE from 'three';

import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

import { FBXLoader  } from 'three/examples/jsm/loaders/FBXLoader.js';

import { GrassField } from './grass.js';



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.lookAt(new THREE.Vector3(0,-.3,1));

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
//document.body.appendChild( renderer.domElement );

const geometry = new THREE.PlaneGeometry( 200, 200 );
const planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00614d } );
const material = new THREE.MeshStandardMaterial( { color: 0x006a7d } );
const cubeMaterial = new THREE.MeshStandardMaterial( { color: 0x006a7d } );
const plane = new THREE.Mesh( geometry, planeMaterial );
plane.receiveShadow = true;
plane.rotation.x = - Math.PI / 2;
plane.position.set(0,0-2.6,-22)
plane.scale.set(.5,.5,.5);
scene.add( plane );

const box = new THREE.BoxGeometry( 1, 1, 1 );
const cube = new THREE.Mesh( box, cubeMaterial );
cube.scale.set(5.5,5.5,5.5);
cube.position.set(0,4,-13);
scene.add( cube );

const grassField = new GrassField();
scene.add(grassField);

const dirLight = new THREE.DirectionalLight( 0xffffff, 5 );
dirLight.position.set( 100, 200, 100 );
dirLight.castShadow = true;
dirLight.shadow.camera.top = 180;
dirLight.shadow.camera.bottom = - 100;
dirLight.shadow.camera.left = - 120;
dirLight.shadow.camera.right = 120;
scene.add( dirLight );

const pointLight = new THREE.PointLight(0xffffff);
scene.add( pointLight );


const ambientLight = new THREE.AmbientLight( 0xffffff, .5 );
scene.add( ambientLight );

const loader = new FBXLoader();

loader.load( './pillar.fbx', function ( object ) {
    const loadedMesh = new THREE.Mesh( object.children[0].geometry, material );
    const loadedMesh2 = new THREE.Mesh( object.children[0].geometry, material );
    const loadedMesh3 = new THREE.Mesh( object.children[0].geometry, material );
    const loadedMesh4 = new THREE.Mesh( object.children[0].geometry, material );
    loadedMesh.castShadow = true;
    loadedMesh2.castShadow = true;
    loadedMesh3.castShadow = true;
    loadedMesh4.castShadow = true;
    let height = 5;
    let width = 1;
    loadedMesh.scale.set(width,width,height);
    loadedMesh2.scale.set(width,width,height);
    loadedMesh3.scale.set(width,width,height);
    loadedMesh4.scale.set(width,width,height);
    loadedMesh.rotateOnAxis(new THREE.Vector3(1,0,0), 1.571);
    loadedMesh2.rotateOnAxis(new THREE.Vector3(1,0,0), 1.571);
    loadedMesh3.rotateOnAxis(new THREE.Vector3(1,0,0), 1.571);
    loadedMesh4.rotateOnAxis(new THREE.Vector3(1,0,0), 1.571);
    loadedMesh.position.set(10,0,-17);
    scene.add( loadedMesh );
    loadedMesh2.position.set(-10,0,-17);
    scene.add( loadedMesh2 );
    loadedMesh3.position.set(10,0,-4.5);
    scene.add( loadedMesh3 );
    loadedMesh4.position.set(-10,0,-4.5);
    scene.add( loadedMesh4 );
}, undefined, function ( error ) {
    console.error( error );
} );

camera.position.z = 5;
camera.position.y = .2;

const controls = new OrbitControls(camera, renderer.domElement)


let d = new Date();
var time = d.getTime(); 

function animate( ) {
	requestAnimationFrame( animate );
    let d = new Date();
    let dt = d.getTime() - time; 
    time = d.getTime();
	cube.rotation.x += .00055 * dt;
	cube.rotation.y += .00055 * dt;
    if( grassField ){
        grassField.update( dt )
    }
	renderer.render( scene, camera );
}


animate();