import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Star, Loader2, AlertCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';


const ImageUploader = ({ value = [], onChange, maxImages = 10, label = 'Product Images' }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const [error,     setError]     = useState('');
  const inputRef = useRef(null);

  const uploadFiles = useCallback(async (files) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    if (value.length + fileArray.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const invalid = fileArray.find((f) => !validTypes.includes(f.type));
    if (invalid) { setError('Only image files are allowed (jpg, png, webp, gif)'); return; }

    const oversized = fileArray.find((f) => f.size > 5 * 1024 * 1024);
    if (oversized) { setError('Each image must be under 5 MB'); return; }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      fileArray.forEach((file) => formData.append('images', file));

      const { data } = await axiosInstance.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newUrls = data.images.map((img) => img.url);
      onChange([...value, ...newUrls]);
      toast.success(`${newUrls.length} image${newUrls.length > 1 ? 's' : ''} uploaded`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }, [value, onChange, maxImages]);


  const handleRemove = (index) => {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
  };


  const handleSetCover = (index) => {
    if (index === 0) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
    toast.success('Cover image updated');
  };


  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length) uploadFiles(files);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const canUploadMore = value.length < maxImages && !uploading;

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="label-noir">{label}</label>
        <span className="text-[0.65rem] text-muted">
          {value.length}/{maxImages} · First image is the cover
        </span>
      </div>

      {/* Drop zone */}
      {canUploadMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3
                      border-2 border-dashed rounded-lg p-8 cursor-pointer
                      transition-all duration-200
                      ${dragOver
                        ? 'border-gold-500 bg-gold-500/8'
                        : 'border-white/15 bg-noir-600/50 hover:border-gold-500/40 hover:bg-gold-500/4'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
          />

          {uploading ? (
            <>
              <Loader2 size={28} className="text-gold-500 animate-spin" />
              <p className="text-sm text-muted">Uploading to Cloudinary…</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/20
                              flex items-center justify-center">
                <Upload size={20} className="text-gold-500" />
              </div>
              <div className="text-center">
                <p className="text-sm text-cream font-medium">Drop images here</p>
                <p className="text-[0.75rem] text-muted mt-1">
                  or <span className="text-gold-500 underline underline-offset-2">browse files</span>
                </p>
              </div>
              <p className="text-[0.65rem] text-muted/60">
                JPG, PNG, WebP, GIF · Max 5 MB each · Up to {maxImages} images
              </p>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/8 border border-red-500/20 rounded text-red-400 text-sm">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Image preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((url, index) => (
            <div key={url + index}
              className={`relative group rounded-lg overflow-hidden bg-noir-600 aspect-square
                          border-2 transition-all duration-200
                          ${index === 0
                            ? 'border-gold-500 shadow-lg shadow-gold-500/15'
                            : 'border-white/8 hover:border-gold-500/30'}`}
            >
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Cover badge */}
              {index === 0 && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1
                                bg-gold-500 text-noir-950 text-[0.55rem] font-bold
                                tracking-wider uppercase px-1.5 py-0.5 rounded">
                  <Star size={8} className="fill-noir-950" />
                  Cover
                </div>
              )}

              {/* Hover overlay with actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                              transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                {/* Set as cover button */}
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetCover(index)}
                    title="Set as cover"
                    className="flex items-center gap-1 px-2 py-1 bg-gold-500 text-noir-950
                               rounded text-[0.6rem] font-bold tracking-wider uppercase
                               hover:bg-gold-400 transition-colors"
                  >
                    <Star size={9} /> Set Cover
                  </button>
                )}
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  title="Remove image"
                  className="flex items-center gap-1 px-2 py-1 bg-red-500/80 text-white
                             rounded text-[0.6rem] font-bold tracking-wider uppercase
                             hover:bg-red-500 transition-colors"
                >
                  <X size={9} /> Remove
                </button>
              </div>

              {/* Image number */}
              <div className="absolute bottom-1 right-1.5 text-[0.55rem] text-white/60">
                {index + 1}/{value.length}
              </div>
            </div>
          ))}

          {/* Add more slot — shows when there's room and not actively uploading */}
          {!canUploadMore && value.length >= maxImages && (
            <div className="aspect-square rounded-lg border-2 border-dashed border-white/8
                            flex items-center justify-center">
              <p className="text-[0.6rem] text-muted text-center px-2">Max images reached</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {value.length === 0 && !canUploadMore && (
        <div className="flex items-center justify-center gap-2 py-4 text-muted">
          <Image size={16} />
          <span className="text-sm">No images yet</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
