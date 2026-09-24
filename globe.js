const { useState, useEffect, useRef, useCallback } = React;

// ==========================================================================
// Three.js Globe Engine (Core 3D Visualization)
// ==========================================================================
class GlobeEngine {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        
        // Setup Camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 16);

        // Setup Renderer with transparent background to blend with CSS
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.earthGroup = new THREE.Group();
        this.scene.add(this.earthGroup);

        this.initLights();
        this.initEarthLayers();
        this.initInteraction();

        // Animation state
        this.targetRotation = { x: 0, y: 0.001 }; // idle rotation
        this.isDragging = false;
        this.previousMouse = { x: 0, y: 0 };

        this.animate = this.animate.bind(this);
        this.animate();

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    initLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(10, 5, 10);
        this.scene.add(sunLight);

        const backLight = new THREE.DirectionalLight(0x00f0ff, 0.5);
        backLight.position.set(-10, -5, -10);
        this.scene.add(backLight);
    }

    initEarthLayers() {
        // Base Earth (Solid fallback to guarantee rendering)
        const baseGeo = new THREE.SphereGeometry(5, 64, 64);
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x051329, // Deep cinematic blue
            roughness: 0.7,
            metalness: 0.2,
        });
        this.baseEarth = new THREE.Mesh(baseGeo, baseMat);
        this.earthGroup.add(this.baseEarth);

        // Grid/Wireframe Layer (Gives a premium tech feel without needing textures)
        const wireGeo = new THREE.SphereGeometry(5.01, 32, 32);
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0x004466,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        this.wireEarth = new THREE.Mesh(wireGeo, wireMat);
        this.earthGroup.add(this.wireEarth);

        // Atmosphere / Edge Glow
        const atmosGeo = new THREE.SphereGeometry(5.2, 64, 64);
        const atmosMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        this.atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
        this.scene.add(this.atmosphere); // Note: Added to scene, not earthGroup, to maintain halo

        // Data Overlay Layer (Used for Temp/Precip/Wind mockups)
        const dataGeo = new THREE.SphereGeometry(5.02, 64, 64);
        this.dataMat = new THREE.MeshStandardMaterial({
            color: 0xff3300,
            transparent: true,
            opacity: 0.0, // Hidden by default
            blending: THREE.AdditiveBlending
        });
        this.dataLayer = new THREE.Mesh(dataGeo, this.dataMat);
        this.earthGroup.add(this.dataLayer);
    }

    initInteraction() {
        this.container.addEventListener('pointerdown', (e) => {
            this.isDragging = true;
            this.previousMouse = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('pointerup', () => {
            this.isDragging = false;
        });

        window.addEventListener('pointermove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.previousMouse.x;
                const deltaY = e.clientY - this.previousMouse.y;
                
                this.earthGroup.rotation.y += deltaX * 0.005;
                this.earthGroup.rotation.x += deltaY * 0.005;
                
                this.previousMouse = { x: e.clientX, y: e.clientY };
            }
        });
    }

    // API for React UI to control the globe
    setLayer(type) {
        if (type === 'none') {
            this.dataMat.opacity = 0;
        } else if (type === 'temperature') {
            this.dataMat.color.setHex(0xff4400); // Warm orange/red
            this.dataMat.opacity = 0.4;
        } else if (type === 'precipitation') {
            this.dataMat.color.setHex(0x00f0ff); // Cyan/blue
            this.dataMat.opacity = 0.4;
        } else if (type === 'wind') {
            this.dataMat.color.setHex(0xffffff); // White sweeps
            this.dataMat.opacity = 0.2;
        }
    }

    focusCamera(view) {
        // Simple mock animation for camera based on view context
        if (view === 'landing') {
            this.earthGroup.position.set(0, 0, 0);
            this.camera.position.set(0, 0, 16);
        } else if (view === 'platform') {
            // Move globe slightly left to make room for UI panels
            this.earthGroup.position.set(-2, 0, 0);
            this.camera.position.set(0, 0, 12); // Zoom in slightly
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate);
        
        // Idle rotation
        if (!this.isDragging) {
            this.earthGroup.rotation.y += this.targetRotation.y;
        }

        // Keep atmosphere centered on Earth but not rotating with it
        this.atmosphere.position.copy(this.earthGroup.position);

        this.renderer.render(this.scene, this.camera);
    }
    
    dispose() {
        this.container.innerHTML = '';
        window.removeEventListener('resize', this.onWindowResize);
    }
}

// ==========================================================================
// React UI Components
// ==========================================================================

const LandingPage = ({ onExplore }) => {
    return (
        <div className="w-full relative">
            {/* Navbar (Absolute so it scrolls away naturally) */}
            <nav className="absolute top-0 w-full z-50 px-8 py-6 flex justify-between items-center interactive-ui">
                <div className="text-xl font-bold tracking-widest flex items-center gap-2">
                    <div className="w-4 h-4 bg-brandBlue rounded-full"></div>
                    ATMO.INTEL
                </div>
                <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide text-gray-300">
                    <button className="hover:text-white transition">Forecast</button>
                    <button className="hover:text-white transition">Climate</button>
                    <button className="hover:text-white transition">Decisions</button>
                </div>
                <button 
                    onClick={onExplore}
                    className="border border-white/20 px-6 py-2 rounded-full hover:bg-white hover:text-black transition text-sm font-semibold">
                    Explore Platform
                </button>
            </nav>

            {/* Scrollable Story Content */}
            <div className="h-[100vh] flex flex-col justify-center px-8 md:px-24 max-w-5xl interactive-ui pointer-events-none">
                <div className="pointer-events-auto animate-slide-up">
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-6">
                        WEATHER.<br/>
                        CLIMATE.<br/>
                        <span className="text-brandBlue">DECISIONS.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-md mb-10 border-l-2 border-brandBlue pl-4">
                        Conversational intelligence for weather, climate, and real-world decisions. 
                        Do not just see the forecast. Understand what it means.
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={onExplore}
                            className="bg-brandBlue text-black px-8 py-4 rounded-sm font-bold tracking-wide hover:bg-white transition flex items-center gap-2">
                            ENTER PLATFORM <span className="text-xl">→</span>
                        </button>
                        <button className="border border-white/20 glass-panel px-8 py-4 rounded-sm font-bold tracking-wide hover:bg-white/10 transition">
                            See How It Works
                        </button>
                    </div>
                </div>
            </div>

            {/* Story Sections (Scroll down for cinematic feel) */}
            <div className="h-[100vh] flex flex-col justify-center px-8 md:px-24 max-w-5xl text-right ml-auto interactive-ui pointer-events-none">
                <div className="pointer-events-auto">
                    <h2 className="text-5xl md:text-7xl font-bold mb-4">DOMAIN INTELLIGENCE</h2>
                    <p className="text-xl text-gray-400 max-w-lg ml-auto">
                        Agriculture. Aviation. Marine. Disaster Management. 
                        Context-aware layers that translate raw atmospheric data into actionable operational thresholds.
                    </p>
                </div>
            </div>
            
            <div className="h-[50vh]"></div> {/* Bottom padding */}
        </div>
    );
};

const PlatformWorkspace = ({ globeEngine }) => {
    const [activeLayer, setActiveLayer] = useState('none');
    const [domain, setDomain] = useState('Marine');
    const [chatHistory, setChatHistory] = useState([
        { role: 'ai', text: 'Platform initialized. Geographic coordinate system ready. How can I assist your operations today?' }
    ]);
    const [inputText, setInputText] = useState('');

    // Update Globe when layer changes
    useEffect(() => {
        if (globeEngine) {
            globeEngine.setLayer(activeLayer);
        }
    }, [activeLayer, globeEngine]);

    const handleChatSubmit = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        // Add user message
        const newHistory = [...chatHistory, { role: 'user', text: inputText }];
        setChatHistory(newHistory);
        setInputText('');

        // Mock AI interaction parsing and response
        setTimeout(() => {
            let aiResponse = "I have analyzed the current atmospheric conditions.";
            let layerToSet = activeLayer;

            if (inputText.toLowerCase().includes('safe') && inputText.toLowerCase().includes('vessel')) {
                aiResponse = "Analyzing marine operational risks... Wind speeds are elevated at 28km/h, and wave height is 2.4m. Uncertainty is moderate. Recommendation: Consider delaying departure.";
                layerToSet = 'wind';
            } else if (inputText.toLowerCase().includes('temperature') || inputText.toLowerCase().includes('heat')) {
                aiResponse = "Displaying historical temperature anomalies. There is a sustained warming trend in this region compared to the 1990 baseline.";
                layerToSet = 'temperature';
            }

            if (layerToSet !== activeLayer) setActiveLayer(layerToSet);
            setChatHistory([...newHistory, { role: 'ai', text: aiResponse }]);
        }, 1200);
    };

    return (
        <div className="w-full h-full flex justify-between p-6 pointer-events-none">
            
            {/* LEFT SIDEBAR: Layers & Controls */}
            <div className="w-80 flex flex-col gap-4 interactive-ui animate-fade-in">
                {/* Header */}
                <div className="glass-panel hud-border p-4 rounded flex justify-between items-center">
                    <div className="font-bold tracking-widest text-brandBlue">ATMO.INTEL</div>
                    <div className="text-metadata">LIVE // 492.1</div>
                </div>

                {/* Domain Selector */}
                <div className="glass-panel border border-white/10 p-4 rounded">
                    <div className="text-metadata mb-3">Operational Domain</div>
                    <select 
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="w-full bg-black/50 border border-white/20 rounded p-2 text-sm font-medium focus:outline-none focus:border-brandBlue cursor-pointer">
                        <option>Marine Operations</option>
                        <option>Agriculture</option>
                        <option>Aviation</option>
                        <option>Disaster Management</option>
                        <option>Urban Planning</option>
                    </select>
                </div>

                {/* Layer Controls */}
                <div className="glass-panel border border-white/10 p-4 rounded flex-1">
                    <div className="text-metadata mb-4">Geospatial Layers</div>
                    <div className="flex flex-col gap-2">
                        {['none', 'temperature', 'precipitation', 'wind'].map((layer) => (
                            <button
                                key={layer}
                                onClick={() => setActiveLayer(layer)}
                                className={`text-left px-3 py-2 rounded text-sm capitalize transition ${
                                    activeLayer === layer 
                                    ? 'bg-brandBlue/20 border border-brandBlue text-brandBlue' 
                                    : 'bg-black/30 border border-transparent hover:bg-white/10'
                                }`}>
                                {layer === 'none' ? 'Base Earth' : layer} Layer
                            </button>
                        ))}
                    </div>

                    <div className="mt-8">
                        <div className="text-metadata mb-2">Layer Opacity</div>
                        <input type="range" min="0" max="100" defaultValue="40" />
                    </div>
                </div>
            </div>

            {/* RIGHT SIDEBAR: Conversational AI & Decision Support */}
            <div className="w-96 flex flex-col gap-4 interactive-ui animate-slide-up">
                
                {/* Chat Display */}
                <div className="glass-panel border border-white/10 p-4 rounded flex-1 flex flex-col justify-end overflow-hidden">
                    <div className="overflow-y-auto flex flex-col gap-4 mb-4 pr-2">
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`text-sm ${msg.role === 'ai' ? 'text-gray-300' : 'text-brandBlue font-medium ml-auto max-w-[80%] text-right'}`}>
                                {msg.role === 'ai' && <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">System</div>}
                                {msg.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Decision Insight Card (Dynamic based on AI) */}
                <div className="glass-panel hud-border p-4 rounded bg-brandBlue/5">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-metadata text-brandBlue">Risk Assessment</div>
                        <div className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded font-bold">MODERATE</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-300 mb-3">
                        <div>WIND: 28 km/h</div>
                        <div>WAVE: 2.4 m</div>
                        <div>VIS: 6.2 km</div>
                        <div>CONF: 82%</div>
                    </div>
                    <div className="text-sm border-t border-white/10 pt-2 text-gray-400">
                        Recommend delaying immediate departures pending localized clearing.
                    </div>
                </div>

                {/* Input Area */}
                <form onSubmit={handleChatSubmit} className="glass-panel border border-white/10 p-2 rounded flex gap-2">
                    <button type="button" className="p-2 text-gray-400 hover:text-brandBlue transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                    </button>
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Ask weather or climate queries..."
                        className="flex-1 bg-transparent text-sm focus:outline-none text-white placeholder-gray-600"
                    />
                    <button type="submit" className="bg-brandBlue text-black px-4 py-1 rounded text-sm font-bold hover:bg-white transition">
                        ASK
                    </button>
                </form>
            </div>

            {/* BOTTOM TIMELINE (Centered) */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl interactive-ui animate-fade-in">
                <div className="glass-panel border border-white/10 px-6 py-4 rounded flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-mono text-gray-400">
                        <span>HISTORICAL</span>
                        <span className="text-brandBlue">NOW (14:00 UTC)</span>
                        <span>FORECAST +72H</span>
                    </div>
                    <input type="range" min="0" max="100" defaultValue="50" className="w-full" />
                </div>
            </div>

        </div>
    );
};

// ==========================================================================
// Main Application Container
// ==========================================================================
const App = () => {
    const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'platform'
    const globeContainerRef = useRef(null);
    const [engine, setEngine] = useState(null);

    // Initialize Three.js once on mount
    useEffect(() => {
        if (globeContainerRef.current && !engine) {
            const globeEngine = new GlobeEngine(globeContainerRef.current);
            setEngine(globeEngine);
        }
        
        return () => {
            if (engine) engine.dispose();
        };
    }, []);

    // Handle camera transitions when view changes
    useEffect(() => {
        if (engine) {
            engine.focusCamera(currentView);
        }
    }, [currentView, engine]);

    return (
        <div className="w-full h-full relative">
            
            {/* Background 3D Engine Layer (Z-0, Fixed, Pointer Events Auto inside canvas) */}
            <div id="webgl-container" ref={globeContainerRef}></div>

            {/* UI Overlay Layer (Z-10, Absolute, Pointer Events None by default) */}
            <div id="ui-layer">
                {currentView === 'landing' ? (
                    <LandingPage onExplore={() => setCurrentView('platform')} />
                ) : (
                    <PlatformWorkspace globeEngine={engine} />
                )}
            </div>
            
        </div>
    );
};

// Render the application to the DOM
ReactDOM.render(<App />, document.getElementById('root'));