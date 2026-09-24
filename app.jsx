const App = () => {
            const [view, setView] = useState('landing'); // 'landing' | 'platform'
            const [activeLayer, setActiveLayer] = useState('none');
            const [location, setLocation] = useState(null);
            const [domain, setDomain] = useState('marine');
            
            const [chatHistory, setChatHistory] = useState([
                { role: 'ai', text: 'Atmosphere Intelligence online. I can assist with weather forecasting, climate analysis, and domain-specific risk assessment. What would you like to know?' }
            ]);

            const engineRef = useRef(null);

            // Initialize 3D Engine strictly once
            useEffect(() => {
                if (!engineRef.current) {
                    engineRef.current = new GlobeEngine('canvas-container', (locData) => {
                        setLocation(locData);
                        setView('platform'); // Auto-switch to workspace when globe is clicked
                    });
                }
            }, []);

            // Sync View Modes to 3D Camera
            useEffect(() => {
                if (engineRef.current) {
                    engineRef.current.setCinematicMode(view === 'landing');
                }
            }, [view]);

            // Sync Data Layers to 3D Shader
            useEffect(() => {
                if (engineRef.current) {
                    engineRef.current.setLayer(activeLayer);
                }
            }, [activeLayer]);

            // Mock Conversational Logic parsing intent
            const handleUserMessage = (text) => {
                setChatHistory(prev => [...prev, { role: 'user', text }]);

                setTimeout(() => {
                    let aiResponse = { role: 'ai', text: "I've analyzed the atmospheric data." };
                    const lowerText = text.toLowerCase();

                    if (lowerText.includes('fishing') || lowerText.includes('marine') || lowerText.includes('vessel')) {
                        setDomain('marine');
                        setActiveLayer('wind');
                        aiResponse.text = "Switching to Marine Operations context and displaying wind vector fields.";
                        aiResponse.data = {
                            title: "Marine Risk Assessment: Elevated",
                            content: "Wind: 28 km/h NW\nWave Height: 2.4 m\nVisibility: 6.2 km\n\nRecommendation: Consider delaying departure until 14:00 UTC due to building swell.",
                            confidence: "High (87%)",
                            source: "NOAA WW3 + ECMWF"
                        };
                    } else if (lowerText.includes('agriculture') || lowerText.includes('farm') || lowerText.includes('rain')) {
                        setDomain('agriculture');
                        setActiveLayer('precipitation');
                        aiResponse.text = "Switching to Agriculture context and displaying precipitation forecast.";
                        aiResponse.data = {
                            title: "Crop Risk: Low",
                            content: "Precipitation expected: 12mm over next 48h.\nSoil Moisture: 45% (Optimal)\nHeat Stress Index: Safe",
                            confidence: "Moderate",
                            source: "ERA5-Land"
                        };
                    } else if (lowerText.includes('temperature') || lowerText.includes('hot')) {
                        setActiveLayer('temperature');
                        aiResponse.text = "Displaying global surface temperature fields.";
                        if (location) {
                            aiResponse.data = {
                                title: `Local Temp: ${location.name}`,
                                content: "Current: 32°C\nForecast High: 35°C\nAnomaly: +2.1°C above historical average.",
                                confidence: "High",
                                source: "GFS Ens"
                            }
                        }
                    } else if (lowerText.includes('anomaly') || lowerText.includes('trend')) {
                        setActiveLayer('anomaly');
                        aiResponse.text = "Loading historical climate anomaly overlay. Red indicates warming trends relative to 1980-2010 baseline.";
                    } else {
                        aiResponse.text = `I'm analyzing data for ${location ? location.name : 'the global view'}. Try asking about risk for marine operations, agriculture, or temperature anomalies.`;
                    }

                    setChatHistory(prev => [...prev, aiResponse]);
                }, 800);
            };

            return (
                // Scrollable container for landing page, hidden overflow for platform
                <div className={`w-full h-full relative font-sans ${view === 'landing' ? 'overflow-y-auto no-scrollbar pointer-events-auto' : 'overflow-hidden pointer-events-none'}`}>
                    <Navigation view={view} setView={setView} setActiveLayer={setActiveLayer} />
                    
                    {view === 'landing' && (
                        <LandingPage setView={setView} />
                    )}
                    
                    {view === 'platform' && (
                        <PlatformUI 
                            activeLayer={activeLayer} 
                            setActiveLayer={setActiveLayer}
                            location={location}
                            chatHistory={chatHistory}
                            onSendMessage={handleUserMessage}
                            domain={domain}
                            setDomain={setDomain}
                        />
                    )}
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);