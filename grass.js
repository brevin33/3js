import * as THREE from 'three';
import { GrassShaderMaterial } from './matterialGrass.js';

class GrassField extends THREE.Group {

    constructor(){
        super();

        this.grassMat = new THREE.MeshBasicMaterial( {color: 0x00ff00 });

        this.instances = 30000;

        this.z = -22;

        this.w = 100;
        this.d = 100;
        this.h = -1.3;

        this.positions = [];
        this.indexs = [];
        this.uvs = [];
        this.terrPosis = [];
        this.angles = [];

        this.grassGeo;
        this.grassParticles;
        this.createParticles();
    }

    createParticles(){

        const height = 1.2;
        const width = 0.2;

        this.positions.push( 0, height, 0 );
        this.positions.push( width, -height, width );
        this.positions.push( -width, -height, width );
        this.positions.push( width, -height, -width );
        this.positions.push( -width, -height, -width );
        this.positions.push( -width, -height, width );
        this.positions.push( -width, -height, -width );
        this.positions.push( width, -height, width );
        this.positions.push( width, -height, -width );

        this.indexs.push(0);
        this.indexs.push(1);
        this.indexs.push(2);
        this.indexs.push(0);
        this.indexs.push(3);
        this.indexs.push(4);
        this.indexs.push(0);
        this.indexs.push(5);
        this.indexs.push(6);
        this.indexs.push(0);
        this.indexs.push(7);
        this.indexs.push(8);

        this.uvs.push(1.0, 0.0);
        this.uvs.push(0.0, 0.0);
        this.uvs.push(0.5, 1.0);
        this.uvs.push(0.0, 0.0);
        this.uvs.push(0.5, 1.0);
        this.uvs.push(0.0, 0.0);
        this.uvs.push(0.5, 1.0);
        this.uvs.push(0.0, 0.0);
        this.uvs.push(0.5, 1.0);

        for(let i = 0; i < this.instances ; i++){
            let posX = Math.random() * this.w - this.w/2;
            let posY = this.h;
            let posZ = Math.random() * this.d - this.d/2 + this.z;

            this.terrPosis.push(posX,posY,posZ);

            let angle = Math.random() * 45.0;
            this.angles.push(angle);
        }

        this.grassGeo = new THREE.InstancedBufferGeometry();
        this.grassGeo.instanceCount = this.instances;

        this.grassGeo.setAttribute( 'position', new THREE.Float32BufferAttribute( this.positions, 3 ) );
        this.grassGeo.setAttribute( 'uv', new THREE.Float32BufferAttribute( this.uvs, 2 ) );
        this.grassGeo.setIndex(new THREE.BufferAttribute(new Uint16Array( this.indexs ), 1));    

        this.grassGeo.setAttribute( 'terrPosi', new THREE.InstancedBufferAttribute( new Float32Array( this.terrPosis ), 3 ) );
        this.grassGeo.setAttribute( 'angle', new THREE.InstancedBufferAttribute( new Float32Array( this.angles ), 1 ) );

        const grassMat = GrassShaderMaterial();

        this.grassParticles = new THREE.Mesh( this.grassGeo, grassMat );
        this.grassParticles.frustumCulled = false;
        this.add( this.grassParticles );
    
    }

    update(dt){

        let t = this.grassParticles.material.uniforms.time.value + dt;
        this.grassParticles.material.uniforms.time.value = t;
    }

}

export{GrassField};