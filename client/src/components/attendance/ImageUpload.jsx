// src/components/attendance/ImageUpload.jsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone'; 
import { ImagePlus, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUpload = ({ images, setImages }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [deleteArmedIndex, setDeleteArmedIndex] = useState(null);
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const LONG_PRESS_MS = 500;
  
  const onDrop = useCallback((acceptedFiles) => {
    // Limit to 4 images total
    const remainingSlots = 4 - images.length;
    const newBatch = acceptedFiles.slice(0, remainingSlots).map(file => 
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    
    setImages([...images, ...newBatch]);
  }, [images, setImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    disabled: images.length >= 4
  });

  const removeImage = (index) => {
    const updated = [...images];
    URL.revokeObjectURL(updated[index].preview); // Clean up memory
    updated.splice(index, 1);
    setImages(updated);

    // If user deletes the currently opened image, close the lightbox.
    if (lightboxIndex === index) {
      setLightboxIndex(null);
    } else if (typeof lightboxIndex === 'number' && lightboxIndex > index) {
      // Keep the same image visible if indices shift.
      setLightboxIndex(lightboxIndex - 1);
    }
    if (deleteArmedIndex === index) {
      setDeleteArmedIndex(null);
    }
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex]);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const armDeleteForIndex = (index) => {
    setDeleteArmedIndex(index);
  };

  const handlePressStart = (index) => (e) => {
    // Prevent the browser's native image drag behavior from interfering on mobile.
    if (e?.type === 'dragstart') e.preventDefault();

    longPressTriggeredRef.current = false;
    clearLongPressTimer();
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      armDeleteForIndex(index);
    }, LONG_PRESS_MS);
  };

  const handlePressEnd = () => {
    clearLongPressTimer();
  };

  const handlePreviewClick = (index) => () => {
    // If we just long-pressed, suppress the click-to-open.
    if (longPressTriggeredRef.current) return;

    // If delete mode is armed for this image, first tap dismisses it.
    if (deleteArmedIndex === index) {
      setDeleteArmedIndex(null);
      return;
    }
    setLightboxIndex(index);
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Zone */}
      {images.length < 4 && (
        <div 
          {...getRootProps()} 
          className={`
            border-2 border-dashed rounded-2xl p-8 md:p-12 
            flex flex-col items-center justify-center transition-all
            ${isDragActive ? 'border-(--secondary-accent) bg-(--secondary-bg)' : 'border-(--secondary-accent)/20 bg-white'}
            ${images.length >= 4 ? 'opacity-50 cursor-not-allowed' : 'hover:border-(--secondary-accent)/50 cursor-pointer'}
          `}
          style={{ cursor: images.length < 4 ? 'pointer' : 'not-allowed' }}
        >
          <input {...getInputProps()} />
          <div className="p-4 rounded-full bg-(--secondary-bg) text-(--secondary-accent) mb-4">
            <ImagePlus size={32} />
          </div>
          <h3 className="font-jakarta font-bold text-(--primary-text) text-center">
            {isDragActive ? "Drop the images here" : "Upload Classroom Photos"}
          </h3>
          <p className="text-sm text-(--primary-text)/50 text-center mt-1">
            Drag & drop or click to select (Max 4 photos)
          </p>
        </div>
      )}

      {/* Preview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatePresence>
          {images.map((file, index) => (
            <motion.div
              key={file.preview}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group aspect-square rounded-xl overflow-hidden border border-(--secondary-bg) shadow-sm"
              onPointerDown={handlePressStart(index)}
              onPointerUp={handlePressEnd}
              onPointerCancel={handlePressEnd}
              onPointerLeave={handlePressEnd}
              onTouchStart={handlePressStart(index)}
              onTouchEnd={handlePressEnd}
              onTouchCancel={handlePressEnd}
              onContextMenu={(e) => {
                if (deleteArmedIndex === index) e.preventDefault();
              }}
              onClick={handlePreviewClick(index)}
              role="button"
              tabIndex={0}
              aria-label={`Open preview image ${index + 1}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePreviewClick(index)();
                }
              }}
            >
              <img 
                src={file.preview} 
                className="w-full h-full object-cover" 
                alt="Preview" 
                draggable={false}
              />
              
              {/* Delete action: hover (desktop) + long-press (mobile) */}
              <div
                className={`absolute inset-0 bg-(--primary-accent)/40 transition-opacity flex items-center justify-center ${
                  deleteArmedIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                  className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                  style={{ cursor: 'pointer' }}
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tag */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-[10px] font-bold text-(--primary-accent)">
                IMG_0{index + 1}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-(--primary-text)/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              className="relative w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeLightbox}
                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-(--primary-bg) border border-(--secondary-bg) shadow-sm flex items-center justify-center text-(--primary-accent)"
                aria-label="Close preview"
                style={{ cursor: 'pointer' }}
              >
                <X size={18} />
              </button>

              <div className="w-full max-h-[80vh] rounded-2xl overflow-hidden border border-(--secondary-bg) bg-(--primary-bg)">
                <img
                  src={images[lightboxIndex].preview}
                  alt={`Preview ${lightboxIndex + 1}`}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty States placeholders for remaining slots */}
      {images.length > 0 && images.length < 4 && (
        <div className="flex items-center gap-2 text-[10px] font-bold text-(--primary-text)/30 uppercase tracking-widest mt-2">
          <Camera size={12} />
          <span>{4 - images.length} slots remaining</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;