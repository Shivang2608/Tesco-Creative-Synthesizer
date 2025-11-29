"use client";
import { useState } from "react";
import { Upload, Plus } from "lucide-react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  
  return (
    <main className="min-h-screen bg-[#050B14] text-white relative overflow-hidden font-sans flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-20 px-8 z-30 flex justify-between items-center border-b border-white/5 bg-[#050B14]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white font-bold px-3 py-1 rounded text-xs tracking-widest uppercase">TCS</div>
          <h1 className="text-sm font-semibold tracking-tight text-slate-200 uppercase opacity-80">Tesco Creative Synthesizer</h1>
        </div>
      </header>

      {/* Input Stage */}
      <div className="relative h-screen flex flex-col items-center justify-center z-10">
          <div className="relative w-[500px] h-[500px] flex items-center justify-center">
             {/* Simple Ring */}
             <div className="absolute inset-0 rounded-full border border-slate-800"></div>
             
             {/* Upload Area */}
             <label className="relative w-80 h-80 rounded-full bg-[#050B14] border border-slate-800 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                {preview ? (
                    <img src={preview} className="w-40 h-auto object-contain z-10" />
                ) : (
                    <div className="text-slate-600 flex flex-col items-center">
                       <Upload size={48} strokeWidth={1} />
                       <span className="text-[10px] uppercase tracking-[0.2em] mt-4">Upload Packshot</span>
                    </div>
                )}
             </label>
          </div>
      </div>
    </main>
  );
}