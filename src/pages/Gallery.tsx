import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

// Type definitions
interface Photo {
  id: string;
  url: string;
  title: string;
}

interface SelectedPhoto {
  url: string;
  index: number;
}

// Intersection Observer for lazy loading
const useLazyLoad = (ref: React.RefObject<HTMLElement | null>, rootMargin = "50px") => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { rootMargin, threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return isVisible;
};

// Progressive Image Component with Hexagon Shape
const ProgressiveImage = ({
                            src,
                            alt,
                            index,
                            onClick
                          }: {
  src: string;
  alt: string;
  index: number;
  onClick: () => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const isVisible = useLazyLoad(imgRef);

  useEffect(() => {
    if (isVisible && !isInView) {
      setIsInView(true);
    }
  }, [isVisible, isInView]);

  const lowQualitySrc = useMemo(() => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3C/svg%3E`;
  }, []);

  return (
      <motion.div
          ref={imgRef}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            delay: (index % 5) * 0.08,
            duration: 0.5,
            type: "spring",
            stiffness: 100
          }}
          className="relative group cursor-pointer break-inside-avoid"
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          role="article"
          aria-label={`Gallery image: ${alt}`}
          whileHover={{ y: -5 }}
      >
        {/* Hexagon Shape Container */}
        <div className="relative w-full" style={{
          clipPath: "polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)",
          WebkitClipPath: "polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)"
        }}>
          {/* Glowing border effect on hover */}
          <div className={`absolute inset-0 transition-all duration-500 z-20 pointer-events-none ${
              isHovered ? 'opacity-100' : 'opacity-0'
          }`} style={{
            boxShadow: '0 0 20px 4px rgba(168, 85, 247, 0.6), inset 0 0 20px 2px rgba(168, 85, 247, 0.3)'
          }} />

          {/* Image container */}
          <div className="relative overflow-hidden" style={{
            clipPath: "polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)",
            WebkitClipPath: "polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)"
          }}>
            {/* Loading shimmer effect */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-[shimmer_1.5s_infinite] bg-[length:200%_100%]"
                     style={{ backgroundImage: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)' }} />
            )}

            {isInView && (
                <>
                  <img
                      src={lowQualitySrc}
                      alt=""
                      className={`w-full h-auto object-cover transition-opacity duration-300 ${
                          isLoaded ? "opacity-0" : "opacity-100"
                      }`}
                      aria-hidden="true"
                  />

                  <motion.img
                      src={src}
                      alt={alt}
                      className={`w-full h-auto object-cover absolute inset-0 ${
                          isLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      loading="lazy"
                      onLoad={() => setIsLoaded(true)}
                      onError={(e) => {
                        console.error(`Failed to load image: ${src}`);
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                      role="img"
                      aria-label={alt}
                      animate={{ scale: isHovered ? 1.1 : 1 }}
                      transition={{ duration: 0.7, type: "spring", stiffness: 200 }}
                  />
                </>
            )}

            {/* Gradient overlay */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            />

            {/* Zoom button with scale animation */}
            <motion.div
                className="absolute inset-0 bg-black/0 flex items-center justify-center z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
                transition={{ duration: 0.3 }}
            >
              <motion.div
                  className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
              >
                <ZoomIn className="w-6 h-6" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Creative corner accents */}
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-400/50 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-400/50 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none" />
      </motion.div>
  );
};

export default function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedPhoto | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Helper function to check if image exists
  const checkImageExists = useCallback((url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        img.src = '';
        resolve(false);
      }, 2000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      img.src = url;
    });
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      setError(null);

      try {
        const foundImages: Photo[] = [];
        const maxImages = 50;

        for (let i = 1; i <= maxImages; i++) {
          const imagePath = `/gallery/image${i}.jpeg`;
          const exists = await checkImageExists(imagePath);

          if (exists) {
            console.log(`Found image: image${i}.jpeg`);
            foundImages.push({
              id: `photo-${i}`,
              url: imagePath,
              title: `Event Moment ${i}`
            });
          } else {
            if (i > 3 && foundImages.length === 0) {
              break;
            }
          }
        }

        if (foundImages.length === 0) {
          const extensions = ['.jpg', '.png', '.webp'];
          for (let i = 1; i <= 30; i++) {
            for (const ext of extensions) {
              const imagePath = `/gallery/image${i}${ext}`;
              const exists = await checkImageExists(imagePath);
              if (exists) {
                console.log(`Found image: image${i}${ext}`);
                foundImages.push({
                  id: `photo-${i}`,
                  url: imagePath,
                  title: `Event Moment ${i}`
                });
                break;
              }
            }
          }
        }

        if (foundImages.length === 0) {
          setError(`No images found in /public/gallery/ folder. Make sure your images are named like: image1.jpeg, image2.jpeg, etc.`);
        } else {
          console.log(`Total images found: ${foundImages.length}`);
        }

        setPhotos(foundImages);
      } catch (err) {
        setError('Failed to load gallery images');
        console.error('Error loading images:', err);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [checkImageExists]);

  const handlePhotoClick = useCallback((url: string, index: number) => {
    setSelectedPhoto({ url, index });
    document.body.style.overflow = 'hidden';
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setSelectedPhoto(null);
    document.body.style.overflow = '';
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;

      if (e.key === 'Escape') {
        handleCloseLightbox();
      } else if (e.key === 'ArrowLeft') {
        const prevIndex = selectedPhoto.index - 1;
        if (prevIndex >= 0 && photos[prevIndex]) {
          setSelectedPhoto({
            url: photos[prevIndex].url,
            index: prevIndex
          });
        }
      } else if (e.key === 'ArrowRight') {
        const nextIndex = selectedPhoto.index + 1;
        if (nextIndex < photos.length && photos[nextIndex]) {
          setSelectedPhoto({
            url: photos[nextIndex].url,
            index: nextIndex
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, photos, handleCloseLightbox]);

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
        <PageTransition className="pt-24 pb-20 min-h-screen">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center" role="status" aria-label="Loading gallery">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading gallery...</p>
            </div>
          </div>
        </PageTransition>
    );
  }

  if (error) {
    return (
        <PageTransition className="pt-24 pb-20 min-h-screen">
          <div className="text-center max-w-2xl mx-auto px-4" role="alert">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Images Found</h3>
              <p className="text-yellow-700 mb-4">{error}</p>
              <div className="text-left text-sm text-yellow-600">
                <p className="font-semibold mb-2">To fix this issue:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Make sure images are in the <code className="bg-yellow-100 px-1 rounded">/public/gallery/</code> folder</li>
                  <li>Your images should be named: <code className="bg-yellow-100 px-1 rounded">image1.jpeg</code>, <code className="bg-yellow-100 px-1 rounded">image2.jpeg</code>, etc.</li>
                  <li>Check that the files exist in the correct location</li>
                  <li>Open browser console (F12) to see which images are being checked</li>
                </ul>
              </div>
            </div>
          </div>
        </PageTransition>
    );
  }

  if (photos.length === 0) {
    return (
        <PageTransition className="pt-24 pb-20 min-h-screen">
          <div className="text-center max-w-2xl mx-auto px-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Gallery is Empty</h3>
              <p className="text-blue-700">
                No images found. Please add images named image1.jpeg, image2.jpeg, etc. to the /public/gallery/ folder.
              </p>
            </div>
          </div>
        </PageTransition>
    );
  }

  return (
      <PageTransition className="pt-24 pb-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Event Gallery</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Relive the best moments from our past events. {photos.length} {photos.length === 1 ? 'image' : 'images'} in gallery.
            </p>
          </div>

          {/* Masonry Grid */}
          <div
              ref={galleryRef}
              className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6"
              role="region"
              aria-label="Image gallery"
          >
            {photos.map((photo, i) => (
                <ProgressiveImage
                    key={photo.id}
                    src={photo.url}
                    alt={photo.title}
                    index={i}
                    onClick={() => handlePhotoClick(photo.url, i)}
                />
            ))}
          </div>
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedPhoto && (
              <div
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Image lightbox"
              >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleCloseLightbox}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    role="button"
                    aria-label="Close lightbox"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative z-10 max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
                >
                  <button
                      onClick={handleCloseLightbox}
                      className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                      aria-label="Close lightbox"
                  >
                    <X className="w-8 h-8" />
                  </button>

                  {selectedPhoto.index > 0 && (
                      <button
                          onClick={() => {
                            const prevIndex = selectedPhoto.index - 1;
                            if (photos[prevIndex]) {
                              setSelectedPhoto({
                                url: photos[prevIndex].url,
                                index: prevIndex
                              });
                            }
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors bg-black/20 rounded-full"
                          aria-label="Previous image"
                      >
                        ←
                      </button>
                  )}

                  {selectedPhoto.index < photos.length - 1 && (
                      <button
                          onClick={() => {
                            const nextIndex = selectedPhoto.index + 1;
                            if (photos[nextIndex]) {
                              setSelectedPhoto({
                                url: photos[nextIndex].url,
                                index: nextIndex
                              });
                            }
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors bg-black/20 rounded-full"
                          aria-label="Next image"
                      >
                        →
                      </button>
                  )}

                  <img
                      src={selectedPhoto.url}
                      alt={`Full size view of ${photos[selectedPhoto.index]?.title || 'gallery image'}`}
                      className="w-auto h-auto max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
                      loading="eager"
                  />
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </PageTransition>
  );
}