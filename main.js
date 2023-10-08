import * as THREE from 'three';
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader  } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GrassField } from './grass.js';
import { Stars } from './star.js';
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
import { fireFly } from './firefly.js';

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
const emptySpaceBelow = 1.0;
let x;
let y;
let shaderMenuButton;
let shaderMenu;
let shaderMenuOut = false;
let desiredCamLookAt;
let currentCamLookAt;
let pageActive = true;
let shaderPassesDoc = document.querySelectorAll('.shaderPass');
let shadersDoc = document.querySelectorAll('.shader');
let shaderPipelineDoc = document.getElementById('ShaderPipelineList');
let shadersConDoc = document.getElementById('Shaders');
let currentDraggingUnit = null;
let isClone = false;
let deadzone = document.getElementById('deadzone');
let isOverShaderPipeline = false;


init();


animate();

function animate( ) {
    if(pageActive == false){return}
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

    currentCamLookAt.x = moveTowards(currentCamLookAt.x, desiredCamLookAt.x, .015*dt);
    currentCamLookAt.y = moveTowards(currentCamLookAt.y, desiredCamLookAt.y, .015*dt);
    camera.lookAt(currentCamLookAt);
    stats.update();
	composer.render( );
}

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / (window.innerHeight * emptySpaceBelow), 0.1, 1000 );
    camera.lookAt(new THREE.Vector3(0,0,-1));
    currentCamLookAt = new THREE.Vector3(0,0,-1);
    desiredCamLookAt = new THREE.Vector3(0,0,-1);
    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#bg'),
        antialias: true,
    });
    renderer.setSize( window.innerWidth, window.innerHeight * emptySpaceBelow);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1));
    renderer.shadowMap.enabled = false;
    renderer.toneMappingExposure = .1;
    stats = createStats();

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set(.1,1,-.2);
    scene.add( directionalLight );

    // cube and plane
    const geometry = new THREE.PlaneGeometry( 200, 200 );
    const planeMaterial = new THREE.MeshBasicMaterial( { color: 0x092016 } );
    const material = new THREE.MeshStandardMaterial( { color: 0x006a7d } );
    const cubeMaterial = new THREE.MeshStandardMaterial( { color: 0x006a7d } );
    const unlitMaterial = new THREE.MeshStandardMaterial( { emissive : 0xfef6ab , emissiveIntensity: 3} );
    const plane = new THREE.Mesh( geometry, planeMaterial );
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
    for(let i = 0; i < 25; i++){
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



    // events
    shaderMenuButton = document.getElementById('shaderMenuButton');
    shaderMenuButton.addEventListener("click", shaderMenuButtonClicked)
    shaderMenu = document.getElementById('shaderMenu');
    renderer.domElement.onmousemove = moveCamera;
    document.addEventListener("visibilitychange", (event) => {
        if (document.visibilityState == "visible") {
            pageActive = true;
            animate();
        } else {
            pageActive = false;
        }
      });
    window.addEventListener( 'resize', onWindowResize );

    shaderPipelineDoc.addEventListener('dragover', dragOverPipline);
    shaderPipelineDoc.addEventListener('dragleave', dragLeavePipline);


    shaderPassesDoc.forEach(shaderPassDoc => {
        shaderPassDoc.addEventListener('dragstart', dragStartShaderPass);
        shaderPassDoc.addEventListener('dragend', dragEndShaderPass);
        shaderPassDoc.getElementsByTagName('button')[0].addEventListener('click', deleteItem);
    })
    shadersDoc.forEach(shaderDoc => {
        shaderDoc.addEventListener('dragstart', dragStartShader);
        shaderDoc.addEventListener('dragend', dragEndShader);
        shaderDoc.getElementsByTagName('button')[0].addEventListener('click', deleteItem);
    })

    shaderPassesDoc = [...shaderPassesDoc];

    // post
    postprocessingPasses = []
    postprocessingPasses.push(new RenderPass( scene, camera ));
    postprocessingPasses.push(new OutputPass());
    postprocessingPasses.push(new ShaderPass( LuminosityShader ));
    postprocessingPasses.push(new ShaderPass( DotScreenShader ));
    postprocessingPasses.push(new ShaderPass( RGBShiftShader ));
    postprocessingPasses.push(new BokehPass( scene, camera, {focus: 0.0,  aspect : camera.aspect, maxblur: .0015, aperture: 0.05 } ));
    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight * emptySpaceBelow ), 0.35, 0.5, 0.85 );
    postprocessingPasses.push(bloomPass);
    postprocessingPasses.push(new ShaderPass(GammaCorrectionShader));  
    // ect

    setupComposer();

}

function setupComposer(){
    composer = new EffectComposer( renderer );
    composer.addPass(postprocessingPasses[0]);
    for(let i = 0; i < shaderPassesDoc.length; i++){
        composer.addPass(postprocessingPasses[parseInt(shaderPassesDoc[i].id)]);
    }
    composer.addPass(postprocessingPasses[1]);

}

function onWindowResize() {
    camera.aspect = window.innerWidth / (window.innerHeight * emptySpaceBelow);
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight * emptySpaceBelow );
    composer.setSize( window.innerWidth, window.innerHeight * emptySpaceBelow );
}

function moveCamera(e){
    x = (e.offsetX/window.innerWidth - 0.5) * 7.0;
    y = (e.offsetY/(window.innerHeight * emptySpaceBelow) - 0.82) * 5.5;
    desiredCamLookAt = new THREE.Vector3(x,-y,-1);
}

function deleteItem(){
    this.parentElement.remove();
    shaderPassesDoc = [...document.querySelectorAll('.shaderPass')];
    setupComposer();
}

function getDragAfterElement(container, y){
    return shaderPassesDoc.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if(offset < 0 && offset > closest.offset){
            return {offset: offset, element: child};
        }else{
            return closest;
        }
    }, {offset: Number.NEGATIVE_INFINITY}).element;
}

function dragOverPipline(e){
    e.preventDefault();
    let afterElement = getDragAfterElement(this, e.clientY);
    if(afterElement == null){
        this.appendChild(currentDraggingUnit);
    }else{
        this.insertBefore(currentDraggingUnit, afterElement);
    }
    isOverShaderPipeline = true;
}

function dragLeavePipline(){
    isOverShaderPipeline = false;
}

function dragStartShader(){
    this.classList.add('dragging');
    currentDraggingUnit = this.cloneNode(true);
    currentDraggingUnit.addEventListener('dragstart', dragStartShaderPass);
    currentDraggingUnit.addEventListener('dragend', dragEndShaderPass);
    currentDraggingUnit.getElementsByTagName('button')[0].addEventListener('click', deleteItem);
    currentDraggingUnit.getElementsByTagName('button')[0].style.scale = '100%';
    isClone = true;
}

function dragStartShaderPass(){
    this.classList.add('dragging');
    currentDraggingUnit = this;
    isClone = false;
}

function dragEndShader(){
    this.classList.remove('dragging');
    if(!isOverShaderPipeline){
        currentDraggingUnit.remove();
    }else{
        currentDraggingUnit.classList.remove('dragging');
        currentDraggingUnit.classList.add('shaderPass');
        shaderPassesDoc = [...document.querySelectorAll('.shaderPass')];
        currentDraggingUnit = null;
        setupComposer();
    }
}

function dragEndShaderPass(){
    this.classList.remove('dragging');
    currentDraggingUnit = null;
    shaderPassesDoc = [...document.querySelectorAll('.shaderPass')];
    setupComposer();
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

function shaderMenuButtonClicked(){
    if(shaderMenuOut){
        shaderMenu.style.left = '100%';
        shaderMenuButton.style.left = '95%';
        shaderMenuOut = false;
    }
    else{
        shaderMenu.style.left = '80%';
        shaderMenuButton.style.left = '75%';
        shaderMenuOut = true;
    }
}

function moveTowards(num1, num2, maxSpeed){
    if(num1 > num2){return Math.max( num1 - maxSpeed, num2);}
    else{return Math.min( num1 + maxSpeed, num2);}
}