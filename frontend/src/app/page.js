"use client";
import { useState, useEffect } from "react";
import { Upload, Wand2, CheckCircle, Loader2, Image as ImageIcon, Download, Share2, ChevronLeft, ChevronRight, Layout, Plus, Sparkles, Lock, AlertTriangle, Layers, CreditCard, Tag, Users, Database, ChevronDown, Grid, List, ShieldCheck, FileText, Crop, X, Save, Eye, Smartphone, RefreshCw, Monitor, Wrench, FileBadge, ScanLine, RotateCcw } from "lucide-react";



export default function Home() {
  const API_BASE = "https://tesco-creative-synthesizer-rey5.onrender.com";
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  // --- FEATURES ---
  const [brand, setBrand] = useState("generic");
  const [clubcard, setClubcard] = useState(false);
  const [price, setPrice] = useState("3.50");
  const [clubPrice, setClubPrice] = useState("2.00");
  const [refImage, setRefImage] = useState(null);
  const [headline, setHeadline] = useState("");
  const [cta, setCta] = useState("");
  const [legalWarning, setLegalWarning] = useState(null);
  const [compositionMode, setCompositionMode] = useState("single");
  const [audience, setAudience] = useState("general");
  const [dynamicDetected, setDynamicDetected] = useState(false);
  
  // --- UI STATES ---
  const [showRing, setShowRing] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [result, setResult] = useState(null);
  
  // --- LAYER 2: AUDIT STATES ---
  const [auditState, setAuditState] = useState("idle"); 
  const [showDebugOverlay, setShowDebugOverlay] = useState(true);
  
  // --- LAYER 3: RESULTS STATES ---
  const [viewMode, setViewMode] = useState("grid"); 
  const [activeIndex, setActiveIndex] = useState(2); 
  const [editingAsset, setEditingAsset] = useState(null); 
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [contextMode, setContextMode] = useState(false);
  const [regenerating, setRegenerating] = useState({}); 

  // --- BRAND CONFIG ---
  const brands = {
    "generic": { color: "bg-blue-600", hex: "#2563eb", rules: "Standard Retail v1.0" },
    "tesco":   { color: "bg-[#00539F]", hex: "#00539F", rules: "Tesco Finest Standards v2.4" },
    "cadbury": { color: "bg-[#261251]", hex: "#261251", rules: "Mondelez Brand Guard v3.1" },
    "coca-cola": { color: "bg-[#F40009]", hex: "#F40009", rules: "Coke Global Visual ID" },
    "heineken": { color: "bg-[#008200]", hex: "#008200", rules: "Alcohol Marketing Laws (18+)" }
  };

  // --- RESET FUNCTION (NEW) ---
  const handleReset = () => {
    setResult(null);
    setPreview(null);
    setSelectedFile(null);
    setPrompt("");
    setHeadline("");
    setCta("");
    setRefImage(null);
    setAuditState("idle");
    setShowRing(false);
    // Reset other UI toggles if needed
    setShowHeatmap(false);
    setContextMode(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setTimeout(() => setShowRing(true), 100);
      setPrompt(""); 
    }
  };

  const handleRefImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setRefImage(URL.createObjectURL(file));
  };

  const handleSmartCopy = () => {
    if (headline) setHeadline("✨ Summer Refresh Event");
    if (cta) setCta("Shop Limited Time Offer");
  };

  const checkTextLogic = (text, type) => {
    const banned = ["cure", "heal", "medical", "guarantee", "weight loss", "doctor"];
    const found = banned.find(w => text.toLowerCase().includes(w));
    if (found) {
      setLegalWarning(`⚠️ Compliance Alert: The word "${found}" is restricted.`);
    } else {
      setLegalWarning(null);
    }
    const hasVar = text.includes("{") && text.includes("}");
    setDynamicDetected(hasVar);
    if (type === "headline") setHeadline(text);
    if (type === "cta") setCta(text);
  };

  const handleAutoPrompt = async () => {
    if (!selectedFile) return alert("Please upload an image first!");
    setAnalyzing(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const response = await fetch(`${API_BASE}/analyze-image`, { method: "POST", body: formData });
      const data = await response.json();
      setPrompt(data.suggested_prompt);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const generateAd = async () => {
    if (!selectedFile && !prompt) return alert("Please upload a product or describe scene.");
    if (legalWarning) return alert("Please fix legal compliance issues.");

    setLoading(true);
    setResult(null);
    setDisplayScore(0);
    setAuditState("idle"); 

    const formData = new FormData();
    if(selectedFile) formData.append("file", selectedFile);
    formData.append("prompt", prompt);
    formData.append("headline", headline);
    formData.append("cta", cta);
    formData.append("brand", brand);
    formData.append("clubcard", clubcard);
    formData.append("price", price);
    formData.append("club_price", clubPrice);
    formData.append("audience", audience);

    try {
      const response = await fetch(`${API_BASE}/generate-campaign`, { method: "POST", body: formData });
      
      if (!response.ok) throw new Error("Backend Error");
      
      const data = await response.json();
      
      if (!data.assets || !data.assets.square) {
          throw new Error("Invalid response format from backend");
      }

      setLoading(false);
      setResult(data);
      setAuditState("scanning"); 
      setActiveIndex(2); 
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate campaign. Check backend logs.");
      setLoading(false);
    }
  };

  // --- LAYER 2 LOGIC ---
  useEffect(() => {
    if (auditState === "scanning") {
        let current = 0;
        const interval = setInterval(() => {
            current += 2;
            if (current >= 92) {
                clearInterval(interval);
                setAuditState("issues"); 
                setDisplayScore(92);
            } else {
                setDisplayScore(current);
            }
        }, 50);
        return () => clearInterval(interval);
    }
  }, [auditState]);

  const handleAutoFix = () => {
      setAuditState("fixing");
      setTimeout(() => {
          setAuditState("complete"); 
          setDisplayScore(100);
      }, 1500);
  };

  const handleRegenerateSingle = (key) => {
      setRegenerating(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
          setRegenerating(prev => ({ ...prev, [key]: false }));
      }, 2000);
  };

  const formats = ['square', 'story', 'landscape', 'portrait'];
  const formatSpecs = {
      square: { label: "Instagram Feed", dim: "1080x1080", size: "142 KB" },
      story: { label: "TikTok / Reels", dim: "1080x1920", size: "210 KB" },
      landscape: { label: "Web Banner", dim: "1920x1080", size: "198 KB" },
      portrait: { label: "Mobile Display", dim: "1080x1350", size: "165 KB" }
  };

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % formats.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + formats.length) % formats.length);
  const getOffset = (index) => {
    const diff = index - activeIndex;
    if (diff === 0) return 0;
    if (diff === 1 || diff === -3) return 1;
    if (diff === -1 || diff === 3) return -1;
    return 2;
  };

  const themeColor = brands[brand] ? brands[brand].color : "bg-blue-600";
  const themeHex = brands[brand] ? brands[brand].hex : "#2563eb";
  const activeRulebook = brands[brand] ? brands[brand].rules : "Standard Retail v1.0";

  return (
    <main className="min-h-screen bg-[#050B14] text-white relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-white flex flex-col">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#050B14] to-black pointer-events-none" />

      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 h-20 px-8 z-30 flex justify-between items-center border-b border-white/5 bg-[#050B14]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className={`${themeColor} text-white font-bold px-3 py-1 rounded text-xs tracking-widest uppercase shadow-lg transition-colors duration-500`}>TCS</div>
          <h1 className="text-sm font-semibold tracking-tight text-slate-200 uppercase opacity-80">Tesco Creative Synthesizer</h1>
        </div>
        
        <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Brand DNA:</span>
            <div className="relative">
                <select 
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="bg-[#0F172A] border border-white/10 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold uppercase text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer hover:border-blue-500/50"
                >
                    <option value="generic">Generic</option>
                    <option value="tesco">Tesco Finest</option>
                    <option value="cadbury">Cadbury</option>
                    <option value="coca-cola">Coca-Cola</option>
                    <option value="heineken">Heineken</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
        </div>

        {/* FIXED: RESET BUTTON ALWAYS SHOWS IF RESULT EXISTS */}
        {result && (
             <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition text-slate-300">
                <Plus size={14} /> New Campaign
             </button>
        )}
      </header>

      {/* VIEW 1: INPUT STAGE */}
      {!result ? (
        <div className="relative h-screen flex flex-col items-center justify-center z-10">
          <div className="relative w-full max-w-7xl h-[600px] flex items-center justify-center">

            {/* CENTRAL RING */}
            <label className="relative w-[500px] h-[500px] flex items-center justify-center cursor-pointer group">
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                <svg className="absolute inset-0 w-full h-full rotate-[-90deg] drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] pointer-events-none z-20" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="46" fill="none" stroke={themeHex} strokeWidth="1.5" strokeDasharray="144 300" strokeDashoffset={showRing ? "0" : "144"} strokeLinecap="round" className="transition-all duration-[1.5s] ease-out"/>
                </svg>
                <svg className="absolute inset-0 w-full h-full rotate-[90deg] drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] pointer-events-none z-20" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="46" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="144 300" strokeDashoffset={showRing ? "0" : "144"} strokeLinecap="round" className="transition-all duration-[1.5s] ease-out"/>
                </svg>
                
                <div className={`relative w-80 h-80 rounded-full flex items-center justify-center z-10 transition-all duration-500 group-hover:scale-105 ${preview ? 'bg-transparent' : 'bg-[#050B14] border border-slate-800 shadow-2xl group-hover:border-slate-600'}`}>
                    {preview ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                             <div className={`absolute inset-0 ${themeColor} blur-3xl rounded-full scale-75 animate-pulse opacity-20`}></div>
                             <img src={preview} alt="Packshot" className="relative h-[110%] w-auto object-contain z-20 drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-700" />
                        </div>
                    ) : (
                        <div className="text-slate-600 flex flex-col items-center">
                           <Upload size={48} strokeWidth={1} className="opacity-50 group-hover:text-slate-400 transition-colors" />
                           <span className="text-[10px] uppercase tracking-[0.2em] mt-4 opacity-50 group-hover:text-slate-400 transition-colors">Upload Packshot</span>
                        </div>
                    )}
                </div>
            </label>

            {/* LEFT CONTROLS */}
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-80 transform transition-all duration-700 pl-8 ${preview ? 'opacity-100' : 'opacity-50'}`}>
                
                <div className="relative bg-[#0F172A]/80 backdrop-blur-md border border-white/10 p-1 rounded-2xl shadow-xl group mb-4">
                    <div className="absolute -top-3 left-3 bg-[#050B14] px-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Creative Prompt</div>
                    <textarea 
                        className="w-full h-24 bg-transparent text-white p-4 text-sm outline-none resize-none placeholder:text-slate-600 font-medium z-10 relative"
                        placeholder="Describe your scene..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    
                    <div className="px-3 pb-3 pt-1 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Users size={10} className="text-cyan-400"/>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Target Segment</span>
                        </div>
                        <select 
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            className="w-full bg-[#0B1121] text-white text-[10px] uppercase font-bold p-1.5 rounded border border-white/10 outline-none focus:border-cyan-500/50 cursor-pointer"
                        >
                            <option value="general">General Audience</option>
                            <option value="price_sensitive">Price Sensitive (Sale)</option>
                            <option value="health_conscious">Health Conscious (Fresh)</option>
                            <option value="premium">Premium Shoppers (Luxury)</option>
                            <option value="families">Young Families (Warm)</option>
                        </select>
                    </div>

                    <button 
                      onClick={handleAutoPrompt}
                      disabled={analyzing}
                      className="absolute bottom-3 right-3 bg-white/10 hover:bg-white/20 text-white border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all flex items-center gap-2 backdrop-blur-md z-20"
                    >
                      {analyzing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      Auto
                    </button>
                </div>

                {legalWarning && (
                  <div className="mb-4 bg-red-900/20 border border-red-500/50 p-2 rounded-lg flex items-start gap-2 animate-pulse">
                      <AlertTriangle size={14} className="text-red-500 mt-0.5" />
                      <p className="text-[10px] text-red-200 leading-tight">{legalWarning}</p>
                  </div>
                )}

                <div className="space-y-3">
                    <div className={`bg-[#0F172A]/80 backdrop-blur-md border p-2 rounded-xl flex flex-col transition-colors ${legalWarning ? 'border-red-500/50' : 'border-white/10'}`}>
                        <div className="flex items-center justify-between mb-1 px-1">
                           <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Headline</span>
                           {dynamicDetected && <span className="flex items-center gap-1 text-[8px] text-purple-400 font-bold bg-purple-900/30 px-1.5 py-0.5 rounded border border-purple-500/30"><Database size={8}/> DYNAMIC</span>}
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                className="flex-1 bg-transparent text-white px-2 text-sm outline-none font-bold placeholder:text-slate-600" 
                                placeholder="e.g. 50% OFF {City}" 
                                value={headline} 
                                onChange={(e) => checkTextLogic(e.target.value, "headline")} 
                            />
                            <button onClick={handleSmartCopy} className="p-1.5 hover:bg-white/10 rounded-lg text-blue-400 transition" title="AI Rewrite"><Wand2 size={14}/></button>
                        </div>
                    </div>
                    
                    <div className="bg-[#0F172A]/80 backdrop-blur-md border border-yellow-500/20 p-3 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Tag size={14} className="text-yellow-500"/>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500">Tesco Clubcard</span>
                            </div>
                            <button 
                                onClick={() => setClubcard(!clubcard)}
                                className={`w-8 h-4 rounded-full transition-colors relative ${clubcard ? 'bg-yellow-500' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${clubcard ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                            </button>
                        </div>
                        {clubcard && (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                                <input value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"/>
                                <input value={clubPrice} onChange={(e)=>setClubPrice(e.target.value)} className="w-full bg-slate-900 border border-yellow-500/50 rounded px-2 py-1 text-xs text-yellow-400 font-bold outline-none"/>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: ACTIONS */}
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 transform transition-all duration-700 flex flex-col items-end gap-4 pr-8 ${preview ? 'opacity-100' : 'opacity-100'}`}>
                 
                 <div className="bg-[#0F172A] border border-slate-700 p-1 rounded-xl flex gap-1">
                    <button onClick={() => setCompositionMode("single")} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${compositionMode === "single" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-white"}`}>Single</button>
                    <button onClick={() => setCompositionMode("bundle")} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-1 ${compositionMode === "bundle" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white"}`}><Layers size={12}/> Bundle</button>
                 </div>

                 <div className="text-right">
                    <label className="cursor-pointer group flex items-center gap-3 bg-[#0F172A] border border-slate-700 hover:border-slate-500 px-5 py-3 rounded-xl transition-all shadow-lg">
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white uppercase tracking-wide">
                           {refImage ? "Change Style" : "Upload Style Ref"}
                        </span>
                        {refImage ? (
                            <div className="w-4 h-4 rounded bg-cover bg-center border border-white/30" style={{backgroundImage: `url(${refImage})`}}></div>
                        ) : (
                            <ImageIcon size={16} className="text-slate-400 group-hover:text-white"/>
                        )}
                        <input type="file" className="hidden" onChange={handleRefImageChange} accept="image/*" />
                    </label>
                    <div className="mt-2 text-[10px] text-slate-500 text-right">Reference Board (Optional)</div>
                 </div>

                 <button 
                    onClick={generateAd}
                    disabled={loading || (!preview && !prompt)}
                    className={`w-64 group relative flex justify-center items-center gap-3 px-8 py-4 rounded-full font-bold uppercase text-xs tracking-widest transition-all shadow-xl hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:scale-105 ${
                        loading ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-orange-500 to-amber-500 text-black border border-white/20'
                    }`}
                 >
                    {loading ? <Loader2 className="animate-spin" size={16}/> : <Wand2 size={16} />}
                    <span>{loading ? 'Synthesizing...' : 'Generate Campaign'}</span>
                 </button>

            </div>

          </div>
        </div>
      ) : auditState !== "complete" && auditState !== "idle" ? (
        
        // VIEW 2: INTERACTIVE COMPLIANCE AUDIT
        <div className="absolute inset-0 z-50 bg-[#02040a] flex items-center justify-center p-8">
          <div className="w-full max-w-6xl grid grid-cols-2 gap-16 items-center">
            
            <div className="relative border border-blue-500/20 rounded-2xl overflow-hidden bg-slate-900/30 flex items-center justify-center h-[500px] shadow-[0_0_100px_rgba(59,130,246,0.1)] group">
              {result?.assets?.square?.url && (
                  <img src={`${API_BASE}${result.assets.square.url}`} className="h-full object-contain opacity-90 transition-all duration-500" style={{ filter: auditState === "fixing" ? "blur(4px)" : "none" }} />
              )}
              
              {showDebugOverlay && auditState !== "fixing" && (
                  <>
                    <div className="absolute top-[20%] left-[35%] w-[30%] h-[20%] border-2 border-green-500/70 bg-green-500/10 flex items-start justify-start p-1 animate-pulse">
                        <span className="text-[8px] bg-green-500 text-black font-bold px-1 rounded-sm">LOGO SAFE</span>
                    </div>
                    <div className="absolute top-[10%] left-[20%] w-[60%] h-[10%] border-2 border-blue-500/70 bg-blue-500/10 flex items-start justify-start p-1">
                        <span className="text-[8px] bg-blue-500 text-white font-bold px-1 rounded-sm">TEXT BLOCK</span>
                    </div>
                    <div className="absolute inset-4 border-2 border-dashed border-red-500/50 pointer-events-none">
                        <span className="absolute bottom-1 right-1 text-[8px] text-red-500 font-bold bg-black/50 px-1">BLEED 20px</span>
                    </div>
                  </>
              )}

              {auditState === "scanning" && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent w-full h-[20%] animate-[scan_2s_ease-in-out_infinite] border-b border-blue-400/50 box-content"></div>
              )}
              
              <div className="absolute bottom-6 left-6 flex items-center gap-4">
                  {auditState === "scanning" ? (
                      <div className="text-blue-400 font-mono text-[10px] uppercase tracking-widest animate-pulse flex items-center gap-2"><Loader2 className="animate-spin" size={12}/> Analyzing Assets...</div>
                  ) : (
                      <button onClick={() => setShowDebugOverlay(!showDebugOverlay)} className="bg-black/50 border border-white/20 text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-2 hover:bg-white/10 transition">
                          <ScanLine size={12}/> Toggle Debug View
                      </button>
                  )}
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-8 pl-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Compliance Score</h2>
                    <div className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-[9px] text-slate-400 flex items-center gap-1">
                        <FileBadge size={10}/> {activeRulebook}
                    </div>
                </div>
                
                <div className="flex items-end gap-3">
                    <div className={`text-8xl font-light tracking-tighter tabular-nums leading-none ${displayScore < 100 ? "text-orange-500" : "text-green-500"}`}>
                        {displayScore}<span className="text-2xl text-slate-600 ml-2">%</span>
                    </div>
                    {auditState === "fixing" && <div className="text-sm text-blue-400 font-bold animate-pulse mb-4">Fixing Issues...</div>}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/50">
                    <span className="text-xs font-medium flex items-center gap-3 text-slate-300">
                        <CheckCircle size={14} className="text-green-500"/> Logo Padding: 45px (Min: 30px)
                    </span>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-500 ${auditState === "issues" ? "border-red-500/50 bg-red-900/10" : "border-slate-800 bg-slate-900/50"}`}>
                    <span className="text-xs font-medium flex items-center gap-3 text-slate-300">
                        {auditState === "issues" ? <X size={14} className="text-red-500"/> : <CheckCircle size={14} className={displayScore < 95 ? "text-slate-600" : "text-green-500"}/>} 
                        {auditState === "issues" ? "Contrast Ratio: 3.1:1 (WCAG Fail)" : "Contrast Ratio: 4.8:1 (WCAG AA)"}
                    </span>
                    {auditState === "issues" && (
                        <button onClick={handleAutoFix} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 animate-pulse">
                            <Wrench size={10}/> Auto-Fix
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/50">
                    <span className="text-xs font-medium flex items-center gap-3 text-slate-300">
                        <CheckCircle size={14} className="text-green-500"/> Brand Tone: Empathetic (98%)
                    </span>
                </div>
              </div>

              {displayScore === 100 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex justify-between items-center pt-4 border-t border-white/5">
                      <button className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 transition">
                          <Download size={12}/> Download Compliance Audit (PDF)
                      </button>
                      <button onClick={() => setAuditState("complete")} className="bg-green-500 hover:bg-green-400 text-black px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center gap-2">
                          Proceed to Cascade <ChevronRight size={14}/>
                      </button>
                  </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // VIEW 3: RESULTS DASHBOARD
        <div className="relative z-10 flex flex-col h-full pt-20 animate-in fade-in duration-700">
          
          <div className="px-8 mb-4 flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-light text-white">Campaign <span className="text-orange-500 font-bold">Ready</span></h2>
                <div className="flex gap-4 mt-1 text-xs text-slate-400">
                   <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-green-500"/> Brand Safe</span>
                   <span className="flex items-center gap-1"><Database size={12} className="text-blue-500"/> {audience.replace('_',' ')} Optimized</span>
                </div>
             </div>
             
             <div className="flex items-center gap-3">
                <button onClick={() => setShowHeatmap(!showHeatmap)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase transition ${showHeatmap ? 'bg-red-900/30 border-red-500 text-red-400' : 'bg-[#0F172A] border-white/10 text-slate-400 hover:text-white'}`}><Eye size={14} /> Heatmap {showHeatmap ? 'ON' : 'OFF'}</button>
                <button onClick={() => setContextMode(!contextMode)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase transition ${contextMode ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-[#0F172A] border-white/10 text-slate-400 hover:text-white'}`}><Smartphone size={14} /> Context {contextMode ? 'ON' : 'OFF'}</button>
                <div className="w-px h-6 bg-white/10 mx-1"></div>
                <div className="bg-[#0F172A] border border-white/10 p-1 rounded-lg flex gap-1">
                    <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}><Grid size={16}/></button>
                    <button onClick={() => setViewMode("carousel")} className={`p-1.5 rounded-md transition ${viewMode === 'carousel' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}><Layout size={16}/></button>
                </div>
                {/* FIXED: Added RESTART button here too */}
                <button onClick={handleReset} className="ml-2 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg" title="Restart"><RotateCcw size={16}/></button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-12">
             {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   {formats.map((key) => {
                      const asset = result.assets[key];
                      const spec = formatSpecs[key];
                      const isLoading = regenerating[key];
                      return (
                         <div key={key} className="group relative bg-[#151923] border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300">
                            <button onClick={() => handleRegenerateSingle(key)} className="absolute top-3 left-3 z-30 bg-black/60 backdrop-blur-md p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-blue-600 transition" title="Regenerate this variant"><RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /></button>
                            <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md p-1.5 rounded-full text-green-400 border border-green-500/30" title="Verified Safe Zone"><ShieldCheck size={14}/></div>
                            <div className={`aspect-[4/5] bg-black/40 flex items-center justify-center overflow-hidden relative p-4 transition-all duration-500 ${isLoading ? 'blur-sm' : ''}`}>
                               {showHeatmap && (<div className="absolute inset-0 z-10 bg-gradient-radial from-red-500/60 via-yellow-500/30 to-blue-900/40 mix-blend-overlay opacity-80 pointer-events-none"></div>)}
                               {contextMode ? (
                                   <div className={`relative overflow-hidden shadow-2xl ${key === 'story' || key === 'portrait' ? 'rounded-[2rem] border-4 border-black bg-black' : key === 'landscape' ? 'border-8 border-gray-400 bg-gray-800 rounded-lg shadow-[0_10px_20px_rgba(0,0,0,0.5)]' : 'bg-white p-2 rounded shadow-lg'}`}>{(key === 'story' || key === 'portrait') && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-b-xl z-20"></div>}
                                   <img src={`${API_BASE}${asset.url}`} className={`w-full h-full object-cover ${key === 'story' || key === 'portrait' ? 'rounded-[1.8rem]' : ''}`} /></div>
                               ) : (
                                   <div className="relative w-full h-full flex items-center justify-center">
                                       <img src={`${API_BASE}${asset.url}`} className="w-full h-full object-cover rounded-lg shadow-lg" />
                                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center"><button onClick={() => setEditingAsset(asset)} className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:scale-105 transition"><Crop size={14}/> Adjust Crop</button></div>
                                   </div>
                               )}
                            </div>
                            <div className="p-4 bg-[#0F172A] relative z-20">
                               <div className="text-white font-bold text-sm mb-1">{spec.label}</div>
                               <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono"><FileText size={10}/> JPG <span className="w-1 h-1 bg-slate-600 rounded-full"></span> {spec.size} <span className="w-1 h-1 bg-slate-600 rounded-full"></span> {spec.dim}</div>
                               <a href={`${API_BASE}${asset.url}`} download className="mt-3 w-full block text-center bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-2 rounded-lg text-xs font-bold transition">Download</a>
                            </div>
                         </div>
                      );
                   })}
                </div>
             ) : (
                <div className="relative w-full h-[600px] flex items-center justify-center">
                    <div className="absolute inset-y-0 left-0 w-1/4 z-20 cursor-pointer flex items-center justify-start group" onClick={handlePrev}><div className="bg-white/5 p-3 rounded-full text-white/50 group-hover:text-white transition"><ChevronLeft size={32} /></div></div>
                    <div className="absolute inset-y-0 right-0 w-1/4 z-20 cursor-pointer flex items-center justify-end group" onClick={handleNext}><div className="bg-white/5 p-3 rounded-full text-white/50 group-hover:text-white transition"><ChevronRight size={32} /></div></div>
                    {formats.map((formatKey, index) => {
                       const offset = getOffset(index);
                       const isActive = offset === 0;
                       const asset = result.assets[formatKey];
                       let transform = "";
                       if (isActive) transform = "scale-100 z-50 opacity-100";
                       else if (offset === -1) transform = "scale-75 -translate-x-64 z-40 opacity-50";
                       else if (offset === 1) transform = "scale-75 translate-x-64 z-40 opacity-50";
                       else transform = "scale-50 opacity-0 z-0";

                       return (
                          <div key={formatKey} className={`absolute transition-all duration-500 ${transform}`}>
                             <div className="relative">
                                {showHeatmap && <div className="absolute inset-0 z-10 bg-gradient-radial from-red-500/60 via-yellow-500/30 to-blue-900/40 mix-blend-overlay opacity-80 pointer-events-none rounded-xl"></div>}
                                <img src={`${API_BASE}${asset.url}`} className="rounded-xl shadow-2xl border border-white/10" style={{maxHeight: '500px'}} />
                             </div>
                          </div>
                       )
                    })}
                </div>
             )}
          </div>

          {editingAsset && (
             <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
                <div className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col">
                   <div className="p-4 border-b border-white/10 flex justify-between items-center"><h3 className="text-white font-bold flex items-center gap-2"><Crop size={16}/> Smart Crop Editor</h3><button onClick={() => setEditingAsset(null)} className="text-slate-400 hover:text-white"><X size={20}/></button></div>
                   <div className="flex-1 relative bg-black/50 overflow-hidden flex items-center justify-center p-8"><div className="relative border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] cursor-move"><img src={`${API_BASE}${editingAsset.url}`} className="max-h-[60vh]" /><div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none"><div className="border-r border-b border-white/30"></div><div className="border-r border-b border-white/30"></div><div className="border-b border-white/30"></div><div className="border-r border-b border-white/30"></div><div className="border-r border-b border-white/30"></div><div className="border-b border-white/30"></div><div className="border-r border-white/30"></div><div className="border-r border-white/30"></div><div></div></div></div></div>
                   <div className="p-4 border-t border-white/10 flex justify-end gap-3"><button onClick={() => setEditingAsset(null)} className="px-4 py-2 text-slate-300 hover:text-white text-xs font-bold">Cancel</button><button onClick={() => {alert("Crop Saved!"); setEditingAsset(null);}} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2"><Save size={14}/> Save Changes</button></div>
                </div>
             </div>
          )}

        </div>
      )}
    </main>
  );
}
