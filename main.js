import * as THREE from 'three';
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader  } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GrassField } from './grass.js';
import { Stars } from './star.js';
import { fireFly } from './firefly.js';
import {WebGLRenderTarget, HalfFloatType} from 'three';
import Stats from 'stats.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { LuminosityShader } from 'three/addons/shaders/LuminosityShader.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { DotScreenShader } from 'three/addons/shaders/DotScreenShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import {BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';


let renderer;
let grassField;
let cube;
let fireFlys;
let stats;
let scene;
let camera;
let d;
let dt;
let time;
let composer;
let postprocessingPasses;
const emptySpaceBelow = 25;
let x;
let y;
init();

animate();



function animate( ) {
	requestAnimationFrame( animate );
    d = new Date();
    dt = d.getTime() - time; 
    time = d.getTime();
	cube.rotation.x += .0002 * dt;
	cube.rotation.y += .0002 * dt;
    if( grassField ){
        grassField.update( dt )
    }

    for(let i = 0; i < fireFlys.length; i++){
        fireFlys[i].update(dt);
    }

    stats.update();
	composer.render( );
}

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / (window.innerHeight - emptySpaceBelow), 0.1, 1000 );
    stats  = createStats();
    camera.lookAt(new THREE.Vector3(0,0,-1));
    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#bg'),
        antialias: true,
    });
    renderer.setSize( window.innerWidth, window.innerHeight - emptySpaceBelow);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.toneMappingExposure = .1;

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.04 );
    scene.add( directionalLight );

    // cube and plane
    const geometry = new THREE.PlaneGeometry( 200, 200 );
    const planeMaterial = new THREE.MeshBasicMaterial( { color: 0x092016 } );
    const material = new THREE.MeshStandardMaterial( { color: 0x006a7d } );
    const cubeMaterial = new THREE.MeshStandardMaterial( { color: 0x006a7d } );
    const unlitMaterial = new THREE.MeshStandardMaterial( { emissive : 0xfef6ab , emissiveIntensity: 3} );
    const plane = new THREE.Mesh( geometry, planeMaterial );
    plane.receiveShadow = true;
    plane.rotation.x = - Math.PI / 2;
    plane.position.set(0,0-2.6,-22)
    plane.scale.set(.5,.5,.5);
    scene.add( plane );

    const box = new THREE.BoxGeometry( 1, 1, 1 );
    cube = new THREE.Mesh( box, cubeMaterial );
    cube.scale.set(5.5,5.5,5.5);
    cube.position.set(0,4,-13);
    scene.add( cube );

    // grass
    grassField = new GrassField();
    scene.add(grassField);

    // stars
    const stars = new Stars();
    scene.add(stars);

    // fireflys
    fireFlys = [];
    const body = new THREE.Mesh( box, unlitMaterial );
    const fireFlySize = .15;
    body.scale.set(fireFlySize,fireFlySize,fireFlySize);
    const x = 0;
    const z = -2;
    const y = .4;
    body.position.set(x - .8, y, z);
    scene.add(body);
    const pointLight = new THREE.PointLight(0xfefaad, 1.5, 10, .3);
    pointLight.position.set(x, y, z);
    scene.add( pointLight );
    const body2 = new THREE.Mesh( box, unlitMaterial );
    body2.scale.set(fireFlySize,fireFlySize,fireFlySize);
    body2.position.set(x + .8, y, z);
    scene.add(body2);
    const pointLight2 = new THREE.PointLight(0xfefaad, 1.5, 10, .3);
    pointLight.position.set(x, y, z);
    scene.add( pointLight2 );
    fireFlys.push(new fireFly(body2, pointLight2));
    fireFlys.push(new fireFly(body, pointLight));
    for(let i = 0; i < 20; i++){
        const body = new THREE.Mesh( box, unlitMaterial );
        const fireFlySize = .15;
        body.scale.set(fireFlySize,fireFlySize,fireFlySize);
        const x = Math.random() * 70 - 35;
        const z = Math.random() * 44 - 40;
        body.position.set(x, y, z);
        scene.add(body);
        const pointLight = new THREE.PointLight(0xfefaad, 1.5, 10, .3);
        pointLight.position.set(x, y, z);
        scene.add( pointLight );
        fireFlys.push(new fireFly(body, pointLight));
    }

    const ambientLight = new THREE.AmbientLight( 0xffffff, .2 );
    scene.add( ambientLight );

    // pillars
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
        let height = 3.3;
        let width = 1;
        loadedMesh.scale.set(width,width,height);
        loadedMesh2.scale.set(width,width,height);
        loadedMesh3.scale.set(width,width,height);
        loadedMesh4.scale.set(width,width,height);
        loadedMesh.rotateOnAxis(new THREE.Vector3(1,0,0), 1.571);
        loadedMesh2.rotateOnAxis(new THREE.Vector3(1,0,0), 1.571);
        loadedMesh3.rotateOnAxis(new THREE.Vector3(1,0,0), 1.571);
        loadedMesh4.rotateOnAxis(new THREE.Vector3(1,0,0), 1.571);
        loadedMesh.position.set(10,1.6,-17);
        scene.add( loadedMesh );
        loadedMesh2.position.set(-10,1.6,-17);
        scene.add( loadedMesh2 );
        loadedMesh3.position.set(10,1.6,-4.5);
        scene.add( loadedMesh3 );
        loadedMesh4.position.set(-10,1.6,-4.5);
        scene.add( loadedMesh4 );
    }, undefined, function ( error ) {
        console.error( error );
    } );

    camera.position.z = 5;
    camera.position.y = .2;

    //const controls = new OrbitControls(camera, renderer.domElement)

    d = new Date();
    time = d.getTime(); 

    renderer.domElement.onmousemove = moveCamera;


    window.addEventListener( 'resize', onWindowResize );

    // post
    postprocessingPasses = []
    postprocessingPasses.push(new RenderPass( scene, camera ));
    postprocessingPasses.push(new OutputPass());
    postprocessingPasses.push(new ShaderPass( LuminosityShader ));
    postprocessingPasses.push(new ShaderPass( DotScreenShader ));
    postprocessingPasses.push(new ShaderPass( RGBShiftShader ));
    postprocessingPasses.push(new BokehPass( scene, camera, {focus: 0.0,  aspect : camera.aspect, maxblur: .0015, aperture: 0.05 } ));
    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight - emptySpaceBelow ), 0.35, 0.5, 0.85 );
    postprocessingPasses.push(bloomPass);
    postprocessingPasses.push(new ShaderPass(GammaCorrectionShader));  
    // ect

    composer = new EffectComposer( renderer );
    composer.addPass(postprocessingPasses[0]);
    composer.addPass(postprocessingPasses[7]);
    composer.addPass(postprocessingPasses[7]);

    composer.addPass(postprocessingPasses[6]);
    composer.addPass(postprocessingPasses[6]);
    
    composer.addPass(postprocessingPasses[1]);

}

function onWindowResize() {
    camera.aspect = window.innerWidth / (window.innerHeight - emptySpaceBelow);
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight - emptySpaceBelow );
    composer.setSize( window.innerWidth, window.innerHeight - emptySpaceBelow );
}

function moveCamera(e){
    x = (e.offsetX/window.innerWidth - 0.5) * 7.0;
    y = (e.offsetY/(window.innerHeight - emptySpaceBelow) - 0.82) * 5.5;
    camera.lookAt(new THREE.Vector3(x,-y,-1));
}

function createStats() {
    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0';
    stats.domElement.style.top = '0';
    document.body.appendChild(stats.dom)
    return stats;
}
