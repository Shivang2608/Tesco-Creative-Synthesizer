"use client";
import { useState, useEffect } from "react";
import { Upload, Wand2, Loader2, CheckCircle, ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeIndex, setActiveIndex] = useState(2);
  const formats = ['square', 'story', 'landscape', 'portrait'];
  const handleNext = () => setActiveIndex((prev) => (prev + 1) % formats.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + formats.length) % formats.length);
  
  const getOffset = (index) => {
    const diff = index - activeIndex;
    if (diff === 0) return 0;
    if (diff === 1 || diff === -3) return 1; // Right neighbor
    if (diff === -1 || diff === 3) return -1; // Left neighbor
    return 2; // Hidden
  };
  const [scanning, setScanning] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  
  const generateAd = async () => {
    if (!selectedFile || !prompt) return alert("Please upload file and enter prompt");
    setLoading(true);
    setResult(null);
    setDisplayScore(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("prompt", prompt);

    try {
      const response = await fetch("http://127.0.0.1:8000/generate-campaign", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setLoading(false);
      setResult(data);
      setScanning(true);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (scanning && result) {
      const targetScore = result.compliance.compliance_score; // Get score from backend
      const duration = 2000; // 2 seconds
      const increment = targetScore / 60; // 60fps approx
      
      let currentScore = 0;
      const timer = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
          setDisplayScore(targetScore);
          clearInterval(timer);
          // Wait 1 second then finish scanning
          setTimeout(() => setScanning(false), 1000);
        } else {
          setDisplayScore(Math.floor(currentScore));
        }
      }, 30);
      
      return () => clearInterval(timer);
    }
  }, [scanning, result]);
  return (
    <main className="min-h-screen bg-[#050B14] text-white font-sans flex flex-col items-center justify-center p-4">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-20 px-8 z-30 flex justify-between items-center border-b border-white/5 bg-[#050B14]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white font-bold px-3 py-1 rounded text-xs tracking-widest uppercase">TCS</div>
          <h1 className="text-sm font-semibold tracking-tight text-slate-200 uppercase opacity-80">Tesco Creative Synthesizer</h1>
        </div>
      </header>

      {!result ? (
        <div className="flex flex-col gap-6 w-full max-w-lg z-10 pt-20">
            {/* Input Ring */}
            <div className="flex justify-center">
                <label className="w-64 h-64 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center cursor-pointer relative overflow-hidden group hover:border-blue-500 transition-all">
                    <input type="file" className="hidden" onChange={handleFileChange} />
                    {preview ? (
                        <img src={preview} className="object-contain w-32 h-32 relative z-10" />
                    ) : (
                        <div className="flex flex-col items-center text-slate-500 group-hover:text-white transition-colors">
                            <Upload size={32} />
                            <span className="text-[10px] mt-2 font-bold uppercase tracking-widest">Upload Packshot</span>
                        </div>
                    )}
                </label>
            </div>
            
            {/* Prompt Input */}
            <textarea 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500 transition-all" 
                placeholder="Describe the background scene (e.g., 'A marble counter in a luxury bathroom')..." 
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            
            {/* Generate Button */}
            <button 
                onClick={generateAd} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Wand2 />} 
                {loading ? "Synthesizing..." : "Generate Campaign"}
            </button>
        </div>
      ) : (
       // --- CAROUSEL RESULT VIEW ---
        <div className="relative z-10 flex flex-col h-full pt-20 w-full max-w-6xl animate-in fade-in duration-700">
          
          <div className="flex-1 flex items-center justify-center relative w-full overflow-hidden h-[600px]">
             
             {/* Left Nav */}
             <div className="absolute inset-y-0 left-0 w-1/4 z-20 cursor-pointer flex items-center justify-start pl-8 group" onClick={handlePrev}>
                <div className="bg-white/5 p-3 rounded-full text-white/50 group-hover:text-white group-hover:bg-white/10 transition backdrop-blur-sm">
                   <ChevronLeft size={32} />
                </div>
             </div>
             
             {/* Right Nav */}
             <div className="absolute inset-y-0 right-0 w-1/4 z-20 cursor-pointer flex items-center justify-end pr-8 group" onClick={handleNext}>
                <div className="bg-white/5 p-3 rounded-full text-white/50 group-hover:text-white group-hover:bg-white/10 transition backdrop-blur-sm">
                   <ChevronRight size={32} />
                </div>
             </div>

             {/* Cards */}
             <div className="relative w-full max-w-5xl h-full flex items-center justify-center perspective-[1000px]">
                {formats.map((formatKey, index) => {
                   const offset = getOffset(index);
                   const isActive = offset === 0;
                   const isLeft = offset === -1;
                   const isRight = offset === 1;
                   
                   // Guard clause in case backend hasn't returned this format yet
                   const asset = result.assets[formatKey];
                   if (!asset) return null;

                   let transformClass = "scale-50 opacity-0 z-0 hidden"; 
                   
                   if (isActive) {
                      transformClass = "scale-100 translate-x-0 z-50 opacity-100 shadow-[0_20px_60px_rgba(0,0,0,0.6)]";
                   } else if (isLeft) {
                      transformClass = "scale-[0.85] -translate-x-[60%] rotate-y-12 grayscale-[0.5] z-40 opacity-60 hover:opacity-100 cursor-pointer";
                   } else if (isRight) {
                      transformClass = "scale-[0.85] translate-x-[60%] -rotate-y-12 grayscale-[0.5] z-40 opacity-60 hover:opacity-100 cursor-pointer";
                   }

                   return (
                      <div 
                        key={formatKey} 
                        onClick={() => setActiveIndex(index)} 
                        className={`absolute transition-all duration-700 ease-in-out ${transformClass}`}
                      >
                         <div className="relative bg-[#151923] border border-white/10 rounded-3xl overflow-hidden flex flex-col">
                            {/* Card Header */}
                            {isActive && (
                                <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-linear-to-b from-black/60 to-transparent">
                                    <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                        {asset.label}
                                    </span>
                                </div>
                            )}
                            
                            {/* Image Container */}
                            <div className={`bg-black/40 relative overflow-hidden flex items-center justify-center ${
                                formatKey === 'story' ? 'w-[320px] h-[570px]' : 
                                formatKey === 'square' ? 'w-[500px] h-[500px]' : 
                                formatKey === 'portrait' ? 'w-[400px] h-[500px]' : 
                                'w-[700px] h-[400px]' // Landscape
                            }`}>
                                <img src={asset.url} className="w-full h-full object-cover" />
                            </div>

                            {/* Card Footer (Actions) */}
                            {isActive && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0F1218]/90 backdrop-blur-md border border-white/10 p-1.5 pr-3 rounded-full shadow-xl whitespace-nowrap z-30">
                                    <a href={asset.url} download className="bg-white text-black px-6 py-2 rounded-full text-xs font-bold hover:bg-slate-200 transition flex items-center gap-2">
                                        <Download size={14} /> Download
                                    </a>
                                    <button className="text-slate-400 hover:text-white px-3 py-2 rounded-full transition flex items-center gap-2 text-xs font-medium">
                                        <Share2 size={14} /> Share
                                    </button>
                                </div>
                            )}
                         </div>
                      </div>
                   );
                })}
             </div>
          </div>
          
          {/* Pagination Dots */}
          <div className="h-20 flex justify-center items-start gap-3">
             {formats.map((_, i) => (
                <button 
                    key={i} 
                    onClick={() => setActiveIndex(i)} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-8 bg-green-500' : 'w-2 bg-white/20 hover:bg-white/40'}`} 
                />
             ))}
          </div>
          
          <div className="absolute top-24 right-8">
                <button onClick={() => setResult(null)} className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest border border-white/10 px-4 py-2 rounded-lg transition">New Campaign</button>
          </div>
        </div>
      )}
    </main>
  );
}