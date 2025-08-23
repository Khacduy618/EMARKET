'use client';

import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Camera, Video, X, AlertCircle, FileImage, Film } from 'lucide-react';

// --- Định nghĩa props (giữ nguyên) ---
interface MediaUploadProps {
  productId:string;
  images: (string | File)[];
  videos:(string | File)[];
  onImagesChange: (images: (string | File)[]) => void;
  onVideosChange: (videos: (string | File)[]) => void;
}

// --- Các hằng số để dễ quản lý ---
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_VIDEOS = 1;
const MAX_VIDEO_SIZE_MB = 30;

// --- Component con cho từng khu vực upload ---
const UploadArea = ({
  id, icon, title, description, accept, onFileChange, disabled
}: {
  id: string; icon: React.ReactNode; title: string; description: string; accept: string;
  onFileChange: (files: FileList) => void; disabled: boolean;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); if (!disabled) setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (!disabled && e.dataTransfer.files) { onFileChange(e.dataTransfer.files); }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) { onFileChange(e.target.files); e.target.value = ''; }
  };
  
  const baseClasses = "relative h-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors duration-300 text-center";
  const disabledClasses = "bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400";
  const enabledClasses = `cursor-pointer ${isDragging ? 'border-orange-500 bg-orange-50' : 'border-slate-300 hover:border-orange-400 bg-white hover:bg-slate-50'}`;
  
  return (
    <label
      htmlFor={id}
      className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses}`}
      onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
    >
      {icon}
      <p className={`mt-2 font-semibold ${disabled ? '' : 'text-slate-700'}`}>{title}</p>
      <p className="text-xs text-slate-500">{description}</p>
      <input id={id} type="file" multiple accept={accept} onChange={handleChange} className="hidden" disabled={disabled} />
    </label>
  );
};

// --- Component chính ---
export function MediaUpload({ productId, images, videos, onImagesChange, onVideosChange }: MediaUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const handleImageFiles = (files: FileList) => {
    setError(null);const newImages = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setError(`Ảnh "${file.name}" vượt quá ${MAX_IMAGE_SIZE_MB}MB.`);
        return false;
      }
      return true;
    });

    const combined = [...images, ...newImages];
    if (combined.length > MAX_IMAGES) {
      setError(`Bạn chỉ có thể chọn tối đa ${MAX_IMAGES} hình ảnh.`);
    }
    onImagesChange(combined.slice(0, MAX_IMAGES));
  };
  
  const handleVideoFiles = (files: FileList) => {
    setError(null);
    const newVideos = Array.from(files).filter(file => {
      if (!file.type.startsWith('video/')) return false;
      if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        setError(`Video "${file.name}" vượt quá ${MAX_VIDEO_SIZE_MB}MB.`);
        return false;
      }
      return true;
    });

    const combined = [...videos, ...newVideos];
    if (combined.length > MAX_VIDEOS) {
      setError(`Bạn chỉ có thể chọn tối đa ${MAX_VIDEOS} video.`);
    }
    onVideosChange(combined.slice(0, MAX_VIDEOS));
  };
  
  const removeImage = (index: number) => onImagesChange(images.filter((_, i) => i !== index));
  const removeVideo = (index: number) => onVideosChange(videos.filter((_, i) => i !== index));

  const totalFiles = images.length + videos.length;

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
      <Label className="text-base font-semibold text-slate-800">Chia sẻ hình ảnh & video</Label>
      <p className="text-sm text-slate-500 mt-1">
        Một hình ảnh/video thực tế sẽ giúp ích rất nhiều cho người mua khác!
      </p>

      {/* --- KHU VỰC UPLOAD MỘT HÀNG --- */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Khu vực ảnh (chiếm 2/3 không gian) */}
        <div className="md:col-span-2">
            <UploadArea
                id={`image-upload-${productId}`}
                icon={<Camera className="w-8 h-8 text-slate-400" />}
                title="Thêm hình ảnh"
                description={`Tối đa ${MAX_IMAGES} ảnh (${MAX_IMAGE_SIZE_MB}MB/ảnh)`}
                accept="image/*"
                onFileChange={handleImageFiles}
                disabled={images.length >= MAX_IMAGES}
            />
        </div>
        {/* Khu vực video (chiếm 1/3 không gian) */}
        <div className="md:col-span-1">
            <UploadArea
                id={`video-upload-${productId}`}
                icon={<Video className="w-8 h-8 text-slate-400" />}
                title="Thêm video"
                description={`Tối đa ${MAX_VIDEOS} video (${MAX_VIDEO_SIZE_MB}MB/video)`}
                accept="video/*"
                onFileChange={handleVideoFiles}
                disabled={videos.length >= MAX_VIDEOS}
            />
        </div>
      </div>

      {/* Hiển thị lỗi chung */}
      {error && (<div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* --- GRID HIỂN THỊ CÁC FILE ĐÃ CHỌN --- */}
      {totalFiles > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-3">Đã chọn ({totalFiles})</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
                <div className=" grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-2">

                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    {typeof image === 'string' ? (
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Product image ${index + 1}`}
                        className="w-full aspect-square object-cover rounded border transition-opacity group-hover:opacity-75"
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Product image ${index + 1}`}
                        className="w-full aspect-square object-cover rounded border transition-opacity group-hover:opacity-75"
                      />
                    )}
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Xóa ảnh"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
            
              </div>
            </div>
            <div className="md:col-span-1 flex justify-center">
                {videos.map((video, index) => (
              <div key={index} className="relative group w-50">
                {typeof video === 'string' ? (
                  <video
                    src={video}
                    className="w-full aspect-video object-cover rounded border transition-opacity group-hover:opacity-75"
                    controls
                    preload="metadata"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(video)}
                    className="w-full aspect-video object-cover rounded border transition-opacity group-hover:opacity-75"
                    controls
                    preload="metadata"
                  />
                )}
                <button
                  onClick={() => removeVideo(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Xóa video"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}