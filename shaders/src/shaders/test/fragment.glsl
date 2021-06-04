uniform vec3 uColor;
uniform sampler2D uTexture;

varying vec2 vUv;

void main()
{
    gl_FragColor = vec4(vUv.x-0.1,vUv.y-1.0, 0.0, 1.0);
}