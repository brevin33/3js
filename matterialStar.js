import * as THREE from 'three';



const Star_VS = 
/*glsl*/`
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec3 position;
attribute vec3 terrPosi;
attribute float angle;
attribute vec3 normal;

vec4 quat_from_axis_angle(vec3 axis, float angle){ 
    vec4 qr;
    float half_angle = (angle * 0.5) * 3.14159 / 180.0;
    qr.x = axis.x * sin(half_angle);
    qr.y = axis.y * sin(half_angle);
    qr.z = axis.z * sin(half_angle);
    qr.w = cos(half_angle);
    return qr;
}

vec3 rotate_vertex_position(vec3 position, vec3 axis, float angle){

    vec4 q = quat_from_axis_angle(axis, angle);
    vec3 v = position.xyz;
    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);

}

void main()
{
    vec3 finalPosi = position + terrPosi;

    vec3 axis = vec3(0.0,1.0,0.0);

    finalPosi = rotate_vertex_position(finalPosi,axis,angle);

    vec4 realPos = viewMatrix * modelMatrix * vec4(finalPosi, 1.0);

    gl_Position = projectionMatrix * realPos;
}

`// glsl end


const Star_FS = 
/*glsl*/`
precision mediump float;


float distSquared( vec3 A, vec3 B )
  {
  
      vec3 C = A - B;
      return dot( C, C );
  
  }

void main()
{
    gl_FragColor = vec4(2,2,2,1);
}
` // glsl end

function StarShaderMaterial(){

    const uniforms = {
    };

    const basicShaderMaterial = new THREE.RawShaderMaterial( {
        uniforms: uniforms,
        vertexShader: Star_VS,
        fragmentShader: Star_FS,
        side: THREE.DoubleSide,
    });

    return basicShaderMaterial;
}

export{StarShaderMaterial};