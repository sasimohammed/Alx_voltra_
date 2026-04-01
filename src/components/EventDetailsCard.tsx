import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, MapPin, Users, X, Clock, Tag, Target,
    Image as ImageIcon, User, Award, Globe, ChevronLeft, ChevronRight,
    Sparkles, Zap, Building2, Clock3
} from "lucide-react";

interface EventDetailsCardProps {
    eventId: string;
    token: string;
    isOpen: boolean;
    onClose: () => void;
}

interface EventSpeaker {
    name: string;
    position: string;
    image?: string;
}

interface EventDetails {
    id: string;
    title: string;
    date: string;
    city: string;
    description: string;
    type: string;
    category: string;
    image: string;
    status: string;
    speakers: EventSpeaker[];
    attendees: number;
    time: string;
    is_finished: boolean;
    venue: string;
    target_audience: string;
    photos: string[];
}

// Format time helper
const formatTime = (dateString: string) => {
    try {
        const timePart = dateString.split('T')[1].split('.')[0];
        const [hours, minutes] = timePart.split(':');
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        const displayMinutes = minutes;
        return `${displayHour}:${displayMinutes} ${period}`;
    } catch {
        return "All Day";
    }
};


const NODE_API_URL = 'https://node-core-1qx9.vercel.app';
const DJANGO_API_URL = 'https://django-kf3s.vercel.app';
// Format date helper
const formatEventDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC'
        });
    } catch {
        return "Invalid date";
    }
};

// Transform API event data
const transformEvent = (apiEvent: any): EventDetails => ({
    id: apiEvent.event_id || apiEvent.id,
    title: apiEvent.title || "Untitled Event",
    date: apiEvent.date || new Date().toISOString().split('T')[0],
    city: apiEvent.city || "Unknown City",
    description: apiEvent.description || "",
    type: apiEvent.type || "unknown",
    category: apiEvent.category || "General",
    image: apiEvent.photos && apiEvent.photos.length > 0
        ? apiEvent.photos[0]
        : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
    status: apiEvent.is_finished ? "Past" : "Upcoming",
    speakers: apiEvent.event_speakers || apiEvent.speakers || [],
    attendees: apiEvent.num_attendees || 0,
    time: formatTime(apiEvent.date),
    is_finished: apiEvent.is_finished,
    venue: apiEvent.venue,
    target_audience: apiEvent.target_audience,
    photos: apiEvent.photos || []
});

export default function EventDetailsCard({ eventId, token, isOpen, onClose }: EventDetailsCardProps) {
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (isOpen && eventId && token) {
            fetchEventDetails();
        }
    }, [isOpen, eventId, token]);

    const fetchEventDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log(`📡 Fetching event details for ID: ${eventId} from /api/events/${eventId}`);

            const response = await fetch(`${NODE_API_URL}/api/events/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch event details: ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ Real event details received:", data);

            const detailedEvent = transformEvent(data.data || data);
            setEvent(detailedEvent);

            if (detailedEvent.photos && detailedEvent.photos.length > 0) {
                setSelectedImage(detailedEvent.photos[0]);
            }
        } catch (err) {
            console.error("❌ Error fetching event details:", err);
            setError(err instanceof Error ? err.message : "Failed to load event details");
        } finally {
            setLoading(false);
        }
    };

    const nextImage = () => {
        if (!event?.photos) return;
        const newIndex = (currentImageIndex + 1) % event.photos.length;
        setCurrentImageIndex(newIndex);
        setSelectedImage(event.photos[newIndex]);
    };

    const prevImage = () => {
        if (!event?.photos) return;
        const newIndex = (currentImageIndex - 1 + event.photos.length) % event.photos.length;
        setCurrentImageIndex(newIndex);
        setSelectedImage(event.photos[newIndex]);
    };

    const formatCategory = (category: string) => {
        if (!category) return "General";
        return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm dark:bg-gradient-to-br dark:from-gray-900/95 dark:via-gray-900/98 dark:to-black/95"
                    />

                    {/* Card - Reduced height */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl z-10 bg-white dark:bg-gradient-to-br dark:from-gray-900/90 dark:to-gray-950/90 dark:backdrop-blur-xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col"
                    >
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/5 dark:via-transparent dark:to-accent/5 pointer-events-none" />

                        {/* Scrollable Content - Hidden scrollbar */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 border border-gray-200 dark:border-white/10 group"
                            >
                                <X className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:rotate-90 transition-all" />
                            </button>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-xl opacity-50 animate-pulse" />
                                        <div className="relative w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
                                    </div>
                                    <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">Loading event details...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-20 px-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-rose-500 rounded-full blur-xl opacity-30" />
                                        <div className="relative w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/30">
                                            <X className="w-10 h-10 text-rose-400" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to Load</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">{error}</p>
                                    <button
                                        onClick={fetchEventDetails}
                                        className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-lg text-white font-medium transition-all duration-300 shadow-lg shadow-primary/30"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : event ? (
                                <div className="p-6">
                                    {/* Header Image */}
                                    <div className="relative h-40 sm:h-48 -mx-6 -mt-6 mb-4 overflow-hidden">
                                        <img
                                            src={selectedImage || event.image}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 via-white/50 dark:via-gray-900/50 to-transparent" />

                                        {/* Image Navigation */}
                                        {event.photos && event.photos.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-white/10 group"
                                                >
                                                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-white/10 group"
                                                >
                                                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                                                </button>

                                                {/* Image Counter */}
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm text-xs text-gray-700 dark:text-white border border-gray-200 dark:border-white/10">
                                                    {currentImageIndex + 1} / {event.photos.length}
                                                </div>
                                            </>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute bottom-4 right-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                                                event.is_finished
                                                    ? 'bg-gradient-to-r from-gray-500 to-gray-600'
                                                    : 'bg-gradient-to-r from-accent to-accent/80'
                                            }`}>
                                                {event.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Thumbnail Gallery */}
                                    {event.photos && event.photos.length > 1 && (
                                        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                                            {event.photos.map((photo, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setCurrentImageIndex(idx);
                                                        setSelectedImage(photo);
                                                    }}
                                                    className={`relative flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden transition-all ${
                                                        currentImageIndex === idx
                                                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-105'
                                                            : 'opacity-60 hover:opacity-100'
                                                    }`}
                                                >
                                                    <img src={photo} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Title and Basic Info */}
                                    <div className="mb-4">
                                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                            {event.title}
                                        </h1>

                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                                                <Calendar className="w-3 h-3 text-primary" />
                                                <span>{formatEventDate(event.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                                                <Clock3 className="w-3 h-3 text-accent" />
                                                <span>{event.time}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                                                <MapPin className="w-3 h-3 text-primary" />
                                                <span>{event.city}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description - Compact */}
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                                <Target className="w-3 h-3 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">About</h3>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed line-clamp-3">
                                            {event.description}
                                        </p>
                                    </div>

                                    {/* Quick Info Cards - Compact Grid */}
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-2 border border-gray-200 dark:border-white/10">
                                            <Tag className="w-3 h-3 text-accent mb-1" />
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white capitalize">{event.type}</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Type</p>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-2 border border-gray-200 dark:border-white/10">
                                            <Award className="w-3 h-3 text-primary mb-1" />
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{formatCategory(event.category)}</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Category</p>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-2 border border-gray-200 dark:border-white/10">
                                            <Users className="w-3 h-3 text-accent mb-1" />
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{event.attendees}</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Attendees</p>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-2 border border-gray-200 dark:border-white/10">
                                            <Building2 className="w-3 h-3 text-primary mb-1" />
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{event.venue ? 'Yes' : 'No'}</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Venue</p>
                                        </div>
                                    </div>

                                    {/* Target Audience - Compact */}
                                    {event.target_audience && (
                                        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-200 dark:border-white/10 mb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Users className="w-3 h-3 text-accent" />
                                                <h3 className="font-semibold text-xs text-gray-900 dark:text-white">Target Audience</h3>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 text-xs">{event.target_audience}</p>
                                        </div>
                                    )}

                                    {/* Speakers - Compact */}
                                    {event.speakers && event.speakers.length > 0 && (
                                        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-200 dark:border-white/10 mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Award className="w-3 h-3 text-primary" />
                                                <h3 className="font-semibold text-xs text-gray-900 dark:text-white">Speakers ({event.speakers.length})</h3>
                                            </div>
                                            <div className="space-y-2">
                                                {event.speakers.slice(0, 2).map((speaker, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <div className="relative">
                                                            <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                                                <User className="w-3 h-3 text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-gray-900 dark:text-white text-xs truncate">{speaker.name}</p>
                                                            {speaker.position && (
                                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{speaker.position}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {event.speakers.length > 2 && (
                                                    <p className="text-[10px] text-primary text-center">+{event.speakers.length - 2} more speakers</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>

                        {/* Close Button Footer */}
                        <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                            <button
                                onClick={onClose}
                                className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium transition-all duration-300 border border-gray-200 dark:border-white/10 text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}