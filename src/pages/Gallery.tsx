import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

export default function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would require a backend endpoint to list files
    // For now, let's use a pattern with error handling
    const loadImages = async () => {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      const foundImages = [];

      // Try common naming patterns
      for (let i = 1; i <= 30; i++) {
        for (const ext of imageExtensions) {
          const img = new Image();
          img.src = `/gallery/image${i}.${ext}`;
          try {
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              setTimeout(reject, 1000); // Timeout after 1 second
            });
            foundImages.push({
              id: `photo-${i}`,
              url: `/gallery/image${i}.${ext}`,
              title: `Event Moment ${i}`
            });
            break; // Found the image, stop trying extensions
          } catch {
            // Continue to next extension
          }
        }
      }

      setPhotos(foundImages);
      setLoading(false);
    };

    loadImages();
  }, []);

  if (loading) {
    return (
        <PageTransition className="pt-24 pb-20 min-h-screen">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading gallery...</p>
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
              Relive the best moments from our past events. {photos.length} images in gallery.
            </p>
          </div>

          {/* Masonry Grid */}
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {photos.map((photo, i) => (
                <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: (i % 5) * 0.1 }}
                    className="relative group rounded-2xl overflow-hidden cursor-pointer break-inside-avoid shadow-sm hover:shadow-xl transition-all"
                    onClick={() => setSelectedPhoto(photo.url)}
                >
                  <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white">
                      <ZoomIn className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
            ))}
          </div>
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedPhoto && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative z-10 max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
                >
                  <button
                      onClick={() => setSelectedPhoto(null)}
                      className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                  >
                    <X className="w-8 h-8" />
                  </button>
                  <img
                      src={selectedPhoto}
                      alt="Full size"
                      className="w-auto h-auto max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
                  />
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </PageTransition>
  );
}