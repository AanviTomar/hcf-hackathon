
import React, { useState, useRef } from 'react';
import { Camera, Upload, ShieldCheck, Factory, AlertCircle, Loader2, Plus, ChevronRight } from 'lucide-react';
import { MachinePart, ExtractionResult } from './types.ts';
import { extractTagData } from './services/geminiService.ts';
import { exportToExcel } from './services/excelService.ts';
import InventoryTable from './components/InventoryTable.tsx';

const App: React.FC = () => {
  const [parts, setParts] = useState<MachinePart[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<ExtractionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const result = await extractTagData(base64String);
          setLastScanned(result);
          updateInventory(result, base64String);
        } catch (e: any) {
          setError(e.message || "Analysis failed.");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setError("File read error.");
      setIsProcessing(false);
    }
  };

  const updateInventory = (result: ExtractionResult, imageUrl: string) => {
    setParts(prev => {
      const existingIndex = prev.findIndex(p => p.name.toLowerCase() === result.name.toLowerCase());
      const newPart: MachinePart = {
        id: existingIndex >= 0 ? prev[existingIndex].id : crypto.randomUUID(),
        ...result,
        lastUpdated: new Date().toISOString(),
        confidence: 0.99,
        imageUrl
      };
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newPart;
        return updated;
      }
      return [newPart, ...prev];
    });
  };

  const deletePart = (id: string) => setParts(prev => prev.filter(p => p.id !== id));
  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-neutral-100 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <Factory className="w-8 h-8 text-black fill-black" />
            <div className="h-6 w-px bg-neutral-200 hidden md:block"></div>
            <span className="font-black text-xl uppercase italic tracking-tighter hidden md:block">Tag2Sheet AI</span>
          </div>
          
          <div className="flex items-center gap-8 font-bold text-xs uppercase tracking-widest text-neutral-500">
            <a href="#" className="hover:text-black transition-colors">Documentation</a>
            <a href="#" className="hover:text-black transition-colors">API Keys</a>
            <div className="relative group">
               <button className="bg-black text-white px-6 py-2 rounded-full hover:bg-neutral-800 transition-all flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-[#C1FF00]" />
                 Verified
               </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center mb-24">
            <div className="lg:col-span-5">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 mb-4 block">Engineered for Accuracy</span>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] italic mb-6">
                SCAN IT.<br/>LOG IT.<br/>SYNC IT.
              </h1>
              <p className="text-neutral-500 text-lg max-w-md leading-relaxed mb-8">
                Convert physical machine tags into structured Excel-ready data instantly. Industrial-grade OCR powered by Gemini AI.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={triggerUpload}
                  disabled={isProcessing}
                  className="bg-black text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:bg-neutral-800 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-neutral-200"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start New Scan'}
                  {!isProcessing && <Plus className="w-5 h-5" />}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </div>

              {error && (
                <div className="mt-6 flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="lg:col-span-7">
              {isProcessing ? (
                <div className="bg-neutral-50 aspect-video rounded-3xl flex flex-col items-center justify-center border border-neutral-100">
                  <div className="w-16 h-1 bg-neutral-200 rounded-full mb-8 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-black w-1/3 animate-[loading_1.5s_infinite_ease-in-out]"></div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black animate-pulse">Processing Industrial Data</span>
                </div>
              ) : lastScanned ? (
                <div className="bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
                   <div className="md:w-1/2 bg-neutral-900 flex items-center justify-center p-8">
                      <div className="relative w-full aspect-square bg-neutral-800 rounded-xl overflow-hidden group">
                        <img 
                          src={parts.find(p => p.name === lastScanned.name)?.imageUrl} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                          alt="Scanned Tag"
                        />
                        <div className="absolute top-4 left-4 bg-[#C1FF00] text-black text-[10px] font-black px-2 py-1 uppercase rounded-sm italic">
                          Live Sync
                        </div>
                      </div>
                   </div>
                   <div className="md:w-1/2 p-10 flex flex-col justify-center text-white">
                      <div className="mb-8">
                        <span className="text-[10px] font-bold text-[#C1FF00] uppercase tracking-[0.3em] mb-2 block">Detection Result</span>
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{lastScanned.name}</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                          <span className="text-xs uppercase text-neutral-500 font-bold">Class</span>
                          <span className="text-xs font-black uppercase">{lastScanned.type}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                          <span className="text-xs uppercase text-neutral-500 font-bold">Material</span>
                          <span className="text-xs font-black uppercase">{lastScanned.material}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                          <span className="text-xs uppercase text-neutral-500 font-bold">Units</span>
                          <span className="text-xs font-black uppercase">{lastScanned.units}</span>
                        </div>
                      </div>

                      <button onClick={triggerUpload} className="mt-8 text-xs font-black uppercase tracking-widest flex items-center gap-2 text-[#C1FF00] hover:translate-x-1 transition-transform">
                        Next Product <ChevronRight className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              ) : (
                <div className="aspect-video bg-neutral-50 border border-neutral-100 rounded-3xl flex items-center justify-center p-12 text-center group cursor-pointer" onClick={triggerUpload}>
                  <div className="bg-white p-6 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <Camera className="w-10 h-10 text-neutral-200 group-hover:text-black transition-colors" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <InventoryTable 
            parts={parts} 
            onDelete={deletePart} 
            onExport={() => exportToExcel(parts)}
          />
        </div>
      </main>

      <footer className="py-20 border-t border-neutral-100 bg-black text-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div>
              <h4 className="font-black italic uppercase text-2xl tracking-tighter mb-4">Industrial Evolution</h4>
              <p className="text-neutral-500 text-sm max-w-xs">Built for the next generation of supply chain managers. Automated. Intelligent. Unstoppable.</p>
            </div>
            <div className="flex gap-20">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest mb-2">Systems</span>
                <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">Data Export</a>
                <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">API Docs</a>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest mb-2">Support</span>
                <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">Enterprise</a>
                <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-neutral-900 flex justify-between items-center text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
            <span>&copy; 2025 Tag2Sheet AI Industrial</span>
            <div className="flex gap-6">
              <span>Privacy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
