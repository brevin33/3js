import * as THREE from 'three';
import { StarShaderMaterial } from './matterialStar';
class Stars extends THREE.Group {

    constructor(){
        super();

        this.starMat = new THREE.MeshBasicMaterial( {color: 0x00ff00 });

        this.instances = 1000;

        this.z = -22;

        this.w = 200;
        this.d = 100;
        this.h = -1.5;

        this.positions = [];
        this.indexs = [];
        this.terrPosis = [];
        this.angles = [];

        this.starGeo;
        this.starParticles;
        this.createParticles();
    }

    createParticles(){



        this.positions.push( 1, 0, 0 );
        this.positions.push( -1, 0, 0 );
        this.positions.push( 0, 1, 0 );

        this.indexs.push(0);
        this.indexs.push(1);
        this.indexs.push(2);


        for(let i = 0; i < this.instances ; i++){

            let dir =  new THREE.Vector3( Math.random() - .5, Math.random()/3, Math.random() - .9 );
            dir.normalize();
            let distance = Math.random() * 200.0 + 190.0;
            dir.multiplyScalar(distance);

            let posX = dir.x;
            let posY = dir.y;
            let posZ = dir.z;

            this.terrPosis.push(posX,posY,posZ);

            let angle = Math.random() * 360.0;
            this.angles.push(angle);
        }

        this.starGeo = new THREE.InstancedBufferGeometry();
        this.starGeo.instanceCount = this.instances;

        this.starGeo.setAttribute( 'position', new THREE.Float32BufferAttribute( this.positions, 3 ) );
        this.starGeo.setIndex(new THREE.BufferAttribute(new Uint16Array( this.indexs ), 1));    

        this.starGeo.setAttribute( 'terrPosi', new THREE.InstancedBufferAttribute( new Float32Array( this.terrPosis ), 3 ) );
        this.starGeo.setAttribute( 'angle', new THREE.InstancedBufferAttribute( new Float32Array( this.angles ), 1 ) );

        const starMat = StarShaderMaterial();

        this.starParticles = new THREE.Mesh( this.starGeo, starMat );
        this.starParticles.frustumCulled = false;
        this.add( this.starParticles );
    
    }

    update(dt){

    }

}

export{Stars};