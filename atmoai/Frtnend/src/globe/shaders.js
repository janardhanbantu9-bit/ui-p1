// 1. Atmosphere Shader (Glow effect on the edge of the sphere)
        const atmosphereVertexShader = `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        const atmosphereFragmentShader = `
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
                gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0) * intensity * 1.5;
            }
        `;

        // 2. Procedural Data Shader (Temp, Precip, Wind, Anomaly overlays)
        const dataVertexShader = `
            varying vec2 vUv;
            varying vec3 vPosition;
            void main() {
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        
        const dataFragmentShader = `
            uniform float uTime;
            uniform int uLayerType;
            uniform float uOpacity;
            
            varying vec2 vUv;
            varying vec3 vPosition;

            vec3 hash33(vec3 p) { 
                p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
                          dot(p,vec3(269.5,183.3,246.1)),
                          dot(p,vec3(113.5,271.9,124.6)));
                return -1.0 + 2.0*fract(sin(p)*4375.5453123);
            }

            float noise(vec3 p) {
                vec3 i = floor(p + dot(p, vec3(0.333333)) );
                vec3 x0 = p - i + dot(i, vec3(0.166666)) ;
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min( g.xyz, l.zxy );
                vec3 i2 = max( g.xyz, l.zxy );
                vec3 x1 = x0 - i1 + 0.166666;
                vec3 x2 = x0 - i2 + 0.333333;
                vec3 x3 = x0 - 1.0 + 0.5;
                vec3 n = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
                n = n*n; n = n*n;
                vec3 n2 = max(0.6 - vec3(dot(x3,x3), 0.0, 0.0), 0.0);
                n2 = n2*n2; n2 = n2*n2;
                return dot(vec4(n, n2.x), vec4(dot(hash33(i),x0), dot(hash33(i+i1),x1), dot(hash33(i+i2),x2), dot(hash33(i+1.0),x3))) * 32.0;
            }

            float fbm(vec3 p) {
                float f = 0.0;
                float amp = 0.5;
                for(int i=0; i<4; i++) {
                    f += amp * noise(p);
                    p *= 2.0;
                    amp *= 0.5;
                }
                return f;
            }

            void main() {
                if (uLayerType == 0 || uOpacity <= 0.0) {
                    discard;
                }
                vec3 p = normalize(vPosition) * 3.0;
                vec3 color = vec3(0.0);
                float alpha = 0.0;

                if (uLayerType == 1) {
                    // Temperature
                    float latBase = 1.0 - abs(vUv.y - 0.5) * 2.0;
                    float n = fbm(p + uTime * 0.05) * 0.3;
                    float tempVal = clamp(latBase + n, 0.0, 1.0);
                    if (tempVal < 0.25) color = mix(vec3(0,0,0.8), vec3(0,0.8,1), tempVal*4.0);
                    else if (tempVal < 0.5) color = mix(vec3(0,0.8,1), vec3(0.8,1,0), (tempVal-0.25)*4.0);
                    else if (tempVal < 0.75) color = mix(vec3(0.8,1,0), vec3(1,0.5,0), (tempVal-0.5)*4.0);
                    else color = mix(vec3(1,0.5,0), vec3(0.8,0,0), (tempVal-0.75)*4.0);
                    alpha = uOpacity * 0.7;
                } else if (uLayerType == 2) {
                    // Precipitation
                    float n = fbm(p * 2.0 + vec3(uTime * 0.1, 0, 0));
                    n = smoothstep(0.3, 0.8, n);
                    color = mix(vec3(0.1, 0.5, 0.8), vec3(0.0, 1.0, 0.5), n);
                    alpha = n * uOpacity * 0.8;
                } else if (uLayerType == 3) {
                    // Wind/Pressure
                    float n1 = fbm(p * vec3(1.0, 4.0, 1.0) + vec3(uTime * 0.2, 0, 0));
                    float n2 = sin(n1 * 20.0);
                    float val = smoothstep(0.8, 1.0, n2);
                    color = vec3(0.8, 0.9, 1.0);
                    alpha = val * uOpacity * 0.6;
                } else if (uLayerType == 4) {
                    // Anomaly
                    float n = fbm(p * 1.5);
                    if (n > 0.0) {
                        color = mix(vec3(1.0, 0.9, 0.8), vec3(1.0, 0.2, 0.2), n*2.0);
                    } else {
                        color = mix(vec3(0.8, 0.9, 1.0), vec3(0.2, 0.4, 1.0), -n*2.0);
                    }
                    alpha = abs(n) * uOpacity * 0.8;
                }

                gl_FragColor = vec4(color, alpha);
            }
        `;
        