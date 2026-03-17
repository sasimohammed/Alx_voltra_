import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar as CalIcon, MapPin, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/PageTransition";

interface Event {
    event_id: number;
    title: string;
    date: string;
    city: string;
    description: string;
    type: string;
    mode: string;
    category: string;
    target_audience: string;
    venue: boolean;
    is_finished: boolean;
    event_speakers: any[];
    photos: string[];
    num_attendees: number;
    time?: string;
    image?: string;
}

export default function CalendarView() {
    const [, setLocation] = useLocation();
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'listMonth'>('dayGridMonth');

    // API base URL - directly to the backend since CORS is enabled
    const API_BASE_URL = 'https://node-core-1qx9.vercel.app';

    // Fetch upcoming events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/events/upcoming/`);

                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }

                const data = await response.json();
                console.log("✅ Upcoming events:", data);

                // Transform events to include formatted time and image
                const transformedEvents = (data.data || []).map((event: any) => ({
                    ...event,
                    time: formatTime(event.date),
                    image: event.photos && event.photos.length > 0
                        ? event.photos[0]
                        : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"
                }));

                setEvents(transformedEvents);
            } catch (err) {
                console.error("❌ Error fetching events:", err);
                setError(err instanceof Error ? err.message : 'Failed to load events');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Helper function to format time
    const formatTime = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return "7:00 PM";
        }
    };

    // Map events to FullCalendar format
    const calendarEvents = events.map(evt => ({
        id: evt.event_id.toString(),
        title: evt.title,
        date: evt.date,
        extendedProps: evt
    }));

    const handleEventClick = (clickInfo: any) => {
        setSelectedEvent(clickInfo.event.extendedProps as Event);
    };

    // Responsive header toolbar based on screen size
    const getHeaderToolbar = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 640) {
            return {
                left: 'title',
                center: '',
                right: 'prev,next'
            };
        }
        return {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listMonth'
        };
    };

    if (loading) {
        return (
            <PageTransition className="pt-20 sm:pt-24 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
                            <p className="mt-4 text-muted-foreground">Loading calendar events...</p>
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    if (error) {
        return (
            <PageTransition className="pt-20 sm:pt-24 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">Error Loading Events</h2>
                            <p className="text-muted-foreground mb-6">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition className="pt-20 sm:pt-24 pb-20 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 sm:mb-10 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-2 sm:mb-4">Event Calendar</h1>
                    <p className="text-sm sm:text-base text-muted-foreground px-4 sm:px-0">
                        Plan your schedule and never miss an important date.
                    </p>
                    {events.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-4">No upcoming events found.</p>
                    )}
                </div>

                {events.length > 0 && (
                    <>
                        {/* Mobile View Toggle */}
                        <div className="sm:hidden flex justify-center gap-2 mb-4">
                            <button
                                onClick={() => setCalendarView('dayGridMonth')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                    calendarView === 'dayGridMonth'
                                        ? 'bg-primary text-white'
                                        : 'bg-secondary text-muted-foreground'
                                }`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setCalendarView('listMonth')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                    calendarView === 'listMonth'
                                        ? 'bg-primary text-white'
                                        : 'bg-secondary text-muted-foreground'
                                }`}
                            >
                                List
                            </button>
                        </div>

                        <div className="glass-panel p-3 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl overflow-x-auto">
                            <div className="min-w-[300px] sm:min-w-full">
                                <FullCalendar
                                    plugins={[dayGridPlugin, listPlugin]}
                                    initialView={typeof window !== 'undefined' && window.innerWidth < 640 ? calendarView : 'dayGridMonth'}
                                    headerToolbar={getHeaderToolbar()}
                                    events={calendarEvents}
                                    eventClick={handleEventClick}
                                    height="auto"
                                    contentHeight="auto"
                                    eventClassNames="cursor-pointer rounded-md border-none shadow-sm font-semibold px-1 sm:px-2 py-0.5 bg-primary text-white hover:bg-primary/90 transition-colors text-xs sm:text-sm"
                                    dayMaxEvents={typeof window !== 'undefined' && window.innerWidth < 640 ? 2 : 3}
                                    noEventsContent="No events scheduled for this period"
                                    aspectRatio={typeof window !== 'undefined' && window.innerWidth < 640 ? 0.8 : 1.35}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal for Event Preview */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEvent(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden z-10 mx-auto"
                        >
                            <div className="h-32 sm:h-40 w-full relative">
                                <img
                                    src={selectedEvent.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"}
                                    alt={selectedEvent.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>

                            <div className="p-5 sm:p-8 pt-1 sm:pt-2">
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold rounded-lg bg-accent/20 text-accent">
                                        {selectedEvent.type || selectedEvent.category || "Event"}
                                    </span>
                                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold rounded-lg bg-primary/20 text-primary">
                                        {selectedEvent.mode || "In Person"}
                                    </span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 line-clamp-2">{selectedEvent.title}</h3>

                                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                    <div className="flex items-start gap-2 sm:gap-3 text-muted-foreground">
                                        <CalIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-xs sm:text-sm">
                                            {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })} at {selectedEvent.time || "7:00 PM"}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2 sm:gap-3 text-muted-foreground">
                                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-xs sm:text-sm">
                                            {selectedEvent.city || "Virtual"} ({selectedEvent.mode || "Online"})
                                        </span>
                                    </div>
                                </div>

                                <p className="text-muted-foreground text-xs sm:text-sm line-clamp-3 mb-5 sm:mb-8">
                                    {selectedEvent.description || "No description available."}
                                </p>

                                <div className="flex gap-3 sm:gap-4">
                                    <button
                                        onClick={() => {
                                            setLocation(`/events/${selectedEvent.event_id}`);
                                            setSelectedEvent(null);
                                        }}
                                        className="flex-1 py-2.5 sm:py-3 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base hover:bg-primary/90 transition-colors"
                                    >
                                        View Details <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageTransition>
    );
}