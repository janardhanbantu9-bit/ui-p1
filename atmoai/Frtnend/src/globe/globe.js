export const GLOBE_RADIUS = 100;
class GlobeEngine {
    
            constructor(containerId, onLocationSelect) {
                this.container = document.getElementById(containerId);
                this.onLocationSelect = onLocationSelect;
                this.init();
            }

            init() {
                // Scene setup - Transparent background so HTML color shows through
                this.scene = new THREE.Scene();
                this.scene.background = null; 

                // Camera setup
                this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
                this.camera.position.set(0, 0, 280);

                // Renderer setup
                this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.container.appendChild(this.renderer.domElement);

                // Controls
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.enablePan = false;
                this.controls.minDistance = 120;
                this.controls.maxDistance = 400;

                // Lighting (Bright enough to illuminate fallback colors if textures fail)
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
                this.scene.add(ambientLight);

                this.sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
                this.sunLight.position.set(500, 300, 500);
                this.scene.add(this.sunLight);

                // Groups
                this.earthGroup = new THREE.Group();
                this.scene.add(this.earthGroup);
                
                this.markersGroup = new THREE.Group();
                this.earthGroup.add(this.markersGroup);

                this.createLayers();
                this.setupInteraction();

                // Animation Loop
                this.clock = new THREE.Clock();
                this.animate = this.animate.bind(this);
                this.animate();

                // Resize handler
                window.addEventListener('resize', this.onWindowResize.bind(this), false);
            }

            createLayers() {
                const textureLoader = new THREE.TextureLoader();
                const radius = 100;
                const segments = 64;

                // 1. Earth Base - Ensure a fallback color exists to guarantee rendering
                const earthGeo = new THREE.SphereGeometry(radius, segments, segments);
                const earthMat = new THREE.MeshPhongMaterial({
                    color: 0x051535, // Solid dark blue fallback 
                    emissive: 0x01020a,
                    shininess: 15
                });
                this.earthBase = new THREE.Mesh(earthGeo, earthMat);
                this.earthGroup.add(this.earthBase);

                // Async load textures to enhance the base once available
                textureLoader.load('./Frtnend/src/globe/assets/earth-blue-marble.jpg', (tex) => {
                    earthMat.map = tex;
                    earthMat.color.setHex(0xffffff); // Reset fallback color when texture loads
                    earthMat.needsUpdate = true;
                });

                // 2. Clouds
                const cloudGeo = new THREE.SphereGeometry(radius + 0.5, segments, segments);
                const cloudMat = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.0, // Hidden until texture loads
                    blending: THREE.AdditiveBlending,
                    side: THREE.DoubleSide
                });
                this.clouds = new THREE.Mesh(cloudGeo, cloudMat);
                this.earthGroup.add(this.clouds);
                
                textureLoader.load('./Frtnend/src/globe/assets/clouds.png', (tex) => {
                    cloudMat.map = tex;
                    cloudMat.opacity = 0.8;
                    cloudMat.needsUpdate = true;
                });

                // 3. Atmosphere Glow
                const atmosGeo = new THREE.SphereGeometry(radius + 2, segments, segments);
                const atmosMat = new THREE.ShaderMaterial({
                    vertexShader: atmosphereVertexShader,
                    fragmentShader: atmosphereFragmentShader,
                    blending: THREE.AdditiveBlending,
                    side: THREE.BackSide,
                    transparent: true
                });
                this.atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
                this.earthGroup.add(this.atmosphere);

                // 4. Data Layer (Shader)
                const dataGeo = new THREE.SphereGeometry(radius + 0.2, segments, segments);
                this.dataUniforms = {
                    uTime: { value: 0.0 },
                    uLayerType: { value: 0 },
                    uOpacity: { value: 1.0 }
                };
                const dataMat = new THREE.ShaderMaterial({
                    vertexShader: dataVertexShader,
                    fragmentShader: dataFragmentShader,
                    uniforms: this.dataUniforms,
                    transparent: true,
                    depthWrite: false
                });
                this.dataLayer = new THREE.Mesh(dataGeo, dataMat);
                this.earthGroup.add(this.dataLayer);
                
                this.createStars();
            }
            
            createStars() {
                const starsGeometry = new THREE.BufferGeometry();
                const starsMaterial = new THREE.PointsMaterial({color: 0xffffff, size: 0.5, transparent: true, opacity: 0.6});
                const starsVertices = [];
                for(let i = 0; i < 2000; i++) {
                    const x = THREE.MathUtils.randFloatSpread(2000);
                    const y = THREE.MathUtils.randFloatSpread(2000);
                    const z = THREE.MathUtils.randFloatSpread(2000);
                    if(Math.sqrt(x*x + y*y + z*z) > 300) {
                        starsVertices.push(x, y, z);
                    }
                }
                starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
                const starField = new THREE.Points(starsGeometry, starsMaterial);
                this.scene.add(starField);
            }

            setupInteraction() {
                this.raycaster = new THREE.Raycaster();
                this.mouse = new THREE.Vector2();

                this.renderer.domElement.addEventListener('click', (event) => {
                    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                    this.raycaster.setFromCamera(this.mouse, this.camera);
                    const intersects = this.raycaster.intersectObject(this.earthBase);

                    if (intersects.length > 0) {
                        const hitPoint = intersects[0].point;
                        const r = 100;
                        const lat = Math.asin(hitPoint.y / r) * (180 / Math.PI);
                        const lon = Math.atan2(hitPoint.x, hitPoint.z) * (180 / Math.PI);
                        
                        this.addMarker(lat, lon);
                        
                        if (this.onLocationSelect) {
                            let name = "Selected Coordinates";
                            if (lat > 8 && lat < 37 && lon > 68 && lon < 97) name = "India Subcontinent";
                            else if (lat > 25 && lat < 49 && lon > -125 && lon < -66) name = "North America";
                            else if (lat > 35 && lat < 71 && lon > -10 && lon < 40) name = "Europe";
                            else if (lat > -40 && lat < 5 && lon > -80 && lon < -35) name = "South America";

                            this.onLocationSelect({
                                lat: lat.toFixed(2),
                                lon: lon.toFixed(2),
                                name: name
                            });
                        }
                    }
                });
            }

            setLayer(typeStr) {
                const typeMap = { 'none': 0, 'temperature': 1, 'precipitation': 2, 'wind': 3, 'anomaly': 4 };
                const newType = typeMap[typeStr] !== undefined ? typeMap[typeStr] : 0;
                this.dataUniforms.uLayerType.value = newType;
                
                // Dim earth base slightly if a data layer is active to make it pop
                if (newType !== 0) {
                    this.earthBase.material.color.setHex(this.earthBase.material.map ? 0x888888 : 0x020815);
                    this.clouds.material.opacity = 0.1;
                } else {
                    this.earthBase.material.color.setHex(this.earthBase.material.map ? 0xffffff : 0x051535);
                    if(this.clouds.material.map) this.clouds.material.opacity = 0.8;
                }
            }

            addMarker(lat, lon) {
                while(this.markersGroup.children.length > 0){ 
                    this.markersGroup.remove(this.markersGroup.children[0]); 
                }
                const r = 100;
                const phi = (90 - lat) * (Math.PI / 180);
                const theta = (lon + 180) * (Math.PI / 180);
                const x = -(r * Math.sin(phi) * Math.cos(theta));
                const z = (r * Math.sin(phi) * Math.sin(theta));
                const y = (r * Math.cos(phi));

                const geometry = new THREE.SphereGeometry(1.5, 16, 16);
                const material = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
                const marker = new THREE.Mesh(geometry, material);
                marker.position.set(x, y, z);
                
                const ringGeo = new THREE.RingGeometry(2, 2.5, 32);
                const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.position.copy(marker.position);
                ring.lookAt(0,0,0);
                
                this.markersGroup.add(marker);
                this.markersGroup.add(ring);
            }

            setCinematicMode(isCinematic) {
                if (isCinematic) {
                    this.controls.autoRotate = true;
                    this.controls.autoRotateSpeed = 0.5;
                    this.camera.position.set(0, 50, 300);
                } else {
                    this.controls.autoRotate = false;
                    // Move closer for interactive platform mode
                    this.camera.position.set(0, 0, 220); 
                }
            }

            onWindowResize() {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }

            animate() {
                requestAnimationFrame(this.animate);
                const time = this.clock.getElapsedTime();

                if (this.clouds) this.clouds.rotation.y = time * 0.02;
                if (this.dataUniforms) this.dataUniforms.uTime.value = time;
                
                if(this.markersGroup.children.length > 1) {
                    const scale = 1 + Math.sin(time * 5) * 0.2;
                    this.markersGroup.children[1].scale.set(scale, scale, scale);
                }

                this.controls.update();
                this.renderer.render(this.scene, this.camera);
            }
        }

        