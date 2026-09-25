 const { useState, useEffect, useRef } = React;

        const IconMenu = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
        const IconMic = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;
        const IconSend = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
        const IconLayers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 12 12 17 22 12"></polyline><polyline points="2 17 12 22 22 17"></polyline></svg>;
        const IconAlertTriangle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const IconThermometer = ({ className = "", ...props }) => (
  <svg
    className={className}
    {...props}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
  </svg>
);

const IconWind = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
  </svg>
);        const IconCloudRain = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>;

        const Navigation = ({ view, setView, setActiveLayer }) => {
            return (
                <nav className={`w-full absolute top-0 left-0 z-50 transition-all duration-500 pointer-events-auto ${view === 'platform' ? 'glass-panel border-b border-white/10' : 'bg-transparent pt-6'}`}>
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div 
                            className="text-xl font-bold tracking-wider cursor-pointer flex items-center gap-2"
                            onClick={() => { setView('landing'); setActiveLayer('none'); }}
                        >
                            <div className="w-6 h-6 rounded-full bg-brand-400 opacity-80 blur-[2px]"></div>
                            <span>ATMO<span className="text-brand-400 font-light">SPHERE</span></span>
                        </div>
                        
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                            <button onClick={() => { setView('platform'); setActiveLayer('temperature'); }} className="hover:text-white transition-colors">Forecast</button>
                            <button onClick={() => { setView('platform'); setActiveLayer('anomaly'); }} className="hover:text-white transition-colors">Climate</button>
                            <button onClick={() => { setView('platform'); setActiveLayer('none'); }} className="hover:text-white transition-colors">Decision Support</button>
                            <button onClick={() => { setView('platform'); setActiveLayer('precipitation'); }} className="flex items-center gap-1 hover:text-alert-warning transition-colors">
                                <IconAlertTriangle /> Alerts
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {view === 'landing' ? (
                                <button 
                                    onClick={() => setView('platform')}
                                    className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-sm font-semibold transition-all"
                                >
                                    Explore Platform
                                </button>
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-brand-900 border border-brand-500 flex items-center justify-center text-xs font-bold shadow-lg shadow-brand-500/20 cursor-pointer hover:bg-brand-500 transition-colors">
                                    USR
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            );
        };

        const LandingPage = ({ setView }) => {
            const nextSectionRef = useRef(null);

            const handleScrollDown = () => {
                nextSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            };

            return (
                <div className="w-full h-full">
                    {/* Hero Section */}
                    <div className="w-full h-screen flex flex-col justify-center px-10 md:px-24 relative pointer-events-none">
                        <div className="max-w-3xl pointer-events-auto mt-20">
                            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                                WEATHER.<br/>
                                CLIMATE.<br/>
                                <span className="text-brand-400">INTELLIGENCE.</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl font-light">
                                Conversational intelligence for weather, climate, and real-world decisions.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button 
                                    onClick={() => setView('platform')}
                                    className="px-8 py-4 rounded-full bg-brand-500 hover:bg-brand-400 text-white font-semibold transition-colors shadow-[0_0_20px_rgba(14,165,233,0.4)]"
                                >
                                    Enter Platform
                                </button>
                                <button 
                                    className="px-8 py-4 rounded-full glass-button font-medium flex items-center gap-2"
                                    onClick={handleScrollDown}
                                >
                                    See How It Works ↓
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Information Section */}
                    <div ref={nextSectionRef} className="w-full min-h-screen flex items-center px-10 md:px-24 pointer-events-none relative z-10 bg-gradient-to-b from-transparent to-brand-space pt-20">
                        <div className="max-w-md pointer-events-auto glass-panel p-8 rounded-2xl shadow-2xl border border-white/10">
                            <h2 className="text-3xl font-bold mb-4">Understand the Atmosphere</h2>
                            <p className="text-slate-300 mb-6">Our geospatial engine processes petabytes of climate data into an interactive, real-time representation of Earth's systems.</p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3"><IconThermometer className="text-brand-400"/> Temperature Fields</div>
                                <div className="flex items-center gap-3"><IconWind className="text-brand-400"/> Global Wind Vectors</div>
                                <div className="flex items-center gap-3"><IconCloudRain className="text-brand-400"/> Precipitation Forecasts</div>
                            </div>
                            <button 
                                onClick={() => setView('platform')}
                                className="mt-8 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all font-medium"
                            >
                                Open Visualization Layer
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        const PlatformUI = ({ 
            activeLayer, 
            setActiveLayer, 
            location, 
            chatHistory, 
            onSendMessage,
            domain,
            setDomain
        }) => {
            const [inputMsg, setInputMsg] = useState("");
            const chatEndRef = useRef(null);

            useEffect(() => {
                chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, [chatHistory]);

            const handleSend = (e) => {
                e.preventDefault();
                if(!inputMsg.trim()) return;
                onSendMessage(inputMsg);
                setInputMsg("");
            };

            const layers = [
                { id: 'none', label: 'Base Earth', icon: null },
                { id: 'temperature', label: 'Temperature', icon: <IconThermometer/> },
                { id: 'precipitation', label: 'Precipitation', icon: <IconCloudRain/> },
                { id: 'wind', label: 'Wind / Pressure', icon: <IconWind/> },
                { id: 'anomaly', label: 'Climate Anomaly', icon: <IconAlertTriangle/> },
            ];

            const domains = ['Agriculture', 'Aviation', 'Marine', 'Disaster', 'Research'];

            return (
                <div className="w-full h-full pt-16 flex p-4 gap-4 pointer-events-none">
                    
                    {/* Left Sidebar - AI Chat */}
                    <div className="w-80 h-full flex flex-col pointer-events-auto">
                        <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl">
                            {/* Domain Selector */}
                            <div className="p-4 border-b border-white/10 bg-black/20">
                                <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Context Domain</div>
                                <select 
                                    className="w-full bg-slate-800/80 border border-slate-700 text-white text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2 outline-none"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                >
                                    {domains.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
                                </select>
                            </div>

                            {/* Chat History */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 panel-scroll">
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-brand-500 text-white rounded-tr-sm' 
                                            : 'bg-slate-800/90 text-slate-200 rounded-tl-sm border border-slate-700'
                                        }`}>
                                            {msg.text}
                                        </div>
                                        {/* Rich Response handling for AI */}
                                        {msg.role === 'ai' && msg.data && (
                                            <div className="mt-2 w-full bg-slate-800/60 rounded-xl p-3 border-l-2 border-l-brand-400 text-xs shadow-inner">
                                                <div className="font-bold mb-1 text-white">{msg.data.title}</div>
                                                <div className="text-slate-300 whitespace-pre-line">{msg.data.content}</div>
                                                {msg.data.confidence && (
                                                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-slate-400 text-[10px] uppercase">
                                                        <span>Conf: {msg.data.confidence}</span>
                                                        <span>Source: {msg.data.source}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input form */}
                            <div className="p-3 border-t border-white/10 bg-black/20">
                                <form onSubmit={handleSend} className="relative flex items-center">
                                    <input 
                                        type="text" 
                                        value={inputMsg}
                                        onChange={(e) => setInputMsg(e.target.value)}
                                        placeholder="Ask about risk, climate..."
                                        className="w-full bg-slate-800 border border-slate-600 text-sm rounded-full pl-4 pr-20 py-3 focus:outline-none focus:border-brand-400 text-white placeholder-slate-400 shadow-inner"
                                    />
                                    <div className="absolute right-2 flex gap-1">
                                        <button type="button" className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition">
                                            <IconMic />
                                        </button>
                                        <button type="submit" className="p-2 text-brand-400 hover:text-brand-300 rounded-full hover:bg-slate-700 transition">
                                            <IconSend />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Floating Controls */}
                    <div className="flex-1 flex flex-col justify-between items-end pointer-events-none pb-4">
                        
                        {/* Top Right: Location Metadata */}
                        {location && (
                            <div className="glass-panel p-4 rounded-2xl w-64 pointer-events-auto border-t-2 border-t-brand-400 shadow-xl bg-slate-900/80 backdrop-blur-md">
                                <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Target Region</div>
                                <div className="font-bold text-lg">{location.name}</div>
                                <div className="tech-text text-xs text-brand-400 mt-2 bg-black/30 p-2 rounded-lg">
                                    LAT: {location.lat}°<br/>LON: {location.lon}°
                                </div>
                            </div>
                        )}
                        {!location && (
                            <div className="glass-panel px-4 py-2 rounded-full pointer-events-auto shadow-md border border-white/10 text-xs text-slate-400">
                                Click Earth to select region
                            </div>
                        )}

                        {/* Bottom Right: Layer Controls & Timeline */}
                        <div className="w-full max-w-2xl flex flex-col gap-4 pointer-events-auto">
                            
                            {/* Layer Toggles */}
                            <div className="glass-panel p-2 rounded-2xl flex items-center justify-around overflow-x-auto self-end w-full md:w-auto bg-slate-900/80">
                                <div className="px-3 border-r border-white/10 flex items-center gap-2 text-slate-400">
                                    <IconLayers /> <span className="text-xs uppercase tracking-wider hidden md:inline">Layers</span>
                                </div>
                                {layers.map(layer => (
                                    <button 
                                        key={layer.id}
                                        onClick={() => setActiveLayer(layer.id)}
                                        className={`px-4 py-2 text-sm font-medium rounded-xl flex items-center gap-2 transition-all mx-1 whitespace-nowrap
                                            ${activeLayer === layer.id ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'text-slate-300 hover:bg-white/10'}
                                        `}
                                    >
                                        {layer.icon && <span className="w-4 h-4">{layer.icon}</span>}
                                        {layer.label}
                                    </button>
                                ))}
                            </div>

                            {/* Timeline Control */}
                            <div className="glass-panel p-4 rounded-2xl w-full flex flex-col gap-3 bg-slate-900/80">
                                <div className="flex justify-between text-xs tech-text text-slate-400">
                                    <span>HISTORICAL</span>
                                    <span className="text-white bg-brand-500/20 px-2 rounded">LIVE</span>
                                    <span>FORECAST</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="-100" max="100" defaultValue="0"
                                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-400"
                                />
                                <div className="flex justify-between text-[10px] text-slate-500 uppercase">
                                    <span>-30 Days</span>
                                    <span>Now</span>
                                    <span>+14 Days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        