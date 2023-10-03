import * as THREE from 'three';


class fireFly{


    constructor(mesh, pointlight){
        this.Startpos = JSON.parse(JSON.stringify(mesh.position));
        this.pos = JSON.parse(JSON.stringify(mesh.position));
        this.mesh = mesh;
        this.pointlight = pointlight;
        this.hasPoint = false;
        this.point = new THREE.Vector3(0,0,0);
        this.speed = .001;
    }

    update(dt){
        while(this.hasPoint == false){
            let dir =  new THREE.Vector3( Math.random() * 2 - 1, 0, Math.random() * 2 - 1 );
            dir = dir.normalize();
            let distance = Math.random() * 4.0 + 6.0;
            dir.multiplyScalar(distance).add(this.pos);
            let d = this.Startpos.x * this.Startpos.x - dir.x * dir.x  + dir.y * dir.y - this.Startpos.y * this.Startpos.y + dir.z * dir.z - this.Startpos.z * this.Startpos.z;
            if ( d < 77.0 ){
                this.point.x = dir.x;
                this.point.y = dir.y;
                this.point.z = dir.z;
                this.hasPoint = true;
            }
        }
        let velocity = new THREE.Vector3(this.point.x - this.pos.x, this.point.y - this.pos.y,this.point.z - this.pos.z);
        velocity.normalize();
        velocity.multiplyScalar(this.speed * dt).add(this.pos);
        this.pos.x = velocity.x;
        this.pos.y = velocity.y;
        this.pos.z = velocity.z;
        if( this.pos.x * this.pos.x - this.point.x * this.point.x  + this.point.y * this.point.y - this.pos.y * this.pos.y + this.point.z * this.point.z - this.pos.z * this.pos.z < 1.0){
            this.hasPoint = false;
        }
        this.mesh.position.x = this.pos.x;
        this.mesh.position.y = this.pos.y;
        this.mesh.position.z = this.pos.z;
        this.pointlight.position.x = this.pos.x;
        this.pointlight.position.y = this.pos.y;
        this.pointlight.position.z = this.pos.z;    
    }
}

export{fireFly};