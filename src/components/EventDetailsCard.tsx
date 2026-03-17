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

// Format time helper - FIXED to handle UTC dates correctly
// Format time helper - Shows EXACT time from API with zero conversion
const formatTime = (dateString: string) => {
    try {
        // Extract the time directly from the ISO string
        // Example: "2026-05-09T03:00:00.000Z" -> "03:00"
        const timePart = dateString.split('T')[1].split('.')[0]; // Gets "03:00:00"
        const [hours, minutes] = timePart.split(':'); // Gets ["03", "00"]

        // Convert to 12-hour format with AM/PM
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM

        // Add leading zero to minutes if needed (though they already have it)
        const displayMinutes = minutes;

        return `${displayHour}:${displayMinutes} ${period}`;
    } catch {
        return "All Day";
    }
};

// Format date helper - to ensure date doesn't shift
const formatEventDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC' // Keep in UTC to prevent day shifting
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

    // Fetch event details when opened
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

            const response = await fetch(`/api/events/${eventId}`, {
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

            // Transform the API response
            const detailedEvent = transformEvent(data.data || data);
            setEvent(detailedEvent);

            // Set initial selected image if photos exist
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
                    {/* Backdrop with intense blur and gradient */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-900/98 to-black/95 backdrop-blur-xl"
                    />

                    {/* Card - Dark Theme with Glass Effect - Less Width */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl z-10 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-xl border border-white/10"
                    >
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-rose-500/5 animate-pulse" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 z-30 p-2 rounded-full bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-all duration-300 border border-white/10 group"
                        >
                            <X className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all" />
                        </button>

                        {loading ? (
                            // Loading State
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse" />
                                    <div className="relative w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                </div>
                                <p className="mt-6 text-sm text-gray-400">Loading event details...</p>
                            </div>
                        ) : error ? (
                            // Error State
                            <div className="flex flex-col items-center justify-center py-20 px-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-rose-500 rounded-full blur-xl opacity-30" />
                                    <div className="relative w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/30">
                                        <X className="w-10 h-10 text-rose-400" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">Failed to Load</h3>
                                <p className="text-sm text-gray-400 text-center max-w-md mb-6">{error}</p>
                                <button
                                    onClick={fetchEventDetails}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : event ? (
                            // Event Content
                            <div className="p-6 relative">
                                {/* Header Image */}
                                <div className="relative h-48 sm:h-56 -mx-6 -mt-6 mb-6 overflow-hidden">
                                    <img
                                        src={selectedImage || event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

                                    {/* Image Navigation */}
                                    {event.photos && event.photos.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-colors border border-white/10 group"
                                            >
                                                <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-colors border border-white/10 group"
                                            >
                                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                            </button>

                                            {/* Image Counter */}
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-gray-800/50 backdrop-blur-sm text-xs text-white border border-white/10">
                                                {currentImageIndex + 1} / {event.photos.length}
                                            </div>
                                        </>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute bottom-4 right-4">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${
                                            event.is_finished
                                                ? 'bg-gradient-to-r from-gray-600 to-gray-700'
                                                : 'bg-gradient-to-r from-green-500 to-emerald-600'
                                        }`}>
                                            {event.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Thumbnail Gallery */}
                                {event.photos && event.photos.length > 1 && (
                                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700">
                                        {event.photos.map((photo, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setCurrentImageIndex(idx);
                                                    setSelectedImage(photo);
                                                }}
                                                className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all ${
                                                    currentImageIndex === idx
                                                        ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900 scale-105'
                                                        : 'opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                <img src={photo} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Title and Basic Info */}
                                <div className="mb-6">
                                    <h1 className="text-2xl font-bold text-white mb-3">
                                        {event.title}
                                    </h1>

                                    <div className="flex flex-wrap gap-3 text-sm">
                                        <div className="flex items-center gap-1.5 text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg">
                                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                            <span>{formatEventDate(event.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg">
                                            <Clock3 className="w-3.5 h-3.5 text-purple-400" />
                                            <span>{event.time}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg">
                                            <MapPin className="w-3.5 h-3.5 text-green-400" />
                                            <span>{event.city}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Event Details Grid - Compact */}
                                <div className="space-y-6">
                                    {/* Description */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="relative overflow-hidden bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-blue-500 rounded-lg blur-md opacity-50" />
                                                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                    <Target className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-white">About This Event</h3>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed text-sm">
                                            {event.description}
                                        </p>
                                    </motion.div>

                                    {/* Quick Info Cards */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all group"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Tag className="w-4 h-4 text-purple-400" />
                                                <span className="text-xs font-medium text-gray-400">Type</span>
                                            </div>
                                            <p className="text-sm font-semibold text-white capitalize">{event.type}</p>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 }}
                                            className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all group"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Award className="w-4 h-4 text-yellow-400" />
                                                <span className="text-xs font-medium text-gray-400">Category</span>
                                            </div>
                                            <p className="text-sm font-semibold text-white">{formatCategory(event.category)}</p>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all group"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="w-4 h-4 text-green-400" />
                                                <span className="text-xs font-medium text-gray-400">Attendees</span>
                                            </div>
                                            <p className="text-sm font-semibold text-white">{event.attendees}</p>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.25 }}
                                            className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all group"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Building2 className="w-4 h-4 text-cyan-400" />
                                                <span className="text-xs font-medium text-gray-400">Venue</span>
                                            </div>
                                            <p className="text-sm font-semibold text-white">{event.venue ? 'Has venue' : 'No venue'}</p>
                                        </motion.div>
                                    </div>

                                    {/* Target Audience */}
                                    {event.target_audience && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all group"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-green-500 rounded-lg blur-md opacity-50" />
                                                    <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                                        <Users className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-white">Target Audience</h3>
                                            </div>
                                            <p className="text-gray-300 text-sm">{event.target_audience}</p>
                                        </motion.div>
                                    )}

                                    {/* Speakers */}
                                    {event.speakers && event.speakers.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.35 }}
                                            className="relative overflow-hidden bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all group"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-amber-500 rounded-lg blur-md opacity-50" />
                                                    <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                                        <Award className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-white">Speakers</h3>
                                            </div>
                                            <div className="space-y-3">
                                                {event.speakers.map((speaker, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.4 + idx * 0.05 }}
                                                        className="flex items-center gap-3 p-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 transition-all group/item"
                                                    >
                                                        {speaker.image ? (
                                                            <img
                                                                src={speaker.image}
                                                                alt={speaker.name}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="relative">
                                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-md opacity-50 group-hover/item:opacity-75 transition-opacity" />
                                                                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                                    <User className="w-5 h-5 text-white" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-white text-sm truncate">{speaker.name}</p>
                                                            {speaker.position && (
                                                                <p className="text-xs text-gray-400 truncate">{speaker.position}</p>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Close Button */}
                                <div className="flex justify-end pt-6 mt-4 border-t border-white/10">
                                    <button
                                        onClick={onClose}
                                        className="relative px-6 py-2.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 font-medium transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-sm overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        <span className="relative z-10">Close</span>
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}