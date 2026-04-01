import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar as CalIcon, MapPin, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/PageTransition";
import {useUser} from "@/usercontext.tsx";

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

    const { token } = useUser();
    const API_BASE_URL = 'https://node-core-1qx9.vercel.app';

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                if (!token?.access) return;
                const response = await fetch(`${API_BASE_URL}/api/events/upcoming/`, {
                    headers: {
                        'Authorization': `Bearer ${token.access}`,
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }

                const data = await response.json();
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
    }, [token]);

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

    const calendarEvents = events.map(evt => ({
        id: evt.event_id.toString(),
        title: evt.title,
        date: evt.date,
        extendedProps: evt
    }));

    const handleEventClick = (clickInfo: any) => {
        setSelectedEvent(clickInfo.event.extendedProps as Event);
    };

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
            <PageTransition className="pt-20 sm:pt-30 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">Error Loading Events</h2>
                            <p className="text-muted-foreground mb-6">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
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
        <PageTransition className="pt-20 sm:pt-30 pb-20 min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 sm:mb-10 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-2 sm:mb-4 text-foreground">Event Calendar</h1>
                    <p className="text-sm sm:text-base text-muted-foreground px-4 sm:px-0">
                        Plan your schedule and never miss an important date.
                    </p>
                    {events.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-4">No upcoming events found.</p>
                    )}
                </div>

                {events.length > 0 && (
                    <>
                        <div className="sm:hidden flex justify-center gap-2 mb-4">
                            <button
                                onClick={() => setCalendarView('dayGridMonth')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                    calendarView === 'dayGridMonth'
                                        ? 'bg-accent text-white'
                                        : 'bg-gray-100 dark:bg-secondary text-gray-700 dark:text-muted-foreground'
                                }`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setCalendarView('listMonth')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                    calendarView === 'listMonth'
                                        ? 'bg-accent text-white'
                                        : 'bg-gray-100 dark:bg-secondary text-gray-700 dark:text-muted-foreground'
                                }`}
                            >
                                List
                            </button>
                        </div>

                        <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl sm:rounded-3xl shadow-lg dark:shadow-2xl overflow-x-auto">
                            <div className="p-3 sm:p-6 md:p-8">
                                <style>{`
                                    .fc {
                                        --fc-border-color: #e5e7eb;
                                        --fc-button-bg-color: #f3f4f6;
                                        --fc-button-border-color: #e5e7eb;
                                        --fc-button-text-color: #374151;
                                        --fc-button-hover-bg-color: #e5e7eb;
                                        --fc-button-active-bg-color: #10b981;
                                        --fc-button-active-border-color: #10b981;
                                        --fc-today-bg-color: #f0fdf4;
                                        --fc-page-bg-color: #ffffff;
                                        --fc-neutral-bg-color: #f9fafb;
                                        --fc-list-event-hover-bg-color: #f3f4f6;
                                    }
                                    
                                    .dark .fc {
                                        --fc-border-color: #374151;
                                        --fc-button-bg-color: #1f2937;
                                        --fc-button-border-color: #374151;
                                        --fc-button-text-color: #e5e7eb;
                                        --fc-button-hover-bg-color: #374151;
                                        --fc-button-active-bg-color: #10b981;
                                        --fc-button-active-border-color: #10b981;
                                        --fc-today-bg-color: #064e3b;
                                        --fc-page-bg-color: #111827;
                                        --fc-neutral-bg-color: #1f2937;
                                        --fc-list-event-hover-bg-color: #1f2937;
                                    }
                                    
                                    .fc .fc-button {
                                        border-radius: 0.75rem;
                                        padding: 0.5rem 1rem;
                                        font-weight: 500;
                                        transition: all 0.2s;
                                        background-color: var(--fc-button-bg-color);
                                        border-color: var(--fc-button-border-color);
                                        color: var(--fc-button-text-color);
                                    }
                                    
                                    .fc .fc-button:hover {
                                        background-color: var(--fc-button-hover-bg-color);
                                    }
                                    
                                    .fc .fc-button-primary:not(:disabled).fc-button-active,
                                    .fc .fc-button-primary:not(:disabled):active {
                                        background-color: var(--fc-button-active-bg-color);
                                        border-color: var(--fc-button-active-border-color);
                                        color: white;
                                    }
                                    
                                    .fc .fc-daygrid-day.fc-day-today {
                                        background-color: var(--fc-today-bg-color);
                                    }
                                    
                                    .fc .fc-daygrid-day-number {
                                        color: var(--fc-button-text-color);
                                        font-weight: 500;
                                    }
                                    
                                    .fc .fc-col-header-cell-cushion {
                                        color: var(--fc-button-text-color);
                                        font-weight: 600;
                                        padding: 0.75rem 0.5rem;
                                    }
                                    
                                    .fc .fc-list-day-cushion {
                                        background-color: var(--fc-neutral-bg-color);
                                        color: var(--fc-button-text-color);
                                    }
                                    
                                    .fc .fc-list-day-text,
                                    .fc .fc-list-day-side-text {
                                        color: var(--fc-button-text-color);
                                    }
                                    
                                    .fc .fc-list-event:hover td {
                                        background-color: var(--fc-list-event-hover-bg-color);
                                    }
                                    
                                    .fc .fc-event {
                                        background-color: #10b981;
                                        border: none;
                                        border-radius: 0.5rem;
                                        padding: 0.125rem 0.25rem;
                                        font-size: 0.75rem;
                                        cursor: pointer;
                                        transition: transform 0.2s, background-color 0.2s;
                                    }
                                    
                                    .fc .fc-event:hover {
                                        background-color: #059669;
                                        transform: scale(1.02);
                                    }
                                    
                                    .fc .fc-event-title {
                                        font-weight: 500;
                                        padding: 0.125rem 0.25rem;
                                        color: white;
                                    }
                                    
                                    .fc .fc-toolbar-title {
                                        font-size: 1.25rem;
                                        font-weight: 700;
                                        color: var(--fc-button-text-color);
                                    }
                                    
                                    .fc .fc-day-today .fc-daygrid-day-number {
                                        color: #10b981;
                                        font-weight: 700;
                                    }
                                    
                                    .dark .fc .fc-day-today .fc-daygrid-day-number {
                                        color: #34d399;
                                    }
                                    
                                    @media (max-width: 640px) {
                                        .fc .fc-toolbar {
                                            flex-direction: column;
                                            gap: 0.75rem;
                                        }
                                        .fc .fc-toolbar-title {
                                            font-size: 1rem;
                                        }
                                        .fc .fc-button {
                                            padding: 0.375rem 0.75rem;
                                            font-size: 0.75rem;
                                        }
                                    }
                                `}</style>
                                <FullCalendar
                                    plugins={[dayGridPlugin, listPlugin]}
                                    initialView={typeof window !== 'undefined' && window.innerWidth < 640 ? calendarView : 'dayGridMonth'}
                                    headerToolbar={getHeaderToolbar()}
                                    events={calendarEvents}
                                    eventClick={handleEventClick}
                                    height="auto"
                                    contentHeight="auto"
                                    eventClassNames="cursor-pointer rounded-md border-none shadow-sm font-semibold px-1 sm:px-2 py-0.5 bg-accent text-white hover:bg-accent/90 transition-colors text-xs sm:text-sm"
                                    dayMaxEvents={typeof window !== 'undefined' && window.innerWidth < 640 ? 2 : 3}
                                    noEventsContent="No events scheduled for this period"
                                    aspectRatio={typeof window !== 'undefined' && window.innerWidth < 640 ? 0.8 : 1.35}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

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
                            className="relative w-full max-w-lg bg-white dark:bg-card border border-gray-200 dark:border-border shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden z-10 mx-auto"
                        >
                            <div className="h-32 sm:h-40 w-full relative">
                                <img
                                    src={selectedEvent.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"}
                                    alt={selectedEvent.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-card to-transparent" />
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
                                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 line-clamp-2 text-foreground">{selectedEvent.title}</h3>

                                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                    <div className="flex items-start gap-2 sm:gap-3 text-muted-foreground">
                                        <CalIcon className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5" />
                                        <span className="text-xs sm:text-sm">
                                            {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })} at {selectedEvent.time || "7:00 PM"}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2 sm:gap-3 text-muted-foreground">
                                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5" />
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
                                        className="flex-1 py-2.5 sm:py-3 bg-accent text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base hover:bg-accent/90 transition-colors"
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