"use client";
import { useState } from "react";
import { Upload, Wand2, Loader2, CheckCircle } from "lucide-react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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
        // Simple Result View (Basic for this commit)
        <div className="text-center z-10">
            <h2 className="text-2xl font-bold mb-6 text-white">Generation Complete</h2>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 inline-block shadow-2xl">
                <img src={result.assets.square.url} className="rounded-xl max-w-sm" />
            </div>
            <div className="mt-8">
                <button onClick={() => setResult(null)} className="text-slate-400 hover:text-white text-sm underline">Start New Campaign</button>
            </div>
        </div>
      )}
    </main>
  );
}