
import React, { useState, useEffect } from 'react';
import Header from './components/Header.tsx';
import ImageUploader from './components/ImageUploader.tsx';
import { ImageData, ProcessingStatus } from './types.ts';
import { performVirtualTryOn, editImageWithPrompt } from './services/geminiService.ts';

const App: React.FC = () => {
  const [bodyImage, setBodyImage] = useState<ImageData | null>(null);
  const [outfitImage, setOutfitImage] = useState<ImageData | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState<string>('');

  const handleTryOn = async () => {
    if (!bodyImage || !outfitImage) {
      setErrorMessage("Lütfen hem kendi fotoğrafınızı hem de kıyafet fotoğrafını yükleyin.");
      return;
    }

    setStatus('processing');
    setErrorMessage(null);

    try {
      const result = await performVirtualTryOn(bodyImage, outfitImage);
      setResultImage(result);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
      setStatus('error');
    }
  };

  const handleEdit = async () => {
    if (!resultImage || !editPrompt) return;
    setStatus('processing');
    try {
      const result = await editImageWithPrompt(resultImage, editPrompt);
      setResultImage(result);
      setStatus('success');
      setEditPrompt('');
    } catch (err: any) {
      setErrorMessage("Düzenleme sırasında bir hata oluştu.");
      setStatus('error');
    }
  };

  const resetAll = () => {
    setBodyImage(null);
    setOutfitImage(null);
    setResultImage(null);
    setStatus('idle');
    setErrorMessage(null);
  };

  const loadingMessages = [
    "Vücut hatları analiz ediliyor...",
    "Kumaş dokusu işleniyor...",
    "Işık ve gölge dengeleniyor...",
    "Kıyafet vücuda dikiliyor...",
    "Son dokunuşlar yapılıyor...",
  ];

  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    let interval: any;
    if (status === 'processing') {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="min-h-screen pb-20 bg-[#0a0a0a] text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-6 mt-12">
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 text-xs font-bold mb-6 uppercase tracking-widest">
            <i className="fa-solid fa-bolt-lightning"></i> Puter AI Optimized
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            Sanal Gardırobun <br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent italic">
              Yapay Zeka
            </span> ile Buluşuyor
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Kendi fotoğrafını ve beğendiğin kıyafeti yükle, AI senin için gerçekçi bir deneme yapsın.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-8">
            <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-sm">1</span>
                <h3 className="text-xl font-bold">Fotoğrafları Seç</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploader 
                  label="Senin Fotoğrafın"
                  icon="fa-user"
                  description="Boydan ve net bir fotoğraf."
                  image={bodyImage}
                  onImageChange={setBodyImage}
                />
                <ImageUploader 
                  label="Kıyafet"
                  icon="fa-shirt"
                  description="Kıyafetin net fotoğrafı."
                  image={outfitImage}
                  onImageChange={setOutfitImage}
                />
              </div>

              <button 
                disabled={status === 'processing' || !bodyImage || !outfitImage}
                onClick={handleTryOn}
                className="w-full py-5 rounded-2xl font-black text-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-30 group"
              >
                {status === 'processing' ? 'İŞLENİYOR...' : 'GIYDİR'}
              </button>
              
              {errorMessage && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="glass h-full rounded-3xl p-8 flex flex-col items-center justify-center relative min-h-[600px] border border-white/5">
              {status === 'processing' ? (
                <div className="text-center space-y-8">
                  <div className="w-20 h-20 border-4 border-t-pink-500 border-white/10 rounded-full animate-spin mx-auto"></div>
                  <p className="text-pink-400 font-medium">{loadingMessages[loadingMsgIdx]}</p>
                </div>
              ) : resultImage ? (
                <div className="w-full flex flex-col items-center gap-8">
                  <img src={resultImage} alt="Result" className="w-full max-w-md rounded-2xl shadow-2xl border border-white/10" />
                  <div className="w-full max-w-md bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="Örn: Arka planı değiştir..." 
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                      />
                      <button onClick={handleEdit} className="px-6 bg-white text-black font-black rounded-xl text-xs">UYGULA</button>
                    </div>
                  </div>
                  <button onClick={resetAll} className="text-gray-500 hover:text-pink-500 transition-colors text-sm font-bold">Yeni Fotoğraflar Dene</button>
                </div>
              ) : (
                <div className="text-center max-w-sm">
                  <i className="fa-solid fa-wand-magic-sparkles text-4xl text-gray-700 mb-6"></i>
                  <h3 className="text-2xl font-bold text-gray-400">Stilini Keşfet</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
