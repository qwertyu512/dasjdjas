
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import { ImageData, ProcessingStatus } from './types';
import { performVirtualTryOn, editImageWithPrompt } from './services/geminiService';

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
          {/* Inputs */}
          <div className="lg:col-span-5 space-y-8">
            <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-pink-500/20">1</span>
                <h3 className="text-xl font-bold">Fotoğrafları Seç</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploader 
                  label="Senin Fotoğrafın"
                  icon="fa-user"
                  description="Boydan ve net bir fotoğraf en iyi sonucu verir."
                  image={bodyImage}
                  onImageChange={setBodyImage}
                />
                <ImageUploader 
                  label="Kıyafet"
                  icon="fa-shirt"
                  description="Kıyafetin net göründüğü bir fotoğraf seç."
                  image={outfitImage}
                  onImageChange={setOutfitImage}
                />
              </div>

              <button 
                disabled={(status as string) === 'processing' || !bodyImage || !outfitImage}
                onClick={handleTryOn}
                className="w-full py-5 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-[0.98] bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                {(status as string) === 'processing' ? (
                  <div className="flex items-center justify-center gap-3">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    İŞLENİYOR...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    GIYDİR
                    <i className="fa-solid fa-wand-sparkles group-hover:rotate-12 transition-transform"></i>
                  </div>
                )}
              </button>
              
              {errorMessage && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-start gap-3 animate-pulse">
                  <i className="fa-solid fa-circle-exclamation mt-1"></i>
                  <p>{errorMessage}</p>
                </div>
              )}
            </div>
          </div>

          {/* Result */}
          <div className="lg:col-span-7">
            <div className="glass h-full rounded-3xl p-8 flex flex-col items-center justify-center relative min-h-[600px] border border-white/5">
              {(status as string) === 'processing' ? (
                <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="relative mx-auto w-32 h-32">
                    <div className="absolute inset-0 border-4 border-pink-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-pink-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fa-solid fa-scissors text-3xl text-pink-500"></i>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold tracking-tight">Moda Motoru Çalışıyor</h3>
                    <p className="text-pink-400 font-medium italic animate-pulse">{loadingMessages[loadingMsgIdx]}</p>
                  </div>
                </div>
              ) : resultImage ? (
                <div className="w-full flex flex-col items-center gap-8 animate-in slide-in-from-bottom duration-700">
                  <div className="relative group w-full max-w-md">
                    <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <img 
                      src={resultImage} 
                      alt="StyleSwap Sonucu" 
                      className="relative w-full rounded-2xl shadow-2xl border border-white/10" 
                    />
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                      <a 
                        href={resultImage} 
                        download="benim-tarzim.png"
                        className="w-12 h-12 bg-black/60 hover:bg-pink-600 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/10 shadow-xl"
                        title="İndir"
                      >
                        <i className="fa-solid fa-download"></i>
                      </a>
                    </div>
                  </div>

                  {/* Refinement */}
                  <div className="w-full max-w-md bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                    <h4 className="font-bold text-sm text-gray-400 uppercase tracking-widest">AI İle Düzenle</h4>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="Örn: Arka planı değiştir, ışığı artır..." 
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500/50 transition-colors"
                      />
                      <button 
                        onClick={handleEdit}
                        disabled={!editPrompt}
                        className="px-6 bg-white text-black font-black rounded-xl text-xs hover:bg-pink-500 hover:text-white transition-all disabled:opacity-20"
                      >
                        UYGULA
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={resetAll}
                    className="text-gray-500 hover:text-pink-500 transition-colors text-sm font-bold uppercase tracking-widest"
                  >
                    Yeni Fotoğraflar Dene
                  </button>
                </div>
              ) : (
                <div className="text-center max-w-sm">
                  <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-inner">
                    <i className="fa-solid fa-wand-magic-sparkles text-4xl text-gray-700"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-3">Stilini Keşfet</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Soldaki paneli kullanarak fotoğraflarını yükle. Yapay zeka senin için mükemmel kombini hazırlasın.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-10 glass rounded-[2.5rem] border border-white/5">
            <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-500 mb-6">
              <i className="fa-solid fa-fingerprint text-xl"></i>
            </div>
            <h4 className="text-xl font-bold mb-4">Kişisel Analiz</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Vücut tipini ve duruşunu saniyeler içinde analiz ederek kıyafeti en doğal haliyle üzerine oturtur.
            </p>
          </div>
          <div className="p-10 glass rounded-[2.5rem] border border-white/5">
             <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-6">
              <i className="fa-solid fa-palette text-xl"></i>
            </div>
            <h4 className="text-xl font-bold mb-4">Doku Uyumu</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Kumaşın parlaması, gölgeleri ve kıvrımları orijinal fotoğraftaki ışıkla %100 uyumlu hale getirilir.
            </p>
          </div>
          <div className="p-10 glass rounded-[2.5rem] border border-white/5">
             <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 mb-6">
              <i className="fa-solid fa-infinity text-xl"></i>
            </div>
            <h4 className="text-xl font-bold mb-4">Sınırsız Deneme</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Puter altyapısı sayesinde binlerce farklı kombinasyonu saniyeler içinde tamamen ücretsiz deneyebilirsin.
            </p>
          </div>
        </section>
      </main>

      <footer className="mt-32 py-12 border-t border-white/5 text-center">
        <p className="text-gray-600 text-sm font-medium">
          StyleSwap AI &bull; Powered by Puter & Gemini Nano Banana
        </p>
      </footer>
    </div>
  );
};

export default App;
