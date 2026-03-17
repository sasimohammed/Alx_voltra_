import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, Users, Calendar, Settings, BarChart, Plus, X, Check,
    MapPin, Clock, Target, Image as ImageIcon, Upload, Trash2,
    Edit, Trash, Eye, Search, RefreshCw, FileText, Sparkles,
    Award, XCircle, ChevronDown,
    Tag
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useUser } from "@/usercontext";
import { useLocation } from "wouter";
import EventDetailsCard from "@/components/EventDetailsCard";
import RequestDetailsCard from "@/components/RequestDetailsCard";

// Status filter configuration
const STATUS_FILTERS = [
    { value: 'all', label: 'All Requests', color: 'bg-gray-500', icon: FileText },
    { value: 'new', label: 'New', color: 'bg-purple-500', icon: Sparkles },
    { value: 'reviewing', label: 'Reviewing', color: 'bg-blue-500', icon: Eye },
    { value: 'approved', label: 'Approved', color: 'bg-emerald-500', icon: Award },
    { value: 'rejected', label: 'Rejected', color: 'bg-rose-500', icon: XCircle }
];

// Category options
const CATEGORY_OPTIONS = [
    { value: "category", label: "CATEGORY" },
    { value: "city_team", label: "City_Team" },
    { value: "department", label: "Department" },
    { value: "voltra_team", label: "Voltra_Team" },
    { value: "alumni", label: "Alumni" }
];

// Event type options
const EVENT_TYPE_OPTIONS = [
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
    { value: "hybrid", label: "Hybrid" }
];

// Transform request - only using fields that exist in API
const transformRequest = (apiRequest: any) => {
    return {
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
    };
};

// Format time helper
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

const transformEvent = (apiEvent: any) => ({
    id: apiEvent.event_id,
    title: apiEvent.title || "Untitled Event",
    date: apiEvent.date || new Date().toISOString().split('T')[0],
    city: apiEvent.city || "Unknown City",
    description: apiEvent.description || "",
    type: apiEvent.type || "unknown",
    mode: apiEvent.type === "online" ? "Online" : "Offline",
    category: apiEvent.category || "General",
    image: apiEvent.photos && apiEvent.photos.length > 0
        ? apiEvent.photos[0]
        : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
    status: apiEvent.is_finished ? "Past" : "Upcoming",
    speakers: apiEvent.event_speakers || [],
    attendees: apiEvent.num_attendees || 0,
    time: formatTime(apiEvent.date),
    is_finished: apiEvent.is_finished,
    venue: apiEvent.venue,
    target_audience: apiEvent.target_audience,
    photos: apiEvent.photos || []
});

export default function Dashboard() {
    const { user, token } = useUser();
    const [, setLocation] = useLocation();

    // Events state
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [pastEvents, setPastEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    // User Requests state
    const [userRequests, setUserRequests] = useState<any[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [requestsError, setRequestsError] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [selectedRequestId, setSelectedRequestId] = useState<string | number | null>(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Search and filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, any>>({});

    // Form state for creating/editing event
    const [eventForm, setEventForm] = useState({
        title: "",
        date: "",
        city: "",
        description: "",
        type: "",
        target_audience: "",
        category: "",
        venue: "false",
        is_finished: "false",
        event_speakers: [] as { name: string; position: string; image: string }[],
        photos: [] as File[],
        existingPhotos: [] as string[]
    });

    // Stats state
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalUpcoming: 0,
        totalPast: 0,
        totalAttendees: 0
    });

    // Get status counts
    const getStatusCount = (status: string) => {
        if (status === 'all') return userRequests.length;
        return userRequests.filter(r => r.status?.toLowerCase() === status).length;
    };

    // Fetch events - USING PROXY
    const fetchEvents = async () => {
        if (!token?.access) return;

        setLoading(true);
        setError(null);

        try {
            console.log("📡 Fetching events via proxy...");

            const upcomingRes = await fetch('/api/events/upcoming/', {
                headers: {
                    'Authorization': `Bearer ${token.access}`,
                    'Accept': 'application/json',
                },
            });

            const pastRes = await fetch('/api/events/past/', {
                headers: {
                    'Authorization': `Bearer ${token.access}`,
                    'Accept': 'application/json',
                },
            });

            console.log("📡 Upcoming events response status:", upcomingRes.status);
            console.log("📡 Past events response status:", pastRes.status);

            if (upcomingRes.ok && pastRes.ok) {
                const upcomingData = await upcomingRes.json();
                const pastData = await pastRes.json();

                console.log("📡 Upcoming events data received");
                console.log("📡 Past events data received");

                const transformedUpcoming = (upcomingData.data || []).map(transformEvent);
                const transformedPast = (pastData.data || []).map(transformEvent);

                setUpcomingEvents(transformedUpcoming);
                setPastEvents(transformedPast);

                setStats({
                    totalEvents: transformedUpcoming.length + transformedPast.length,
                    totalUpcoming: transformedUpcoming.length,
                    totalPast: transformedPast.length,
                    totalAttendees: [...transformedUpcoming, ...transformedPast].reduce((sum, e) => sum + (e.attendees || 0), 0)
                });

                console.log("✅ Events fetched successfully");
            } else {
                setError("Failed to fetch events");
            }
        } catch (err) {
            console.error("❌ Error fetching events:", err);
            setError("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    // Fetch user requests - USING DJANGO PROXY
    const fetchUserRequests = async () => {
        if (!token?.access) return;

        setLoadingRequests(true);
        setRequestsError(null);

        try {
            console.log("📡 Fetching user requests via django-proxy...");

            const response = await fetch('/django-api/admin/requests/', {
                headers: {
                    'Authorization': `Bearer ${token.access}`,
                    'Accept': 'application/json',
                },
            });

            console.log("📡 Requests response status:", response.status);

            if (response.status === 401) {
                setRequestsError("You don't have permission to view requests");
                return;
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch requests: ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ User requests received", data);

            let requests = [];
            if (Array.isArray(data)) {
                requests = data;
            } else if (data.results && Array.isArray(data.results)) {
                requests = data.results;
            } else if (data.data && Array.isArray(data.data)) {
                requests = data.data;
            }

            // Transform requests for consistent format
            const transformedRequests = requests.map(transformRequest);
            console.log("✅ Transformed requests:", transformedRequests);
            setUserRequests(transformedRequests);
        } catch (err) {
            console.error("❌ Error fetching requests:", err);
            setRequestsError(err instanceof Error ? err.message : "Failed to load requests");
        } finally {
            setLoadingRequests(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchEvents();
        fetchUserRequests();
    }, [token]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEventForm(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setEventForm(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
        }
    };

    const removeFile = (index: number) => {
        setEventForm(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const removeExistingPhoto = (index: number) => {
        setEventForm(prev => ({
            ...prev,
            existingPhotos: prev.existingPhotos.filter((_, i) => i !== index)
        }));
    };

    // Handle speakers
    const addSpeaker = () => {
        setEventForm(prev => ({
            ...prev,
            event_speakers: [...prev.event_speakers, { name: "", position: "", image: "" }]
        }));
    };

    const updateSpeaker = (index: number, field: string, value: string) => {
        const updatedSpeakers = [...eventForm.event_speakers];
        updatedSpeakers[index] = { ...updatedSpeakers[index], [field]: value };
        setEventForm(prev => ({ ...prev, event_speakers: updatedSpeakers }));
    };

    const removeSpeaker = (index: number) => {
        setEventForm(prev => ({
            ...prev,
            event_speakers: prev.event_speakers.filter((_, i) => i !== index)
        }));
    };

    // Handle request click - using eventrequest_id
    const handleRequestClick = (request: any) => {
        const requestId = request?.eventrequest_id || request?.id;

        console.log("📋 Opening request details for ID:", requestId);

        if (requestId) {
            setSelectedRequestId(requestId);
            setSelectedRequest(null);
            setShowRequestModal(false);
        } else {
            console.error("❌ No request ID found in request");
            alert("Cannot open request: This request doesn't have a valid ID");
        }
    };

    // Handle create event - USING PROXY
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token?.access) {
            setSubmitError("You must be logged in as admin");
            return;
        }

        console.log("📝 Creating new event");
        setSubmitting(true);
        setSubmitError(null);
        setFieldErrors({});

        try {
            const formData = new FormData();
            formData.append("title", eventForm.title.trim());
            formData.append("date", eventForm.date);
            formData.append("city", eventForm.city.trim());
            formData.append("description", eventForm.description.trim());
            formData.append("type", eventForm.type);
            formData.append("target_audience", eventForm.target_audience.trim());
            formData.append("category", eventForm.category);
            formData.append("venue", eventForm.venue);
            formData.append("is_finished", eventForm.is_finished);

            const validSpeakers = eventForm.event_speakers.filter(s => s.name.trim() !== "");
            formData.append("event_speakers", JSON.stringify(validSpeakers));

            eventForm.photos.forEach((photo) => {
                formData.append("photos", photo);
            });

            const url = "/api/admin/events/createEvent";
            console.log("📡 POST Request URL:", url);

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token.access}`,
                },
                body: formData,
            });

            console.log("📡 Create response status:", response.status);

            if (response.status === 401) {
                setSubmitError("Your session has expired. Please log in again.");
                setTimeout(() => setLocation("/login"), 2000);
                return;
            }

            const responseText = await response.text();
            console.log("📡 Create response:", responseText);

            if (response.ok) {
                console.log("✅ Event created successfully");
                setSubmitSuccess(true);
                setEventForm({
                    title: "",
                    date: "",
                    city: "",
                    description: "",
                    type: "",
                    target_audience: "",
                    category: "",
                    venue: "false",
                    is_finished: "false",
                    event_speakers: [],
                    photos: [],
                    existingPhotos: []
                });

                // Refresh events immediately
                await fetchEvents();

                setTimeout(() => {
                    setShowCreateModal(false);
                    setSubmitSuccess(false);
                }, 1500);
            } else {
                try {
                    const errorData = JSON.parse(responseText);
                    setFieldErrors(errorData);
                    setSubmitError("Please check the form for errors");
                } catch {
                    setSubmitError(responseText || "Failed to create event");
                }
            }
        } catch (err: any) {
            console.error("❌ Error creating event:", err);
            setSubmitError(err.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle view event - Updated to use the new EventDetailsCard
    const handleViewClick = (event: any) => {
        setSelectedEventId(event.id);
    };

    // Handle edit event - FIXED: Better mapping with existing photos
    const handleEditClick = (event: any) => {
        console.log("🔍 Edit Event - ID:", event.id);
        console.log("🔍 Event data for edit:", event);

        setSelectedEvent(event);

        // Create a copy of speakers if they exist
        const speakers = event.speakers || [];

        // Handle photos - get all existing photos
        const existingPhotos = event.photos || (event.image ? [event.image] : []);

        // Map the event data correctly for select options
        const formData = {
            title: event.title || "",
            date: event.date ? event.date.split('T')[0] : "",
            city: event.city || "",
            description: event.description || "",
            type: event.type || "",
            target_audience: event.target_audience || "",
            category: event.category || "",
            venue: event.venue ? "true" : "false",
            is_finished: event.is_finished ? "true" : "false",
            event_speakers: speakers,
            photos: [], // New photos will be added here
            existingPhotos: existingPhotos // Store existing photo URLs separately
        };

        console.log("✏️ Setting form data for edit:", formData);
        setEventForm(formData);
        setShowEditModal(true);
    };

    // Handle edit submit - FIXED: Properly handle existing and new photos
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token?.access || !selectedEvent) {
            setSubmitError("No authentication token or event selected");
            return;
        }

        console.log("🚀 Updating Event - ID:", selectedEvent.id);
        console.log("📋 is_finished value being sent:", eventForm.is_finished);
        console.log("📸 Existing photos:", eventForm.existingPhotos);
        console.log("📸 New photos:", eventForm.photos);

        setSubmitting(true);
        setSubmitError(null);
        setFieldErrors({});

        try {
            const formData = new FormData();

            // Only append fields that have values
            if (eventForm.title?.trim()) formData.append("title", eventForm.title.trim());
            if (eventForm.date) formData.append("date", eventForm.date);
            if (eventForm.city?.trim()) formData.append("city", eventForm.city.trim());
            if (eventForm.description?.trim()) formData.append("description", eventForm.description.trim());
            if (eventForm.type) formData.append("type", eventForm.type);
            if (eventForm.target_audience?.trim()) formData.append("target_audience", eventForm.target_audience.trim());
            if (eventForm.category) formData.append("category", eventForm.category);
            formData.append("venue", eventForm.venue);
            formData.append("is_finished", eventForm.is_finished);

            // Handle speakers
            const validSpeakers = eventForm.event_speakers.filter(s => s.name?.trim() !== "");
            if (validSpeakers.length > 0) {
                formData.append("event_speakers", JSON.stringify(validSpeakers));
            } else {
                formData.append("event_speakers", JSON.stringify([])); // Send empty array if no speakers
            }

            // Handle existing photos to keep
            if (eventForm.existingPhotos && eventForm.existingPhotos.length > 0) {
                formData.append("existing_photos", JSON.stringify(eventForm.existingPhotos));
            }

            // Handle new photos
            eventForm.photos.forEach((photo) => {
                formData.append("photos", photo);
            });

            const url = `/api/admin/events/${selectedEvent.id}`;
            console.log("📡 PATCH Request URL:", url);

            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token.access}`,
                },
                body: formData,
            });

            console.log("📡 Response Status:", response.status);

            const responseText = await response.text();
            console.log("📡 Response Body:", responseText);

            if (response.ok) {
                console.log("✅ Update Successful");

                // Parse the response data
                let updatedEventData = null;
                try {
                    const responseJson = JSON.parse(responseText);
                    updatedEventData = responseJson.event || responseJson;
                    console.log("📦 Updated event data:", updatedEventData);
                } catch {
                    console.log("Response is not JSON, will refetch events");
                }

                setSubmitSuccess(true);

                // Refresh events immediately to show updated data
                await fetchEvents();

                setTimeout(() => {
                    setShowEditModal(false);
                    setSubmitSuccess(false);
                    setSelectedEvent(null);
                }, 1500);
            } else {
                console.error("❌ Update Failed - Status:", response.status);
                console.error("❌ Error Details:", responseText);

                try {
                    const errorJson = JSON.parse(responseText);
                    setSubmitError(errorJson.message || errorJson.error || `Failed to update event (${response.status})`);
                } catch {
                    setSubmitError(responseText || `Failed to update event (${response.status})`);
                }
            }

        } catch (err: any) {
            console.error("❌ Network Error:", err.message);
            setSubmitError(err.message || "Network error occurred while updating");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete event
    const handleDeleteClick = (event: any) => {
        setSelectedEvent(event);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!token?.access || !selectedEvent) return;

        console.log("🗑️ Deleting Event - ID:", selectedEvent.id);
        setSubmitting(true);
        setSubmitError(null);

        try {
            const url = `/api/admin/events/${selectedEvent.id}`;
            console.log("📡 DELETE Request URL:", url);

            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token.access}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("📡 DELETE Response Status:", response.status);

            if (response.ok) {
                console.log("✅ Delete Successful");
                await fetchEvents();
                setShowDeleteModal(false);
                setSelectedEvent(null);
                setSubmitSuccess(true);
                setTimeout(() => setSubmitSuccess(false), 1500);
            } else {
                const errorText = await response.text();
                console.error("❌ Delete error:", errorText);
                setSubmitError(errorText || "Failed to delete event");
            }
        } catch (err: any) {
            console.error("❌ Error deleting event:", err);
            setSubmitError(err.message || "An error occurred while deleting");
        } finally {
            setSubmitting(false);
        }
    };

    // Filter events
    const filteredEvents = (activeTab === 'upcoming' ? upcomingEvents : pastEvents).filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.city.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || event.category?.toLowerCase() === filterCategory;
        const matchesDate = !dateRange.start || !dateRange.end ||
            (new Date(event.date) >= new Date(dateRange.start) && new Date(event.date) <= new Date(dateRange.end));
        return matchesSearch && matchesCategory && matchesDate;
    });

    // Filter requests
    const filteredRequests = userRequests.filter(req => {
        if (statusFilter === 'all') return true;
        return req.status?.toLowerCase() === statusFilter;
    });

    // Get unique categories for filter
    const allCategories = [...new Set([...upcomingEvents, ...pastEvents].map(e => e.category?.toLowerCase()))].filter(Boolean);

    return (
        <PageTransition className="pt-20 sm:pt-24 pb-20 min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl sm:rounded-2xl blur-xl opacity-50" />

                            </div>
                            <div className="min-w-0">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
                                    Admin Dashboard
                                </h1>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                    Welcome back, {user?.name} · {new Date().toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 sm:gap-3">

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            >
                                <Plus className="w-3 h-3 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Add Event</span>
                                <span className="sm:hidden">Add</span>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
                    {[
                        { icon: Calendar, label: 'Total Events', value: stats.totalEvents, color: 'from-blue-500 to-cyan-500', delay: 0 },
                        { icon: Target, label: 'Upcoming', value: stats.totalUpcoming, color: 'from-green-500 to-emerald-500', delay: 0.1 },
                        { icon: Clock, label: 'Past Events', value: stats.totalPast, color: 'from-orange-500 to-red-500', delay: 0.2 },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: stat.delay }}
                                whileHover={{ y: -2 }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative glass-panel p-3 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10">
                                    <div className={`absolute top-0 right-0 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br ${stat.color} rounded-full blur-2xl sm:blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`} />
                                    <div className="relative">
                                        <div className={`inline-flex p-1.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.color} bg-opacity-10 mb-2 sm:mb-4`}>
                                            <Icon className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
                                        </div>
                                        <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">{stat.value}</p>
                                        <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* User Requests Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10 mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 sm:p-2 rounded-xl bg-purple-500/20">
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                            </div>
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">User Event Requests</h2>
                        </div>

                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="sm:hidden px-4 py-2 rounded-xl bg-secondary/50 flex items-center justify-between w-full text-sm"
                        >
                            <span className="font-medium">Filter by Status</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Status Filters */}
                        <div className={`${showMobileFilters ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2`}>
                            {STATUS_FILTERS.map((filter) => {
                                const Icon = filter.icon;
                                const count = getStatusCount(filter.value);
                                return (
                                    <motion.button
                                        key={filter.value}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setStatusFilter(filter.value)}
                                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm border ${
                                            statusFilter === filter.value
                                                ? `${filter.color} text-white border-white/20 shadow-lg`
                                                : 'bg-secondary/50 text-foreground border-white/10 hover:bg-secondary/80'
                                        }`}
                                    >
                                        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">{filter.label}</span>
                                        <span className="sm:hidden">{filter.label.slice(0, 3)}</span>
                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs ${
                                            statusFilter === filter.value
                                                ? 'bg-white/20 text-white'
                                                : 'bg-background/50 text-foreground'
                                        }`}>
                                            {count}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {loadingRequests ? (
                        <div className="text-center py-12 sm:py-20">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-xl opacity-50 animate-pulse" />
                                <div className="relative w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                            <p className="mt-4 text-sm sm:text-base text-muted-foreground">Loading requests...</p>
                        </div>
                    ) : requestsError ? (
                        <div className="text-center py-12 sm:py-20">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                            </div>
                            <p className="text-sm sm:text-base text-red-500">{requestsError}</p>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-12 sm:py-20">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground">No {statusFilter !== 'all' ? statusFilter : ''} requests found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {filteredRequests.map((request) => (
                                <motion.div
                                    key={request.eventrequest_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -2 }}
                                    className="group relative bg-secondary/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:bg-secondary/30 transition-all cursor-pointer border border-white/5 hover:border-white/10"
                                    onClick={() => handleRequestClick(request)}
                                >
                                    <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-2xl sm:blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                                    <h3 className="font-semibold text-base sm:text-lg truncate">
                                                        {request.name}
                                                    </h3>
                                                    {STATUS_FILTERS.map(filter => {
                                                        if (filter.value === (request.status?.toLowerCase() || 'new')) {
                                                            const Icon = filter.icon;
                                                            return (
                                                                <span key={filter.value} className={`${filter.color} text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 flex-shrink-0`}>
                                                                    <Icon className="w-2 h-2 sm:w-3 sm:h-3" />
                                                                    {filter.label}
                                                                </span>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                </div>
                                                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                                                    {request.description || request.objective}
                                                </p>
                                                <div className="flex flex-wrap gap-3 sm:gap-4 text-[10px] sm:text-xs">
                                                    <span className="flex items-center gap-1 text-muted-foreground">
                                                        <Calendar className="w-2 h-2 sm:w-3 sm:h-3" />
                                                        <span>{new Date(request.event_date).toLocaleDateString()}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1 text-muted-foreground">
                                                        <MapPin className="w-2 h-2 sm:w-3 sm:h-3" />
                                                        <span className="truncate max-w-[60px] sm:max-w-none">{request.city}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1 text-muted-foreground">
                                                        <Tag className="w-2 h-2 sm:w-3 sm:h-3" />
                                                        <span className="truncate max-w-[60px] sm:max-w-none">{request.category}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1 text-muted-foreground">
                                                        <Users className="w-2 h-2 sm:w-3 sm:h-3" />
                                                        <span>{request.expected_attendees} attendees</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Events Management Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/20">
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                            </div>
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Events Management</h2>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 rounded-xl bg-background/50 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs sm:text-sm w-full sm:w-64 backdrop-blur-sm"
                                />
                            </div>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-background/50 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs sm:text-sm backdrop-blur-sm"
                            >
                                <option value="all">All Categories</option>
                                {allCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-white/10 pb-2 overflow-x-auto">
                        {['upcoming', 'past'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as 'upcoming' | 'past')}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm capitalize whitespace-nowrap transition-all ${
                                    activeTab === tab
                                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                }`}
                            >
                                {tab} ({tab === 'upcoming' ? upcomingEvents.length : pastEvents.length})
                            </button>
                        ))}
                    </div>

                    {/* Events Table */}
                    {loading ? (
                        <div className="text-center py-12 sm:py-20">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-xl opacity-50 animate-pulse" />
                                <div className="relative w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                            <p className="mt-4 text-sm sm:text-base text-muted-foreground">Loading events...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 sm:py-20 text-sm sm:text-base text-red-500">{error}</div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-12 sm:py-20">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground">No events found. Click "Add Event" to create one.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <div className="inline-block min-w-full align-middle">
                                <table className="min-w-full">
                                    <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-medium text-muted-foreground">Event</th>
                                        <th className="text-left py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-medium text-muted-foreground">Date</th>
                                        <th className="text-left py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-medium text-muted-foreground">City</th>
                                        <th className="text-left py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-medium text-muted-foreground">Category</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredEvents.map((event, idx) => (
                                        <motion.tr
                                            key={event.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                        >
                                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-lg overflow-hidden flex-shrink-0">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-20" />
                                                        <img
                                                            src={event.image}
                                                            alt={event.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-xs sm:text-sm truncate">{event.title}</p>
                                                        <p className="text-[8px] sm:text-xs text-muted-foreground truncate">{event.type}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                                                <div className="text-[10px] sm:text-xs">
                                                    <p className="whitespace-nowrap">{new Date(event.date).toLocaleDateString()}</p>
                                                    <p className="text-[8px] sm:text-xs text-muted-foreground">{event.time}</p>
                                                </div>
                                            </td>
                                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs truncate max-w-[60px] sm:max-w-none">{event.city}</td>
                                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                                                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-secondary/30 rounded-full text-[8px] sm:text-xs whitespace-nowrap">
                                                        {event.category}
                                                    </span>
                                            </td>

                                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                                                <div className="flex items-center justify-end gap-1 sm:gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleViewClick(event)}
                                                        className="p-1 sm:p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleEditClick(event)}
                                                        className="p-1 sm:p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                                                        title="Edit Event"
                                                    >
                                                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDeleteClick(event)}
                                                        className="p-1 sm:p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                                        title="Delete Event"
                                                    >
                                                        <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Modals */}
                <AnimatePresence>
                    {showCreateModal && (
                        <EventModal
                            title="Create New Event"
                            form={eventForm}
                            onSubmit={handleCreateSubmit}
                            onClose={() => {
                                setShowCreateModal(false);
                                setEventForm({
                                    title: "",
                                    date: "",
                                    city: "",
                                    description: "",
                                    type: "",
                                    target_audience: "",
                                    category: "",
                                    venue: "false",
                                    is_finished: "false",
                                    event_speakers: [],
                                    photos: [],
                                    existingPhotos: []
                                });
                            }}
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
                            onClose={() => {
                                setShowEditModal(false);
                                setSelectedEvent(null);
                                setEventForm({
                                    title: "",
                                    date: "",
                                    city: "",
                                    description: "",
                                    type: "",
                                    target_audience: "",
                                    category: "",
                                    venue: "false",
                                    is_finished: "false",
                                    event_speakers: [],
                                    photos: [],
                                    existingPhotos: []
                                });
                            }}
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

                {/* Event Details Card */}
                {selectedEventId && token?.access && (
                    <EventDetailsCard
                        eventId={selectedEventId}
                        token={token.access}
                        isOpen={!!selectedEventId}
                        onClose={() => setSelectedEventId(null)}
                    />
                )}

                {/* Request Details Card - New Component */}
                {selectedRequestId && token?.access && (
                    <RequestDetailsCard
                        requestId={selectedRequestId}
                        token={token.access}
                        isOpen={!!selectedRequestId}
                        onClose={() => {
                            setSelectedRequestId(null);
                            setSelectedRequest(null);
                        }}
                        onStatusChange={fetchUserRequests}
                    />
                )}

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteModal && selectedEvent && (
                        <DeleteConfirmModal
                            event={selectedEvent}
                            onConfirm={handleDeleteConfirm}
                            onClose={() => {
                                setShowDeleteModal(false);
                                setSelectedEvent(null);
                            }}
                            submitting={submitting}
                            submitError={submitError}
                        />
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}

// Event Modal Component - Updated with existing photos display
function EventModal({
                        title,
                        form,
                        onSubmit,
                        onClose,
                        submitting,
                        submitSuccess,
                        submitError,
                        fieldErrors,
                        handleChange,
                        handleFileChange,
                        removeFile,
                        removeExistingPhoto,
                        addSpeaker,
                        updateSpeaker,
                        removeSpeaker
                    }: any) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-full sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-card rounded-2xl sm:rounded-3xl p-3 sm:p-6 z-10"
            >
                <div className="sticky top-0 bg-card pb-2 sm:pb-4 border-b border-border mb-3 sm:mb-4 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                {submitSuccess ? (
                    <div className="text-center py-8 sm:py-12">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                        </div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-500 mb-2">Success!</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">Event has been successfully saved.</p>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                                Event Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="e.g., Tech Conference 2024"
                            />
                            {fieldErrors.title && (
                                <p className="mt-1 text-xs text-red-500">
                                    {Array.isArray(fieldErrors.title) ? fieldErrors.title.join(', ') : fieldErrors.title}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                                Event Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                required
                                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            {fieldErrors.date && (
                                <p className="mt-1 text-xs text-red-500">
                                    {Array.isArray(fieldErrors.date) ? fieldErrors.date.join(', ') : fieldErrors.date}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                required
                                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="e.g., New York"
                            />
                            {fieldErrors.city && (
                                <p className="mt-1 text-xs text-red-500">
                                    {Array.isArray(fieldErrors.city) ? fieldErrors.city.join(', ') : fieldErrors.city}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                                rows={isMobile ? 2 : 3}
                                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                placeholder="Describe the event in detail..."
                            />
                            {fieldErrors.description && (
                                <p className="mt-1 text-xs text-red-500">
                                    {Array.isArray(fieldErrors.description) ? fieldErrors.description.join(', ') : fieldErrors.description}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                                Event Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                required
                                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                                <option value="">Select type</option>
                                {EVENT_TYPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {fieldErrors.type && (
                                <p className="mt-1 text-xs text-red-500">
                                    {Array.isArray(fieldErrors.type) ? fieldErrors.type.join(', ') : fieldErrors.type}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                                Target Audience <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="target_audience"
                                value={form.target_audience}
                                onChange={handleChange}
                                required
                                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="e.g., Developers, Students"
                            />
                            {fieldErrors.target_audience && (
                                <p className="mt-1 text-xs text-red-500">
                                    {Array.isArray(fieldErrors.target_audience) ? fieldErrors.target_audience.join(', ') : fieldErrors.target_audience}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                required
                                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                                <option value="">Select category</option>
                                {CATEGORY_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {fieldErrors.category && (
                                <p className="mt-1 text-xs text-red-500">
                                    {Array.isArray(fieldErrors.category) ? fieldErrors.category.join(', ') : fieldErrors.category}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                                Venue <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="venue"
                                value={form.venue}
                                onChange={handleChange}
                                required
                                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                                <option value="false">No venue</option>
                                <option value="true">Has venue</option>
                            </select>
                            {fieldErrors.venue && (
                                <p className="mt-1 text-xs text-red-500">
                                    {Array.isArray(fieldErrors.venue) ? fieldErrors.venue.join(', ') : fieldErrors.venue}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                                Event Status <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-4 items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="is_finished"
                                        value="false"
                                        checked={form.is_finished === "false"}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-sm text-foreground">Upcoming</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="is_finished"
                                        value="true"
                                        checked={form.is_finished === "true"}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-sm text-foreground">Past</span>
                                </label>
                            </div>
                            {fieldErrors.is_finished && (
                                <p className="mt-1 text-xs text-red-500">
                                    {Array.isArray(fieldErrors.is_finished) ? fieldErrors.is_finished.join(', ') : fieldErrors.is_finished}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                                Event Speakers
                            </label>
                            {form.event_speakers.map((speaker: any, index: number) => (
                                <div key={index} className="space-y-2 mb-3 sm:mb-4 p-2 sm:p-3 bg-secondary/20 rounded-xl">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Speaker {index + 1}</span>
                                        {form.event_speakers.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSpeaker(index)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={speaker.name}
                                        onChange={(e) => updateSpeaker(index, "name", e.target.value)}
                                        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="Speaker name"
                                    />
                                    <input
                                        type="text"
                                        value={speaker.position}
                                        onChange={(e) => updateSpeaker(index, "position", e.target.value)}
                                        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="Position (e.g., CEO, Professor)"
                                    />
                                    <input
                                        type="text"
                                        value={speaker.image}
                                        onChange={(e) => updateSpeaker(index, "image", e.target.value)}
                                        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="Image URL (optional)"
                                    />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addSpeaker}
                                className="mt-1 sm:mt-2 text-xs sm:text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Add Speaker
                            </button>
                        </div>

                        {/* Existing Photos Section */}
                        {form.existingPhotos && form.existingPhotos.length > 0 && (
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                                    Existing Photos
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                                    {form.existingPhotos.map((photo: string, index: number) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={photo}
                                                alt={`Event ${index + 1}`}
                                                className="w-full h-20 object-cover rounded-lg border border-border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingPhoto(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove photo"
                                            >
                                                <X className="w-3 h-3 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Note: Removing photos will delete them permanently when saving.
                                </p>
                            </div>
                        )}

                        {/* New Photos Upload */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                                {form.existingPhotos?.length > 0 ? 'Add More Photos' : 'Event Photos'}
                            </label>
                            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                                <label className="cursor-pointer">
                                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2">
                                        <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                                        Upload
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                {form.photos.length > 0 && (
                                    <span className="text-xs sm:text-sm text-muted-foreground">
                                        {form.photos.length} new file(s)
                                    </span>
                                )}
                            </div>

                            {form.photos.length > 0 && (
                                <div className="mt-3 sm:mt-4 space-y-2">
                                    {form.photos.map((file: File, index: number) => (
                                        <div key={index} className="flex items-center justify-between bg-secondary/20 p-2 rounded-xl">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-accent flex-shrink-0" />
                                                <span className="text-xs sm:text-sm truncate">{file.name}</span>
                                                <span className="text-[8px] sm:text-xs text-muted-foreground flex-shrink-0">
                                                    ({(file.size / 1024).toFixed(1)} KB)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="text-red-500 hover:text-red-600 flex-shrink-0"
                                            >
                                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {submitError && (
                            <div className="p-2 sm:p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs sm:text-sm">
                                {submitError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-2 sm:py-3 text-sm sm:text-base rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                "Save Event"
                            )}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ event, onConfirm, onClose, submitting, submitError }: any) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm sm:max-w-md bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 z-10"
            >
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-4">Delete Event</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    Are you sure you want to delete "{event.title}"? This action cannot be undone.
                </p>
                {submitError && (
                    <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs sm:text-sm">
                        {submitError}
                    </div>
                )}
                <div className="flex gap-2 sm:gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 sm:py-3 text-sm sm:text-base rounded-xl bg-secondary text-foreground font-semibold hover:bg-secondary/80 transition-colors"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={submitting}
                        className="flex-1 py-2 sm:py-3 text-sm sm:text-base rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}