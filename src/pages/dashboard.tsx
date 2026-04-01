import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Calendar, Clock, Target, Plus, X, Check,
    MapPin, Image as ImageIcon, Upload, Trash2,
    Edit, Trash, Eye, Search, RefreshCw, FileText, Sparkles,
    Award, XCircle, ChevronDown, Tag
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useUser } from "@/usercontext";
import { useLocation } from "wouter";
import EventDetailsCard from "@/components/EventDetailsCard";
import RequestDetailsCard from "@/components/RequestDetailsCard";

const NODE_API_URL = 'https://node-core-1qx9.vercel.app';
const DJANGO_API_URL = 'https://django-kf3s.vercel.app';

const STATUS_FILTERS = [
    { value: 'all', label: 'All', color: 'bg-gray-500', icon: FileText },
    { value: 'new', label: 'New', color: 'bg-purple-500', icon: Sparkles },
    { value: 'reviewing', label: 'Reviewing', color: 'bg-blue-500', icon: Eye },
    { value: 'approved', label: 'Approved', color: 'bg-emerald-500', icon: Award },
    { value: 'rejected', label: 'Rejected', color: 'bg-rose-500', icon: XCircle }
];

const CATEGORY_OPTIONS = [
    { value: "private", label: "Private" },
    { value: "public", label: "Public" }
];

const EVENT_TYPE_OPTIONS = [
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
    { value: "hybrid", label: "Hybrid" }
];

const transformRequest = (apiRequest: any) => ({
    id: apiRequest.eventrequest_id,
    eventrequest_id: apiRequest.eventrequest_id,
    name: apiRequest.name || "Unknown",
    description: apiRequest.description || "",
    objective: apiRequest.objective || "",
    category: apiRequest.category || "General",
    event_type: apiRequest.event_type,
    target_audience: apiRequest.target_audience || "",
    expected_attendees: apiRequest.expected_attendees || 0,
    event_date: apiRequest.event_date,
    city: apiRequest.city || "Unknown City",
    status: apiRequest.status?.toLowerCase() || "new",
    venue: apiRequest.venue || false,
    speaker: apiRequest.speaker || []
});

// Add this helper function to convert "2:30 PM" to "14:30" for the time input



// Replace the transformEvent function with this fixed version
const transformEvent = (apiEvent: any) => {
    // Helper to format time for display
    const formatTimeForDisplay = (timeStr: string, dateStr: string) => {
        // If there's a time string from the API
        if (timeStr && timeStr !== "") {
            // If it's already in "2:30 PM" format
            if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(timeStr)) {
                return timeStr;
            }
            // If it's in "14:30" 24-hour format
            if (timeStr.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
                const [hours, minutes] = timeStr.split(':');
                const hour = parseInt(hours, 10);
                const period = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                return `${hour12}:${minutes} ${period}`;
            }
            // If it's in "14:30:00" format with seconds
            if (timeStr.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)) {
                const [hours, minutes] = timeStr.split(':');
                const hour = parseInt(hours, 10);
                const period = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                return `${hour12}:${minutes} ${period}`;
            }
            return timeStr;
        }

        // No time field, try to extract from date
        if (dateStr) {
            try {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                }
            } catch {
                // Fall through
            }
        }
        return "7:00 PM";
    };

    return {
        id: apiEvent.event_id,
        title: apiEvent.title || "Untitled Event",
        date: apiEvent.date ? apiEvent.date.split('T')[0] : new Date().toISOString().split('T')[0],
        city: apiEvent.city || "Unknown City",
        description: apiEvent.description || "",
        type: apiEvent.type || "unknown",
        mode: apiEvent.type === "online" ? "Online" : "Offline",
        category: apiEvent.category || "public",
        image: apiEvent.photos?.length > 0
            ? apiEvent.photos[0]
            : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
        status: apiEvent.is_finished ? "Past" : "Upcoming",
        speakers: apiEvent.event_speakers || [],
        attendees: apiEvent.num_attendees || 0,
        time: formatTimeForDisplay(apiEvent.time, apiEvent.date),
        is_finished: apiEvent.is_finished,
        venue: apiEvent.venue,
        target_audience: apiEvent.target_audience,
        photos: apiEvent.photos || [],
        paid: apiEvent.paid || false
    };
};

// Also update the convertTo24Hour function to handle empty values
const convertTo24Hour = (timeStr: string): string => {
    if (!timeStr || timeStr === "") return "";

    // If it's already in 24-hour format
    if (timeStr.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        return timeStr;
    }

    // Convert from "2:30 PM" to "14:30"
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const period = match[3].toUpperCase();

        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    // If it's in "2:30PM" format (no space)
    const matchNoSpace = timeStr.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i);
    if (matchNoSpace) {
        let hours = parseInt(matchNoSpace[1], 10);
        const minutes = matchNoSpace[2];
        const period = matchNoSpace[3].toUpperCase();

        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    return "";
};

// Also update the formatTimeForAPI function to handle more cases
const formatTimeForAPI = (timeStr: string): string => {
    if (!timeStr || timeStr === "") return "";

    // If it's already in "2:30 PM" format
    if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(timeStr)) {
        return timeStr;
    }

    // If it's in "14:30" 24-hour format
    if (timeStr.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${period}`;
    }

    // If it's in "14:30:00" format with seconds
    if (timeStr.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${period}`;
    }

    return timeStr;
};

const EMPTY_FORM = {
    title: "", date: "", time: "", city: "", description: "",
    type: "", target_audience: "", category: "", venue: "false",
    is_finished: "false", paid: "false",
    event_speakers: [] as { name: string; position: string; linked_profile: string }[],
    photos: [] as File[],
    existingPhotos: [] as string[]
};

export default function Dashboard() {
    const { user, token } = useUser();
    const [, setLocation] = useLocation();

    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [pastEvents, setPastEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    const [userRequests, setUserRequests] = useState<any[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [requestsError, setRequestsError] = useState<string | null>(null);
    const [selectedRequestId, setSelectedRequestId] = useState<string | number | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, any>>({});
    const [eventForm, setEventForm] = useState({ ...EMPTY_FORM });

    const [stats, setStats] = useState({ totalEvents: 0, totalUpcoming: 0, totalPast: 0 });

    const getStatusCount = (status: string) =>
        status === 'all' ? userRequests.length : userRequests.filter(r => r.status?.toLowerCase() === status).length;

    const fetchEvents = async () => {
        if (!token?.access) return;
        setLoading(true);
        setError(null);
        try {
            const [upcomingRes, pastRes] = await Promise.all([
                fetch(`${NODE_API_URL}/api/events/upcoming/`, { headers: { 'Authorization': `Bearer ${token.access}` } }),
                fetch(`${NODE_API_URL}/api/events/past/`, { headers: { 'Authorization': `Bearer ${token.access}` } })
            ]);
            if (upcomingRes.ok && pastRes.ok) {
                const upcomingData = await upcomingRes.json();
                const pastData = await pastRes.json();
                const transformedUpcoming = (upcomingData.data || []).map(transformEvent);
                const transformedPast = (pastData.data || []).map(transformEvent);
                setUpcomingEvents(transformedUpcoming);
                setPastEvents(transformedPast);
                setStats({
                    totalEvents: transformedUpcoming.length + transformedPast.length,
                    totalUpcoming: transformedUpcoming.length,
                    totalPast: transformedPast.length,
                });
            } else { setError("Failed to fetch events"); }
        } catch { setError("Failed to load events"); }
        finally { setLoading(false); }
    };

    const fetchUserRequests = async () => {
        if (!token?.access) return;
        setLoadingRequests(true);
        setRequestsError(null);
        try {
            const response = await fetch(`${DJANGO_API_URL}/api/admin/requests/`, {
                headers: { 'Authorization': `Bearer ${token.access}` }
            });
            if (response.status === 401) { setRequestsError("No permission to view requests"); return; }
            if (!response.ok) throw new Error(`Failed: ${response.status}`);
            const data = await response.json();
            const requests = Array.isArray(data) ? data : (data.results || data.data || []);
            setUserRequests(requests.map(transformRequest));
        } catch (err) {
            setRequestsError(err instanceof Error ? err.message : "Failed to load requests");
        } finally { setLoadingRequests(false); }
    };

    useEffect(() => { fetchEvents(); fetchUserRequests(); }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEventForm(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setEventForm(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
        }
    };

    const removeFile = (index: number) =>
        setEventForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));

    const removeExistingPhoto = (index: number) =>
        setEventForm(prev => ({ ...prev, existingPhotos: prev.existingPhotos.filter((_, i) => i !== index) }));

    const addSpeaker = () =>
        setEventForm(prev => ({ ...prev, event_speakers: [...prev.event_speakers, { name: "", position: "", linked_profile: "" }] }));

    const updateSpeaker = (index: number, field: string, value: string) => {
        const updated = [...eventForm.event_speakers];
        updated[index] = { ...updated[index], [field]: value };
        setEventForm(prev => ({ ...prev, event_speakers: updated }));
    };

    const removeSpeaker = (index: number) =>
        setEventForm(prev => ({ ...prev, event_speakers: prev.event_speakers.filter((_, i) => i !== index) }));

    const handleRequestClick = (request: any) => {
        const requestId = request?.eventrequest_id || request?.id;
        if (requestId) setSelectedRequestId(requestId);
    };

    const buildFormData = () => {
        const fd = new FormData();
        if (eventForm.title?.trim()) fd.append("title", eventForm.title.trim());
        if (eventForm.date) fd.append("date", eventForm.date);

        // FIX: Format time properly before sending
        let timeToSend = "";
        if (eventForm.time) {
            // If time is in "HH:MM" format from time input
            if (eventForm.time.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
                const [hours, minutes] = eventForm.time.split(':');
                const hour = parseInt(hours, 10);
                const period = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                timeToSend = `${hour12}:${minutes} ${period}`;
            }
            // If time is already in correct format
            else if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(eventForm.time)) {
                timeToSend = eventForm.time;
            }
            // Otherwise, use as is
            else {
                timeToSend = eventForm.time;
            }
        }

        console.log("📤 Sending time:", eventForm.time, "->", timeToSend);

        if (timeToSend) fd.append("time", timeToSend);

        if (eventForm.city?.trim()) fd.append("city", eventForm.city.trim());
        if (eventForm.description?.trim()) fd.append("description", eventForm.description.trim());
        if (eventForm.type) fd.append("type", eventForm.type);
        if (eventForm.target_audience?.trim()) fd.append("target_audience", eventForm.target_audience.trim());
        if (eventForm.category) fd.append("category", eventForm.category);
        fd.append("venue", eventForm.venue);
        fd.append("is_finished", eventForm.is_finished);
        fd.append("paid", eventForm.paid);
        const validSpeakers = eventForm.event_speakers.filter(s => s.name?.trim());
        fd.append("event_speakers", JSON.stringify(validSpeakers.length > 0 ? validSpeakers : []));
        if (eventForm.existingPhotos?.length > 0)
            fd.append("existing_photos", JSON.stringify(eventForm.existingPhotos));
        eventForm.photos.forEach(photo => fd.append("photos", photo));
        return fd;
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token?.access) return;
        setSubmitting(true); setSubmitError(null); setFieldErrors({});
        try {
            const response = await fetch(`${NODE_API_URL}/api/admin/events/createEvent`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token.access}` },
                body: buildFormData(),
            });
            const text = await response.text();
            if (response.ok) {
                setSubmitSuccess(true);
                setEventForm({ ...EMPTY_FORM });
                await fetchEvents();
                setTimeout(() => { setShowCreateModal(false); setSubmitSuccess(false); }, 1500);
            } else {
                try { const err = JSON.parse(text); setFieldErrors(err); setSubmitError("Check form for errors"); }
                catch { setSubmitError(text || "Failed to create event"); }
            }
        } catch (err: any) { setSubmitError(err.message || "An error occurred"); }
        finally { setSubmitting(false); }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token?.access || !selectedEvent) return;
        setSubmitting(true); setSubmitError(null); setFieldErrors({});
        try {
            const response = await fetch(`${NODE_API_URL}/api/admin/events/${selectedEvent.id}`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token.access}` },
                body: buildFormData(),
            });
            const text = await response.text();
            if (response.ok) {
                setSubmitSuccess(true);
                await fetchEvents();
                setTimeout(() => { setShowEditModal(false); setSubmitSuccess(false); setSelectedEvent(null); }, 1500);
            } else {
                try { const err = JSON.parse(text); setSubmitError(err.message || err.error || `Failed (${response.status})`); if (err.errors) setFieldErrors(err.errors); }
                catch { setSubmitError(text || `Failed (${response.status})`); }
            }
        } catch (err: any) { setSubmitError(err.message || "Network error"); }
        finally { setSubmitting(false); }
    };

    const handleDeleteConfirm = async () => {
        if (!token?.access || !selectedEvent) return;
        setSubmitting(true); setSubmitError(null);
        try {
            const response = await fetch(`${NODE_API_URL}/api/admin/events/${selectedEvent.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token.access}`, "Content-Type": "application/json" }
            });
            if (response.ok) {
                await fetchEvents();
                setShowDeleteModal(false); setSelectedEvent(null);
                setSubmitSuccess(true);
                setTimeout(() => setSubmitSuccess(false), 1500);
            } else {
                const text = await response.text();
                setSubmitError(text || "Failed to delete");
            }
        } catch (err: any) { setSubmitError(err.message || "Error deleting"); }
        finally { setSubmitting(false); }
    };

    const handleEditClick = (event: any) => {
        setSelectedEvent(event);
        setEventForm({
            title: event.title || "",
            date: event.date ? event.date.split('T')[0] : "",
            time: event.time ? convertTo24Hour(event.time) : "",
            city: event.city || "",
            description: event.description || "",
            type: event.type || "",
            target_audience: event.target_audience || "",
            category: event.category || "",
            venue: event.venue ? "true" : "false",
            is_finished: event.is_finished ? "true" : "false",
            paid: event.paid ? "true" : "false",
            event_speakers: (event.speakers || []).map((s: any) => ({
                name: s.name || "", position: s.position || "", linked_profile: s.linked_profile || ""
            })),
            photos: [],
            existingPhotos: event.photos || (event.image ? [event.image] : [])
        });
        setShowEditModal(true);
    };

    const closeModal = (setter: (v: boolean) => void) => {
        setter(false);
        setSelectedEvent(null);
        setEventForm({ ...EMPTY_FORM });
        setSubmitError(null);
        setFieldErrors({});
    };

    const filteredEvents = (activeTab === 'upcoming' ? upcomingEvents : pastEvents).filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.city.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || event.category?.toLowerCase() === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredRequests = userRequests.filter(req =>
        statusFilter === 'all' || req.status?.toLowerCase() === statusFilter
    );

    const allCategories = [...new Set([...upcomingEvents, ...pastEvents].map(e => e.category?.toLowerCase()))].filter(Boolean);

    const STATS = [
        { label: 'Total Events', value: stats.totalEvents, color: 'from-blue-500 to-cyan-500', icon: Calendar },
        { label: 'Upcoming', value: stats.totalUpcoming, color: 'from-green-500 to-emerald-500', icon: Target },
        { label: 'Past Events', value: stats.totalPast, color: 'from-orange-500 to-red-500', icon: Clock },
    ];

    return (
        <PageTransition className="pt-20 sm:pt-28 pb-16 min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                Admin Dashboard
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                Welcome back, {user?.name} · {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                onClick={() => { fetchEvents(); fetchUserRequests(); }}
                                className="px-3 sm:px-4 py-2 rounded-xl bg-secondary/50 border border-white/10 text-sm font-medium flex items-center gap-2 hover:bg-secondary/80 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span className="hidden sm:inline">Refresh</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Event</span>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {STATS.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }} whileHover={{ y: -2 }}
                                className="relative glass-panel p-3 sm:p-5 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10 overflow-hidden"
                            >
                                <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${stat.color} rounded-full blur-2xl opacity-20`} />
                                <div className="relative">
                                    <div className={`inline-flex p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-br ${stat.color} mb-2 sm:mb-3`}>
                                        <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Requests Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10 mb-6 sm:mb-8"
                >
                    <div className="flex flex-col gap-4 mb-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-xl bg-purple-500/20">
                                    <FileText className="w-4 h-4 text-purple-500" />
                                </div>
                                <h2 className="text-base sm:text-xl font-bold">User Event Requests</h2>
                            </div>
                            <button
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                                className="sm:hidden px-3 py-1.5 rounded-xl bg-secondary/50 flex items-center gap-1.5 text-xs font-medium"
                            >
                                Filter
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* Status filters */}
                        <div className={`${showMobileFilters ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2`}>
                            {STATUS_FILTERS.map(filter => {
                                const Icon = filter.icon;
                                const count = getStatusCount(filter.value);
                                return (
                                    <motion.button
                                        key={filter.value}
                                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                        onClick={() => setStatusFilter(filter.value)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                                            statusFilter === filter.value
                                                ? `${filter.color} text-white border-white/20 shadow-md`
                                                : 'bg-secondary/50 text-foreground border-white/10 hover:bg-secondary/80'
                                        }`}
                                    >
                                        <Icon className="w-3 h-3" />
                                        {filter.label}
                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                            statusFilter === filter.value ? 'bg-white/20' : 'bg-background/50'
                                        }`}>{count}</span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {loadingRequests ? (
                        <div className="text-center py-16">
                            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                            <p className="mt-4 text-sm text-muted-foreground">Loading requests...</p>
                        </div>
                    ) : requestsError ? (
                        <div className="text-center py-16">
                            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                            <p className="text-sm text-red-500">{requestsError}</p>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-16">
                            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No {statusFilter !== 'all' ? statusFilter : ''} requests found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredRequests.map(request => (
                                <motion.div
                                    key={request.eventrequest_id}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    whileHover={{ y: -1 }}
                                    className="bg-secondary/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:bg-secondary/30 transition-all cursor-pointer border border-white/5 hover:border-white/10"
                                    onClick={() => handleRequestClick(request)}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-sm sm:text-base truncate">{request.name}</h3>
                                                {STATUS_FILTERS.map(filter => {
                                                    if (filter.value !== (request.status?.toLowerCase() || 'new')) return null;
                                                    const Icon = filter.icon;
                                                    return (
                                                        <span key={filter.value} className={`${filter.color} text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 flex-shrink-0`}>
                                                            <Icon className="w-2.5 h-2.5" />
                                                            {filter.label}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{request.description || request.objective}</p>
                                            <div className="flex flex-wrap gap-3 text-[10px] sm:text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(request.event_date).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {request.city}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Tag className="w-3 h-3" />
                                                    {request.category}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {request.expected_attendees} attendees
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Events Management */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-xl bg-blue-500/20">
                                <Calendar className="w-4 h-4 text-blue-500" />
                            </div>
                            <h2 className="text-base sm:text-xl font-bold">Events Management</h2>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-8 pr-3 py-2 rounded-xl bg-background/50 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm w-full sm:w-56"
                                />
                            </div>
                            <select
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-background/50 border border-white/10 focus:border-primary outline-none text-sm"
                            >
                                <option value="all">All Categories</option>
                                {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-5 border-b border-white/10 pb-2">
                        {(['upcoming', 'past'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium capitalize transition-all ${
                                    activeTab === tab
                                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                }`}
                            >
                                {tab} ({tab === 'upcoming' ? upcomingEvents.length : pastEvents.length})
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center py-16">
                            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                            <p className="mt-4 text-sm text-muted-foreground">Loading events...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16 text-sm text-red-500">{error}</div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-16">
                            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No events found. Click "Add Event" to create one.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                    <tr className="border-b border-white/10">
                                        {['Event', 'Date', 'City', 'Category', 'Paid', 'Actions'].map(h => (
                                            <th key={h} className={`py-3 px-4 text-xs font-medium text-muted-foreground ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredEvents.map((event, idx) => (
                                        <motion.tr
                                            key={event.id}
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.04 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm truncate max-w-[160px]">{event.title}</p>
                                                        <p className="text-xs text-muted-foreground">{event.type}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-xs">{new Date(event.date).toLocaleDateString()}</p>
                                                <p className="text-xs text-muted-foreground">{event.time}</p>
                                            </td>
                                            <td className="py-3 px-4 text-xs">{event.city}</td>
                                            <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        event.category === 'public' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'
                                                    }`}>{event.category}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        event.paid ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/20 text-gray-400'
                                                    }`}>{event.paid ? 'Paid' : 'Free'}</span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                   onClick={() => setSelectedEventId(event.id)}
                                                                   className="p-1.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors" title="View">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </motion.button>
                                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                   onClick={() => handleEditClick(event)}
                                                                   className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors" title="Edit">
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </motion.button>
                                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                   onClick={() => { setSelectedEvent(event); setShowDeleteModal(true); }}
                                                                   className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors" title="Delete">
                                                        <Trash className="w-3.5 h-3.5" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="sm:hidden space-y-3">
                                {filteredEvents.map((event, idx) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.04 }}
                                        className="bg-secondary/20 rounded-xl p-3 border border-white/5"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate">{event.title}</p>
                                                <p className="text-xs text-muted-foreground">{event.type} · {event.city}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()} {event.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                                    event.category === 'public' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'
                                                }`}>{event.category}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                                    event.paid ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/20 text-gray-400'
                                                }`}>{event.paid ? 'Paid' : 'Free'}</span>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <button onClick={() => setSelectedEventId(event.id)}
                                                        className="p-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleEditClick(event)}
                                                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => { setSelectedEvent(event); setShowDeleteModal(true); }}
                                                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                                                    <Trash className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Modals */}
                <AnimatePresence>
                    {showCreateModal && (
                        <EventModal
                            title="Create New Event"
                            form={eventForm}
                            onSubmit={handleCreateSubmit}
                            onClose={() => closeModal(setShowCreateModal)}
                            submitting={submitting}
                            submitSuccess={submitSuccess}
                            submitError={submitError}
                            fieldErrors={fieldErrors}
                            handleChange={handleChange}
                            handleFileChange={handleFileChange}
                            removeFile={removeFile}
                            removeExistingPhoto={removeExistingPhoto}
                            addSpeaker={addSpeaker}
                            updateSpeaker={updateSpeaker}
                            removeSpeaker={removeSpeaker}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showEditModal && (
                        <EventModal
                            title="Edit Event"
                            form={eventForm}
                            onSubmit={handleEditSubmit}
                            onClose={() => closeModal(setShowEditModal)}
                            submitting={submitting}
                            submitSuccess={submitSuccess}
                            submitError={submitError}
                            fieldErrors={fieldErrors}
                            handleChange={handleChange}
                            handleFileChange={handleFileChange}
                            removeFile={removeFile}
                            removeExistingPhoto={removeExistingPhoto}
                            addSpeaker={addSpeaker}
                            updateSpeaker={updateSpeaker}
                            removeSpeaker={removeSpeaker}
                        />
                    )}
                </AnimatePresence>

                {selectedEventId && token?.access && (
                    <EventDetailsCard
                        eventId={selectedEventId}
                        token={token.access}
                        isOpen={!!selectedEventId}
                        onClose={() => setSelectedEventId(null)}
                    />
                )}

                {selectedRequestId && token?.access && (
                    <RequestDetailsCard
                        requestId={selectedRequestId}
                        token={token.access}
                        isOpen={!!selectedRequestId}
                        onClose={() => setSelectedRequestId(null)}
                        onStatusChange={fetchUserRequests}
                    />
                )}

                <AnimatePresence>
                    {showDeleteModal && selectedEvent && (
                        <DeleteConfirmModal
                            event={selectedEvent}
                            onConfirm={handleDeleteConfirm}
                            onClose={() => { setShowDeleteModal(false); setSelectedEvent(null); }}
                            submitting={submitting}
                            submitError={submitError}
                        />
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}

// Event Modal
function EventModal({ title, form, onSubmit, onClose, submitting, submitSuccess, submitError, fieldErrors, handleChange, handleFileChange, removeFile, removeExistingPhoto, addSpeaker, updateSpeaker, removeSpeaker }: any) {
    const inputCls = "w-full px-3 py-2 text-sm rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none";
    const labelCls = "block text-xs sm:text-sm font-medium text-muted-foreground mb-1";

    const FieldError = ({ name }: { name: string }) => fieldErrors[name] ? (
        <p className="mt-1 text-xs text-red-500">{Array.isArray(fieldErrors[name]) ? fieldErrors[name].join(', ') : fieldErrors[name]}</p>
    ) : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto bg-card rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 z-10"
            >
                {/* Sticky Header */}
                <div className="sticky top-0 bg-card z-10 pb-3 border-b border-border mb-4 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {submitSuccess ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-green-500 mb-2">Success!</h3>
                        <p className="text-sm text-muted-foreground">Event saved successfully.</p>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Two-column grid for small fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Event Title <span className="text-red-500">*</span></label>
                                <input type="text" name="title" value={form.title} onChange={handleChange} required className={inputCls} placeholder="Tech Conference 2024" />
                                <FieldError name="title" />
                            </div>
                            <div>
                                <label className={labelCls}>City <span className="text-red-500">*</span></label>
                                <input type="text" name="city" value={form.city} onChange={handleChange} required className={inputCls} placeholder="New York" />
                                <FieldError name="city" />
                            </div>
                            <div>
                                <label className={labelCls}>Event Date <span className="text-red-500">*</span></label>
                                <input type="date" name="date" value={form.date} onChange={handleChange} required className={inputCls} />
                                <FieldError name="date" />
                            </div>
                            <div>
                                <label className={labelCls}>Event Time</label>
                                <input type="time" name="time" value={form.time} onChange={handleChange} className={inputCls} />
                                <FieldError name="time" />
                            </div>
                            <div>
                                <label className={labelCls}>Event Type <span className="text-red-500">*</span></label>
                                <select name="type" value={form.type} onChange={handleChange} required className={inputCls}>
                                    <option value="">Select type</option>
                                    {EVENT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <FieldError name="type" />
                            </div>
                            <div>
                                <label className={labelCls}>Category <span className="text-red-500">*</span></label>
                                <select name="category" value={form.category} onChange={handleChange} required className={inputCls}>
                                    <option value="">Select category</option>
                                    {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <FieldError name="category" />
                            </div>
                            <div>
                                <label className={labelCls}>Venue <span className="text-red-500">*</span></label>
                                <select name="venue" value={form.venue} onChange={handleChange} className={inputCls}>
                                    <option value="false">No venue</option>
                                    <option value="true">Has venue</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Target Audience <span className="text-red-500">*</span></label>
                                <input type="text" name="target_audience" value={form.target_audience} onChange={handleChange} required className={inputCls} placeholder="Developers, Students" />
                                <FieldError name="target_audience" />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className={labelCls}>Description <span className="text-red-500">*</span></label>
                            <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className={`${inputCls} resize-none`} placeholder="Describe the event..." />
                            <FieldError name="description" />
                        </div>

                        {/* Radio groups */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Event Status</label>
                                <div className="flex gap-4 mt-1">
                                    {[{ v: "false", l: "Upcoming" }, { v: "true", l: "Past" }].map(opt => (
                                        <label key={opt.v} className="flex items-center gap-2 cursor-pointer text-sm">
                                            <input type="radio" name="is_finished" value={opt.v} checked={form.is_finished === opt.v} onChange={handleChange} className="w-4 h-4 text-primary" />
                                            {opt.l}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Pricing</label>
                                <div className="flex gap-4 mt-1">
                                    {[{ v: "false", l: "Free" }, { v: "true", l: "Paid" }].map(opt => (
                                        <label key={opt.v} className="flex items-center gap-2 cursor-pointer text-sm">
                                            <input type="radio" name="paid" value={opt.v} checked={form.paid === opt.v} onChange={handleChange} className="w-4 h-4 text-primary" />
                                            {opt.l}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Speakers */}
                        <div>
                            <label className={labelCls}>Event Speakers</label>
                            <div className="space-y-3">
                                {form.event_speakers.map((speaker: any, index: number) => (
                                    <div key={index} className="p-3 bg-secondary/20 rounded-xl space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium text-muted-foreground">Speaker {index + 1}</span>
                                            <button type="button" onClick={() => removeSpeaker(index)} className="text-red-500 hover:text-red-600">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <input type="text" value={speaker.name} onChange={e => updateSpeaker(index, "name", e.target.value)} className={inputCls} placeholder="Speaker name *" />
                                        <input type="text" value={speaker.position} onChange={e => updateSpeaker(index, "position", e.target.value)} className={inputCls} placeholder="Position (e.g., CEO)" />
                                        <input type="text" value={speaker.linked_profile} onChange={e => updateSpeaker(index, "linked_profile", e.target.value)} className={inputCls} placeholder="LinkedIn / Profile URL" />
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addSpeaker} className="mt-2 text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1">
                                <Plus className="w-3.5 h-3.5" /> Add Speaker
                            </button>
                        </div>

                        {/* Existing Photos */}
                        {form.existingPhotos?.length > 0 && (
                            <div>
                                <label className={labelCls}>Existing Photos</label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {form.existingPhotos.map((photo: string, index: number) => (
                                        <div key={index} className="relative group">
                                            <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-20 object-cover rounded-lg border border-border" />
                                            <button type="button" onClick={() => removeExistingPhoto(index)}
                                                    className="absolute top-1 right-1 p-0.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="w-3 h-3 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Photo Upload */}
                        <div>
                            <label className={labelCls}>{form.existingPhotos?.length > 0 ? 'Add More Photos' : 'Event Photos'}</label>
                            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer text-sm">
                                <Upload className="w-4 h-4" />
                                Upload photos
                                <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                            </label>
                            {form.photos.length > 0 && (
                                <div className="mt-2 space-y-1.5">
                                    {form.photos.map((file: File, index: number) => (
                                        <div key={index} className="flex items-center justify-between bg-secondary/20 px-3 py-1.5 rounded-lg">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <ImageIcon className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                                                <span className="text-xs truncate">{file.name}</span>
                                                <span className="text-[10px] text-muted-foreground flex-shrink-0">({(file.size / 1024).toFixed(1)}KB)</span>
                                            </div>
                                            <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-600 flex-shrink-0 ml-2">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {submitError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">{submitError}</div>
                        )}

                        <button type="submit" disabled={submitting}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {submitting ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                            ) : "Save Event"}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}

// Delete Modal
function DeleteConfirmModal({ event, onConfirm, onClose, submitting, submitError }: any) {
    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 z-10"
            >
                <h2 className="text-lg font-bold mb-2">Delete Event</h2>
                <p className="text-sm text-muted-foreground mb-5">
                    Are you sure you want to delete <span className="font-medium text-foreground">"{event.title}"</span>? This cannot be undone.
                </p>
                {submitError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">{submitError}</div>
                )}
                <div className="flex gap-2">
                    <button onClick={onClose} disabled={submitting}
                            className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-semibold hover:bg-secondary/80 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={submitting}
                            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Deleting...</> : "Delete"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}