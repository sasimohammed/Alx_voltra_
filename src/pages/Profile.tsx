import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  User, Settings, Calendar as CalIcon, LogOut, CheckCircle, XCircle,
  FileText, Clock, AlertCircle, Filter, MapPin, Calendar, Users,
  Tag, Target, Eye, ChevronDown, ChevronUp, Sparkles, Zap, Globe,
  Briefcase, MessageCircle, Star, Award
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { EventCard } from "@/components/EventCard";
import { Link } from "wouter";
import { useUser } from "@/usercontext";

// Status badge component for requests - Modern glass morphism style
const RequestStatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = () => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return {
          color: 'bg-emerald-500',
          icon: Award,
          text: 'Approved',
          gradient: 'from-emerald-500 to-green-500',
          glow: 'shadow-emerald-500/30'
        };
      case 'rejected':
        return {
          color: 'bg-rose-500',
          icon: XCircle,
          text: 'Rejected',
          gradient: 'from-rose-500 to-red-500',
          glow: 'shadow-rose-500/30'
        };
      case 'reviewing':
        return {
          color: 'bg-blue-500',
          icon: Eye,
          text: 'Reviewing',
          gradient: 'from-blue-500 to-indigo-500',
          glow: 'shadow-blue-500/30'
        };
      case 'new':
        return {
          color: 'bg-purple-500',
          icon: Sparkles,
          text: 'New',
          gradient: 'from-purple-500 to-pink-500',
          glow: 'shadow-purple-500/30'
        };
      default:
        return {
          color: 'bg-gray-500',
          icon: Clock,
          text: status || 'Unknown',
          gradient: 'from-gray-500 to-gray-600',
          glow: 'shadow-gray-500/30'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
      <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          className={`bg-gradient-to-r ${config.gradient} ${config.glow} text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xl backdrop-blur-sm border border-white/20`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="tracking-wide">{config.text}</span>
      </motion.div>
  );
};

// Status filter options with modern styling
const STATUS_FILTERS = [
  { value: 'all', label: 'All Requests', color: 'bg-gray-500', icon: FileText },
  { value: 'new', label: 'New', color: 'bg-purple-500', icon: Sparkles },
  { value: 'reviewing', label: 'Reviewing', color: 'bg-blue-500', icon: Eye },
  { value: 'approved', label: 'Approved', color: 'bg-emerald-500', icon: Award },
  { value: 'rejected', label: 'Rejected', color: 'bg-rose-500', icon: XCircle }
];

// Modern stat card component
const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <motion.div
        whileHover={{ y: -2 }}
        className={`${color} bg-opacity-10 rounded-2xl p-4 backdrop-blur-sm border border-white/10`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </motion.div>
);

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"tickets" | "requests" | "settings">("tickets");
  const [isEditing, setIsEditing] = useState(false);
  const [apiUser, setApiUser] = useState<any>(null);
  const [formData, setFormData] = useState({ username: "", email: "", phone_no: "", city: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [unregisteringId, setUnregisteringId] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // State for event requests
  const [eventRequests, setEventRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);

  const { token, logout } = useUser();

  // Fetch user profile
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token?.access) return;

      try {
        const response = await fetch("https://django-kf3s.vercel.app/api/account/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token.access}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        console.log("✅ User profile data:", data);
        setApiUser(data);
        setFormData({
          username: data.username || "",
          email: data.email || "",
          phone_no: data.phone_no || "",
          city: data.city || "",
        });
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      }
    };

    fetchUserData();
  }, [token]);

  // Fetch all events
  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const upcomingRes = await fetch('/api/events/upcoming/');
        const upcomingData = await upcomingRes.json();

        const pastRes = await fetch('/api/events/past/');
        const pastData = await pastRes.json();

        const allEventsList = [
          ...(upcomingData.data || []),
          ...(pastData.data || [])
        ];

        console.log("📚 All events fetched:", allEventsList);
        setAllEvents(allEventsList);
      } catch (err) {
        console.error("❌ Error fetching all events:", err);
      }
    };

    fetchAllEvents();
  }, []);

  // Fetch registered events
  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!token?.access) {
        setLoadingEvents(false);
        return;
      }

      try {
        setLoadingEvents(true);
        console.log("Fetching registered events...");

        const response = await fetch("https://django-kf3s.vercel.app/api/myEvents/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token.access}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch registered events:", response.status);
          setRegisteredEvents([]);
          return;
        }

        const data = await response.json();
        console.log("✅ Registered events from API:", data);

        if (data.results && Array.isArray(data.results)) {
          const eventsWithDetails = await Promise.all(
              data.results.map(async (registration: any) => {
                let eventDetails = allEvents.find(e => e.event_id === registration.event_id);

                if (!eventDetails) {
                  try {
                    const upcomingRes = await fetch(`/api/events/upcoming/`);
                    const upcomingData = await upcomingRes.json();
                    eventDetails = upcomingData.data?.find((e: any) => e.event_id === registration.event_id);

                    if (!eventDetails) {
                      const pastRes = await fetch(`/api/events/past/`);
                      const pastData = await pastRes.json();
                      eventDetails = pastData.data?.find((e: any) => e.event_id === registration.event_id);
                    }
                  } catch (err) {
                    console.error(`❌ Error fetching event ${registration.event_id}:`, err);
                  }
                }

                return {
                  id: registration.event_id,
                  eventuser_id: registration.eventuser_id,
                  track: registration.track,
                  is_checked: registration.is_checked,
                  title: eventDetails?.title || `Event #${registration.event_id}`,
                  date: eventDetails?.date || new Date().toISOString(),
                  city: eventDetails?.city || "Unknown City",
                  description: eventDetails?.description || "",
                  type: eventDetails?.type || "unknown",
                  mode: eventDetails?.type === "online" ? "Online" : "In Person",
                  category: eventDetails?.category || "General",
                  image: eventDetails?.photos?.[0] || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
                  status: eventDetails?.is_finished ? "Past" : "Upcoming",
                  price: 0,
                  speaker: eventDetails?.event_speakers?.[0]?.name || "TBD",
                  attendees: eventDetails?.num_attendees || 0,
                  time: formatTime(eventDetails?.date),
                  registration_track: registration.track,
                  registration_id: registration.eventuser_id
                };
              })
          );

          console.log("📝 Transformed events with details:", eventsWithDetails);
          setRegisteredEvents(eventsWithDetails);
        } else {
          setRegisteredEvents([]);
        }
      } catch (err) {
        console.error("❌ Error fetching registered events:", err);
        setRegisteredEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };

    if (allEvents.length > 0 || token?.access) {
      fetchRegisteredEvents();
    }
  }, [token, allEvents]);

  // Fetch all user requests
  useEffect(() => {
    const fetchUserRequests = async () => {
      if (!token?.access) return;

      setLoadingRequests(true);
      setRequestsError(null);

      try {
        console.log("📋 Fetching all user requests...");

        // Build URL with query parameters
        let url = "https://django-kf3s.vercel.app/api/user/requests/";

        // Add status filter as query parameter
        if (statusFilter !== 'all') {
          url += `?status=${statusFilter}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token.access}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch requests: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ User requests (filter: ${statusFilter}):`, data);

        // Handle different response formats
        let requests = [];
        if (Array.isArray(data)) {
          requests = data;
        } else if (data.results && Array.isArray(data.results)) {
          requests = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          requests = data.data;
        }

        setEventRequests(requests);
      } catch (err) {
        console.error("❌ Error fetching user requests:", err);
        setRequestsError(err instanceof Error ? err.message : "Failed to load event requests");
      } finally {
        setLoadingRequests(false);
      }
    };

    if (token?.access && activeTab === "requests") {
      fetchUserRequests();
    }
  }, [token, activeTab, statusFilter]);

  // Apply client-side filtering as backup
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredRequests(eventRequests);
    } else {
      const filtered = eventRequests.filter(req =>
          req.status?.toLowerCase() === statusFilter.toLowerCase()
      );
      setFilteredRequests(filtered);
    }
  }, [eventRequests, statusFilter]);

  // Handle unregister from event
  const handleUnregister = async () => {
    if (!selectedEvent || !token?.access || !apiUser?.id) {
      alert("You need to be logged in to unregister");
      return;
    }

    try {
      setUnregisteringId(selectedEvent.id);

      console.log(`🔄 Unregistering from event ${selectedEvent.id}...`);
      console.log("User ID from apiUser:", apiUser.id);

      const payload = {
        id: apiUser.id
      };

      console.log("📤 Sending DELETE request with body:", payload);

      const response = await fetch(`/api/events/${selectedEvent.id}/unregister`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token.access}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        let responseData;
        try {
          responseData = await response.json();
        } catch {
          responseData = { success: true };
        }

        console.log("✅ Successfully unregistered:", responseData);

        setRegisteredEvents(prev => prev.filter(e => e.id !== selectedEvent.id));

        setSuccessMessage(`Successfully unregistered from "${selectedEvent.title}"`);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);

      } else {
        const errorData = await response.json();
        console.error("❌ Error response:", errorData);
        const errorMessage = errorData.message || errorData.error || "Failed to unregister";
        alert(`Failed to unregister: ${errorMessage}`);
      }

    } catch (err: any) {
      console.error("❌ Error unregistering:", err);
      alert(err.message || "An error occurred while trying to unregister. Please check your connection and try again.");
    } finally {
      setUnregisteringId(null);
      setShowConfirmDialog(false);
      setSelectedEvent(null);
    }
  };

  // Open confirmation dialog
  const confirmUnregister = (event: any) => {
    setSelectedEvent(event);
    setShowConfirmDialog(true);
  };

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

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "Date not available";
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save profile changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token?.access) return;
    setIsSaving(true);

    try {
      const response = await fetch("https://django-kf3s.vercel.app/api/update/account/", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token.access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error("❌ Error updating profile:", errData);
        alert("Failed to save changes.");
        return;
      }

      const updatedData = await response.json();
      console.log("✅ Profile updated:", updatedData);
      setApiUser(updatedData);
      setFormData({
        username: updatedData.username || "",
        email: updatedData.email || "",
        phone_no: updatedData.phone_no || "",
        city: updatedData.city || "",
      });
      setIsEditing(false);

      setSuccessMessage("Profile updated successfully!");
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

    } catch (err) {
      console.error("❌ Error updating profile:", err);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // Display data
  const user = {
    id: apiUser?.id,
    name: apiUser?.username || apiUser?.email?.split("@")[0] || "User",
    email: apiUser?.email || "example@example.com",
    phone: apiUser?.phone_no || "-",
    city: apiUser?.city || "-",
    role: apiUser?.role || "user",
    joinDate: "March 2024",
  };

  // Get counts for each status
  const getStatusCount = (status: string) => {
    if (status === 'all') return eventRequests.length;
    return eventRequests.filter(req => req.status?.toLowerCase() === status).length;
  };

  // Get statistics
  const stats = {
    total: eventRequests.length,
    new: getStatusCount('new'),
    reviewing: getStatusCount('reviewing'),
    approved: getStatusCount('approved'),
    rejected: getStatusCount('rejected')
  };

  return (
      <PageTransition className="pt-24 pb-20 min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        {/* Success Message Toast - Modern floating notification */}
        <AnimatePresence>
          {showSuccessMessage && (
              <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50"
              >
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-sm border border-white/20">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Dialog - Modern glass modal */}
        <AnimatePresence>
          {showConfirmDialog && selectedEvent && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowConfirmDialog(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-gradient-to-br from-card to-secondary/50 backdrop-blur-xl rounded-3xl p-8 z-10 border border-white/10 shadow-2xl"
                >
                  <h3 className="text-2xl font-bold mb-2 text-foreground">Confirm Unregistration</h3>
                  <p className="text-muted-foreground mb-6">
                    Are you sure you want to unregister from <span className="font-semibold text-foreground">"{selectedEvent.title}"</span>?
                  </p>
                  <div className="flex gap-3">
                    <button
                        onClick={() => {
                          setShowConfirmDialog(false);
                          setSelectedEvent(null);
                        }}
                        className="flex-1 py-3 rounded-xl bg-secondary/50 text-foreground font-semibold hover:bg-secondary/80 transition-all backdrop-blur-sm border border-white/10"
                    >
                      Cancel
                    </button>
                    <button
                        onClick={handleUnregister}
                        disabled={unregisteringId === selectedEvent.id}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold hover:shadow-xl hover:shadow-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {unregisteringId === selectedEvent.id ? (
                          <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                        Processing...
                      </span>
                      ) : (
                          "Confirm"
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar - Modern glass panel */}
            <div className="lg:col-span-3 space-y-6">
              <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-panel p-8 rounded-3xl text-center backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-xl opacity-50" />
                  <div className="relative w-28 h-28 mx-auto bg-gradient-to-br from-primary to-accent rounded-full p-1 mb-4">
                    <div className="w-full h-full bg-card rounded-full flex items-center justify-center backdrop-blur-sm">
                      <User className="w-12 h-12 text-foreground" />
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-1">{user.name}</h2>
                <p className="text-sm text-accent mb-4 bg-accent/10 px-4 py-1 rounded-full inline-block">{user.role}</p>
                <div className="text-xs text-muted-foreground pb-4 border-b border-border/50">
                  Member since {user.joinDate}
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button
                      onClick={() => setActiveTab("tickets")}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          activeTab === "tickets"
                              ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
                              : "text-muted-foreground hover:bg-secondary/50"
                      }`}
                  >
                    <TicketIcon className="w-5 h-5" /> My Tickets
                  </button>
                  <button
                      onClick={() => setActiveTab("requests")}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          activeTab === "requests"
                              ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
                              : "text-muted-foreground hover:bg-secondary/50"
                      }`}
                  >
                    <FileText className="w-5 h-5" /> Event Requests
                  </button>
                  <button
                      onClick={() => setActiveTab("settings")}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          activeTab === "settings"
                              ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
                              : "text-muted-foreground hover:bg-secondary/50"
                      }`}
                  >
                    <Settings className="w-5 h-5" /> Account Settings
                  </button>
                  <button
                      onClick={logout}
                      className="flex items-center gap-3 p-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all mt-4"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              {activeTab === "tickets" && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        My Registered Events
                      </h2>
                      {registeredEvents.length > 0 && (
                          <span className="px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-medium backdrop-blur-sm border border-accent/30">
                        {registeredEvents.length} {registeredEvents.length === 1 ? 'Event' : 'Events'}
                      </span>
                      )}
                    </div>

                    {loadingEvents ? (
                        <div className="text-center py-32 glass-panel rounded-3xl backdrop-blur-xl">
                          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
                          <p className="mt-4 text-muted-foreground">Loading your events...</p>
                        </div>
                    ) : registeredEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {registeredEvents.map(event => (
                              <motion.div
                                  key={event.registration_id || event.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  whileHover={{ y: -4 }}
                                  className="relative group"
                              >
                                <EventCard event={event} />
                                <div className="absolute top-4 right-4 z-30 flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border border-white/20">
                                  <CheckCircle className="w-3 h-3" /> Registered
                                </div>
                                {event.track && (
                                    <div className="absolute bottom-4 left-4 z-30 flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border border-white/20">
                                      <Tag className="w-3 h-3" /> {event.track}
                                    </div>
                                )}
                                {event.status === "Upcoming" && (
                                    <button
                                        onClick={() => confirmUnregister(event)}
                                        disabled={unregisteringId === event.id}
                                        className="absolute top-4 left-4 z-30 flex items-center gap-1 bg-gradient-to-r from-rose-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:shadow-xl hover:shadow-rose-500/30 disabled:opacity-50"
                                    >
                                      {unregisteringId === event.id ? (
                                          <>
                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                                            <span>Cancelling...</span>
                                          </>
                                      ) : (
                                          <>
                                            <XCircle className="w-3 h-3" />
                                            <span>Unregister</span>
                                          </>
                                      )}
                                    </button>
                                )}
                              </motion.div>
                          ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 glass-panel rounded-3xl backdrop-blur-xl">
                          <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CalIcon className="w-10 h-10 text-muted-foreground" />
                          </div>
                          <h3 className="text-2xl font-display font-bold mb-2">No registered events</h3>
                          <p className="text-muted-foreground mb-8">You haven't registered for any events yet.</p>
                          <Link href="/events" className="inline-block px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                            Browse Events
                          </Link>
                        </div>
                    )}
                  </motion.div>
              )}

              {activeTab === "requests" && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        My Event Requests
                      </h2>
                      <button
                          onClick={() => setShowFilters(!showFilters)}
                          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all backdrop-blur-sm border ${
                              showFilters
                                  ? 'bg-gradient-to-r from-primary to-accent text-white border-white/20 shadow-lg'
                                  : 'bg-secondary/50 text-foreground border-white/10 hover:bg-secondary/80'
                          }`}
                      >
                        <Filter className="w-4 h-4" />
                        Filters
                      </button>
                    </div>

                    {/* Statistics Cards */}


                    {/* Status Filter Panel */}
                    <AnimatePresence>
                      {showFilters && (
                          <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mb-6"
                          >
                            <div className="glass-panel p-6 rounded-2xl backdrop-blur-xl border border-white/10">
                              <h3 className="text-sm font-medium text-muted-foreground mb-4">Filter by Status</h3>
                              <div className="flex flex-wrap gap-2">
                                {STATUS_FILTERS.map(filter => {
                                  const count = getStatusCount(filter.value);
                                  const Icon = filter.icon;
                                  return (
                                      <button
                                          key={filter.value}
                                          onClick={() => setStatusFilter(filter.value)}
                                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-sm border ${
                                              statusFilter === filter.value
                                                  ? `${filter.color} text-white border-white/20 shadow-lg`
                                                  : 'bg-secondary/50 text-foreground border-white/10 hover:bg-secondary/80'
                                          }`}
                                      >
                                        <Icon className="w-4 h-4" />
                                        {filter.label}
                                        {count > 0 && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                statusFilter === filter.value
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-background/50 text-foreground'
                                            }`}>
                                      {count}
                                    </span>
                                        )}
                                      </button>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Results count */}
                    <div className="mb-4 text-sm text-muted-foreground px-2">
                      Showing <span className="font-semibold text-foreground">{filteredRequests.length}</span> {filteredRequests.length === 1 ? 'request' : 'requests'}
                      {statusFilter !== 'all' && (
                          <span> with status <span className="font-semibold capitalize">{statusFilter}</span></span>
                      )}
                    </div>

                    {loadingRequests ? (
                        <div className="text-center py-32 glass-panel rounded-3xl backdrop-blur-xl">
                          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
                          <p className="mt-4 text-muted-foreground">Loading your requests...</p>
                        </div>
                    ) : requestsError ? (
                        <div className="text-center py-32 glass-panel rounded-3xl backdrop-blur-xl">
                          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                          <h3 className="text-2xl font-display font-bold mb-2">Error Loading Requests</h3>
                          <p className="text-muted-foreground mb-6">{requestsError}</p>
                        </div>
                    ) : filteredRequests.length > 0 ? (
                        <div className="space-y-4">
                          {filteredRequests.map((request) => (
                              <motion.div
                                  key={request.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  whileHover={{ y: -2 }}
                                  className="glass-panel rounded-2xl overflow-hidden backdrop-blur-xl border border-white/10 hover:shadow-2xl transition-all"
                              >
                                {/* Card Header */}
                                <div
                                    className="p-6 cursor-pointer"
                                    onClick={() => setExpandedRequestId(expandedRequestId === request.id ? null : request.id)}
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-foreground">{request.event_title}</h3>
                                        {expandedRequestId === request.id ? (
                                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                        )}
                                      </div>
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(request.created_at || request.submittedAt)}
                                  </span>
                                        <span className="flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    ID: {request.id}
                                  </span>
                                      </div>
                                    </div>
                                    <RequestStatusBadge status={request.status || 'new'} />
                                  </div>

                                  {/* Quick Info Preview */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    <div className="flex items-center gap-2 text-sm">
                                      <MapPin className="w-4 h-4 text-muted-foreground" />
                                      <span>{request.city}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <Calendar className="w-4 h-4 text-muted-foreground" />
                                      <span>{formatDate(request.event_date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <Users className="w-4 h-4 text-muted-foreground" />
                                      <span>{request.expected_attendees} attendees</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <Globe className="w-4 h-4 text-muted-foreground" />
                                      <span className="capitalize">{request.event_type}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                  {expandedRequestId === request.id && (
                                      <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className="overflow-hidden"
                                      >
                                        <div className="p-6 pt-0 border-t border-border/50">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Left Column */}
                                            <div className="space-y-4">
                                              <div>
                                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Event Details</h4>
                                                <div className="space-y-2">
                                                  <p className="text-sm flex items-start gap-2">
                                                    <Target className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                                    <span><span className="font-medium">Objective:</span> {request.objective}</span>
                                                  </p>
                                                  <p className="text-sm flex items-start gap-2">
                                                    <Users className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                                    <span><span className="font-medium">Target Audience:</span> {request.target_audience}</span>
                                                  </p>
                                                  <p className="text-sm flex items-start gap-2">
                                                    <Briefcase className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                                    <span><span className="font-medium">Category:</span> <span className="capitalize">{request.category}</span></span>
                                                  </p>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Right Column */}
                                            <div className="space-y-4">
                                              <div>
                                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Venue & Logistics</h4>
                                                <div className="space-y-2">
                                                  <p className="text-sm">
                                                    <span className="font-medium">Venue:</span>{' '}
                                                    {request.venue ? (
                                                        <span className="text-emerald-500">Has venue ✓</span>
                                                    ) : (
                                                        <span className="text-amber-500">No venue</span>
                                                    )}
                                                  </p>
                                                  <p className="text-sm">
                                                    <span className="font-medium">City:</span> {request.city}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Description */}
                                          <div className="mt-4">
                                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
                                            <p className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-xl">
                                              {request.description}
                                            </p>
                                          </div>

                                          {/* Speakers */}
                                          {request.speaker && request.speaker.length > 0 && (
                                              <div className="mt-4">
                                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Speakers</h4>
                                                <div className="flex flex-wrap gap-2">
                                                  {request.speaker.map((speaker: any, idx: number) => (
                                                      <div
                                                          key={idx}
                                                          className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/10"
                                                      >
                                                        <User className="w-4 h-4 text-accent" />
                                                        <span className="text-sm font-medium">{speaker.name}</span>
                                                        {speaker.position && (
                                                            <>
                                                              <span className="text-muted-foreground">•</span>
                                                              <span className="text-xs text-muted-foreground">{speaker.position}</span>
                                                            </>
                                                        )}
                                                      </div>
                                                  ))}
                                                </div>
                                              </div>
                                          )}
                                        </div>
                                      </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                          ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 glass-panel rounded-3xl backdrop-blur-xl">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-3xl opacity-20" />
                            <FileText className="relative w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          </div>
                          <h3 className="text-2xl font-display font-bold mb-2">No event requests</h3>
                          <p className="text-muted-foreground mb-8">
                            {statusFilter !== 'all'
                                ? `You don't have any ${statusFilter} requests.`
                                : "You haven't made any event requests yet."}
                          </p>
                          <Link href="/events" className="inline-block px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                            Request an Event
                          </Link>
                        </div>
                    )}
                  </motion.div>
              )}

              {activeTab === "settings" && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-8 rounded-3xl backdrop-blur-xl border border-white/10">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Account Settings
                      </h2>
                      <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="px-4 py-2 text-sm font-semibold text-accent border border-accent/30 rounded-lg hover:bg-accent/10 transition-colors backdrop-blur-sm"
                      >
                        {isEditing ? "Cancel" : "Edit Profile"}
                      </button>
                    </div>

                    <form className="space-y-6 max-w-2xl" onSubmit={handleSave}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
                          <input
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground disabled:opacity-70 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all backdrop-blur-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
                          <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground disabled:opacity-70 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all backdrop-blur-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Phone Number</label>
                          <input
                              type="tel"
                              name="phone_no"
                              value={formData.phone_no}
                              onChange={handleChange}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground disabled:opacity-70 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all backdrop-blur-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">City</label>
                          <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground disabled:opacity-70 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all backdrop-blur-sm"
                          />
                        </div>
                      </div>

                      {isEditing && (
                          <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                            >
                              {isSaving ? (
                                  <span className="flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                              Saving...
                            </span>
                              ) : (
                                  "Save Changes"
                              )}
                            </button>
                          </div>
                      )}
                    </form>
                  </motion.div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
  );
}

function TicketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v2" />
        <path d="M13 17v2" />
        <path d="M13 11v2" />
      </svg>
  );
}