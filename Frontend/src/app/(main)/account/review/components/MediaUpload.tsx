import { Label } from "@/components/ui/label"
import { Camera, Upload, X } from 'lucide-react'

interface MediaUploadProps {
  productId: string
  images: string[]
  videos: string[]
  onImagesChange: (images: string[]) => void
  onVideosChange: (videos: string[]) => void
}

export function MediaUpload({ productId, images, videos, onImagesChange, onVideosChange }: MediaUploadProps) {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
      onImagesChange([...images, ...newImages].slice(0, 5))
    }
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newVideos = Array.from(files).map(file => URL.createObjectURL(file))
      onVideosChange([...videos, ...newVideos].slice(0, 3))
    }
  }

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  const removeVideo = (index: number) => {
    onVideosChange(videos.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <Label>Thêm hình ảnh và video</Label>
      
      {/* Images Section */}
      <div className="space-y-2">
        <span className="text-sm text-gray-600">Hình ảnh (tối đa 5)</span>
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image || "/placeholder.svg"}
                alt={`Product ${productId} image ${index + 1}`}
                className="w-full aspect-square object-cover rounded border transition-opacity group-hover:opacity-75"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Xóa ảnh"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {images.length < 5 && (
            <label className="media-upload-area aspect-square flex flex-col items-center justify-center bg-gray-300 rounded-sm">
              <Camera className="w-4 h-4 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500 text-center">Thêm ảnh</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Videos Section */}
      <div className="space-y-2">
        <span className="text-sm text-gray-600">Video (tối đa 3)</span>
        <div className="grid grid-cols-3 gap-2 ">
          {videos.map((video, index) => (
            <div key={index} className="relative group ">
              <video
                src={video}
                className="w-full aspect-video object-cover rounded border transition-opacity group-hover:opacity-75"
                controls
                preload="metadata"
              />
              <button
                onClick={() => removeVideo(index)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Xóa video"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {videos.length < 3 && (
            <label className="media-upload-area aspect-video flex flex-col items-center justify-center bg-gray-300 rounded-sm">
              <Upload className="w-4 h-4 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500 text-center">Thêm video</span>
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-500">
        Hình ảnh và video giúp người mua khác hiểu rõ hơn về sản phẩm. Video tối đa 30MB mỗi file.
      </p>
    </div>
  )
}
