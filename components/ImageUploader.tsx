
import React, { useRef } from 'react';
import { ImageData } from '../types';

interface ImageUploaderProps {
  label: string;
  icon: string;
  image: ImageData | null;
  onImageChange: (data: ImageData | null) => void;
  description: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, icon, image, onImageChange, description }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange({
          base64: reader.result as string,
          mimeType: file.type,
          previewUrl: URL.createObjectURL(file),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div 
      onClick={() => fileInputRef.current?.click()}
      className={`relative group cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-300 min-h-[300px] flex flex-col items-center justify-center p-6 ${
        image ? 'border-pink-500/50 bg-pink-500/5' : 'border-white/10 hover:border-white/30 hover:bg-white/5'
      }`}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      {image ? (
        <div className="relative w-full h-full animate-in fade-in zoom-in duration-300">
          <img 
            src={image.previewUrl} 
            alt={label} 
            className="w-full h-[250px] object-cover rounded-xl shadow-2xl" 
          />
          <button 
            onClick={clearImage}
            className="absolute -top-3 -right-3 w-8 h-8 bg-black/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors border border-white/20"
          >
            <i className="fa-solid fa-times text-sm"></i>
          </button>
          <div className="mt-4 text-center">
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-gray-500 mt-1">Click to change photo</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <i className={`fa-solid ${icon} text-2xl text-gray-400 group-hover:text-pink-500 transition-colors`}></i>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">{label}</h3>
          <p className="text-sm text-gray-500 max-w-[200px] mx-auto leading-relaxed">
            {description}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
