
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSearch, 
  Printer, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle, 
  X,
  FileText,
  Scan,
  RefreshCcw
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface HistoryRecord {
  caseNumber: string;
  animalType: string;
  location: string;
  date: string;
  description: string;
}

const HistoryPage: React.FC = () => {
  // Extraction state
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<HistoryRecord | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const processFile = async (file: File) => {

    setIsScanning(true);
    setScannedData(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      setUploadedImage(base64Data);
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const base64Content = base64Data.split(',')[1];

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64Content,
                },
              },
              {
                text: 'Extract the Case Number, Animal Type, Location, Date, and a brief Description from this animal rescue document image or video. Return results in JSON format.',
              },
            ],
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                caseNumber: { type: Type.STRING },
                animalType: { type: Type.STRING },
                location: { type: Type.STRING },
                date: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['caseNumber', 'animalType', 'location', 'date', 'description'],
            },
          },
        });

        const extracted = JSON.parse(response.text || '{}');
        setScannedData(extracted as HistoryRecord);
      } catch (error) {
        console.error("Extraction error:", error);
        alert("Failed to scan document. Please check the image quality and try again.");
        setUploadedImage(null);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setScannedData(null);
    setUploadedImage(null);
    setIsScanning(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase tracking-widest flex items-center gap-3">
            <Scan className="text-[#005F54]" /> History Generater
          </h1>
          <p className="text-slate-500 font-medium italic">Convert physical case records into digital print-ready entries.</p>
        </div>
        {scannedData && (
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCcw size={14} /> Scan New
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        {!scannedData && !isScanning ? (
          <div 
            className={`bg-white rounded-[3rem] border-4 border-dashed transition-colors p-20 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-300 no-print ${isDragging ? 'border-[#005F54] bg-emerald-50/50' : 'border-slate-100'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
             <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center text-[#005F54] shadow-inner">
                <ImageIcon size={48} className="animate-pulse" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-800">Ready to Scan</h2>
                <p className="text-slate-500 font-medium max-w-sm mt-2">Upload or drag and drop a photo or video of an old case sheet or document to extract details and generate a digital registry entry.</p>
             </div>
             <label className="group relative cursor-pointer bg-[#005F54] hover:bg-[#004a42] text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/20 transition-all active:scale-95 flex items-center gap-3">
                <Upload size={20} />
                Choose Media (Image/Video)
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
             </label>
          </div>
        ) : isScanning ? (
          <div className="bg-white rounded-[3rem] border border-slate-100 p-20 flex flex-col items-center justify-center text-center space-y-8 no-print">
             <div className="relative">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <Loader2 size={48} className="animate-spin text-[#005F54]" />
                </div>
                <div className="absolute inset-0 bg-[#005F54]/10 rounded-full animate-ping"></div>
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-800">Gemini AI is Analyzing...</h2>
                <p className="text-slate-500 font-medium mt-2 italic">Scanning for case identifiers, species, and location data.</p>
             </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            {/* Action Bar (No Print) */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center no-print">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-[#005F54] rounded-2xl flex items-center justify-center border border-emerald-100">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Analysis Complete</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Verify and print below</p>
                  </div>
               </div>
               <div className="flex gap-4">
                 <button 
                   onClick={handleReset}
                   className="px-6 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-rose-500 transition-all"
                 >
                   Discard
                 </button>
                 <button 
                   onClick={handlePrint}
                   className="bg-[#005F54] text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-[#004a42] transition-all flex items-center gap-3 active:scale-[0.98]"
                 >
                   <Printer size={18} /> Print Case Entry
                 </button>
               </div>
            </div>

            {/* Printable Area */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 md:p-16 space-y-12 print:border-none print:shadow-none print:p-0">
               {/* Document Header (Internal Copy Style) */}
               <div className="flex justify-between items-center border-b-4 border-slate-900 pb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl">PFA</div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase">People For Animals</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">History Registry Restoration • Internal Document</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Stamp Date</p>
                    <p className="text-sm font-black text-slate-900">{new Date().toLocaleDateString('en-GB')}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="md:col-span-1 space-y-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Original Reference Photo</p>
                      <div className="aspect-[3/4] bg-slate-50 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner">
                        <img src={uploadedImage!} className="w-full h-full object-cover grayscale opacity-80" alt="Scanned Document" />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-10">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Extracted Case ID</p>
                           <p className="text-xl font-black text-slate-900 underline underline-offset-4">{scannedData?.caseNumber}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Biological Class</p>
                           <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                              {scannedData?.animalType}
                           </span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rescue Date</p>
                           <p className="text-sm font-black text-slate-800">{scannedData?.date}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Incident Geography</p>
                           <p className="text-sm font-black text-slate-800 italic">{scannedData?.location}</p>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <FileText size={12} /> Registry Assessment Details
                        </p>
                        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 text-sm font-medium text-slate-700 leading-relaxed italic">
                           "{scannedData?.description}"
                        </div>
                     </div>
                  </div>
               </div>

               <div className="pt-12 mt-12 border-t-2 border-slate-100 flex justify-between items-end">
                  <div className="space-y-2">
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Authorized By Registry Officer</p>
                     <div className="w-48 border-b border-slate-200 h-10"></div>
                     <p className="text-[9px] font-bold text-slate-400 italic">Electronic signature not required for internal scan prints</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">System Validation</p>
                     <p className="text-[10px] font-black text-slate-400">PFA-AI-SCN-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          aside, header { display: none !important; }
          main { padding: 0 !important; width: 100% !important; margin: 0 !important; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default HistoryPage;
