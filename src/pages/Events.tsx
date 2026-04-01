import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, SlidersHorizontal, Frown, Calendar, Plus, X, Check, PartyPopper } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { EventCard } from "@/components/EventCard";
import { useUser } from "@/usercontext";

// API URLs
const NODE_API_URL = 'https://node-core-1qx9.vercel.app';
const DJANGO_API_URL = 'https://django-kf3s.vercel.app';

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

// Transform API event to EventCard format
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
  price: 0,
  speaker: apiEvent.event_speakers?.[0]?.name || "TBD",
  attendees: apiEvent.num_attendees || 0,
  time: formatTime(apiEvent.date)
});

// Category options
const CATEGORY_OPTIONS = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" }
];

// Store for user's request IDs
let userRequestIds: any[] = [];

export default function Events() {
  const { token } = useUser();
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string>("");

  // Modal state
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, any>>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Response data state
  const [responseData, setResponseData] = useState<any>(null);

  // ✅ Form state with event_time added
  const [proposalForm, setProposalForm] = useState({
    name: "",
    category: "",
    event_title: "",
    event_type: "",
    objective: "",
    description: "",
    target_audience: "",
    expected_attendees: "",
    event_date: "",
    event_time: "",   // ✅ NEW FIELD
    city: "",
    venue: "false",
    paid: false,
    speaker: [] as { name: string; position: string; linked_profile: string }[]
  });

  // Load hero image from gallery folder
  useEffect(() => {
    const loadHeroImage = async () => {
      const imageNames = ['image1', 'image2', 'image3', 'hero', 'banner', 'event-banner'];
      const extensions = ['.jpeg', '.jpg', '.png', '.webp'];

      for (const name of imageNames) {
        for (const ext of extensions) {
          const imagePath = `/gallery/${name}${ext}`;
          try {
            const img = new Image();
            const imageExists = await new Promise((resolve) => {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
              img.src = imagePath;
            });

            if (imageExists) {
              console.log(`✅ Found hero image: ${imagePath}`);
              setHeroImage(imagePath);
              return;
            }
          } catch (error) {
            console.log(`❌ Image not found: ${imagePath}`);
          }
        }
      }

      console.log("⚠️ No gallery images found, using fallback image");
      setHeroImage("https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop");
    };

    loadHeroImage();
  }, []);

  // Fetch both upcoming and past events from Node.js API
  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        if (!token?.access) return;

        setLoading(true);

        const upcomingRes = await fetch(`${NODE_API_URL}/api/events/upcoming/`, {
          headers: {
            'Authorization': `Bearer ${token.access}`,
            'Accept': 'application/json',
          },
        });
        const upcomingData = await upcomingRes.json();

        const pastRes = await fetch(`${NODE_API_URL}/api/events/past/`, {
          headers: {
            'Authorization': `Bearer ${token.access}`,
            'Accept': 'application/json',
          },
        });
        const pastData = await pastRes.json();

        const allEvents = [
          ...(upcomingData.data || []).map((e: any) => ({ ...e, is_finished: false })),
          ...(pastData.data || []).map((e: any) => ({ ...e, is_finished: true }))
        ];

        console.log("All events:", allEvents);

        const transformedEvents = allEvents.map(transformEvent);
        setEvents(transformedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchAllEvents();
  }, []);

  // Handle proposal form input changes
  const handleProposalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setProposalForm(prev => ({ ...prev, [name]: newValue }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle speaker array changes
  const addSpeaker = () => {
    setProposalForm(prev => ({
      ...prev,
      speaker: [...prev.speaker, { name: "", position: "", linked_profile: "" }]
    }));
  };

  const updateSpeaker = (index: number, field: string, value: string) => {
    const updatedSpeakers = [...proposalForm.speaker];
    updatedSpeakers[index] = { ...updatedSpeakers[index], [field]: value };
    setProposalForm(prev => ({ ...prev, speaker: updatedSpeakers }));
  };

  const removeSpeaker = (index: number) => {
    setProposalForm(prev => ({
      ...prev,
      speaker: prev.speaker.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission to Django API
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token?.access) {
      setSubmitError("You must be logged in to propose an event");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    try {
      const validSpeakers = proposalForm.speaker.filter(s => s.name.trim() !== "");

      if (validSpeakers.length === 0) {
        setSubmitError("At least one speaker with a name is required");
        setSubmitting(false);
        return;
      }

      // ✅ Payload includes event_time
      const payload = {
        name: proposalForm.name.trim(),
        category: proposalForm.category,
        event_title: proposalForm.event_title.trim(),
        event_type: proposalForm.event_type,
        objective: proposalForm.objective.trim(),
        description: proposalForm.description.trim(),
        target_audience: proposalForm.target_audience.trim(),
        expected_attendees: parseInt(proposalForm.expected_attendees) || 0,
        event_date: proposalForm.event_date,
        event_time: proposalForm.event_time,   // ✅ SENT TO API
        city: proposalForm.city.trim(),
        venue: proposalForm.venue === "true",
        paid: proposalForm.paid,
        speaker: validSpeakers
      };

      console.log("Submitting event proposal:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${DJANGO_API_URL}/api/user/request/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token.access}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      const responseText = await response.text();
      console.log("Response body:", responseText);

      if (response.ok) {
        const responseData = responseText ? JSON.parse(responseText) : {};
        console.log("✅ Success - Response data:", responseData);

        try {
          const existingRequests = JSON.parse(localStorage.getItem('userEventRequests') || '[]');

          const newRequest = {
            id: responseData.id,
            event_title: payload.event_title,
            category: payload.category,
            event_type: payload.event_type,
            objective: payload.objective,
            description: payload.description,
            target_audience: payload.target_audience,
            expected_attendees: payload.expected_attendees,
            city: payload.city,
            venue: payload.venue,
            speaker: payload.speaker,
            name: payload.name,
            event_date: payload.event_date,
            event_time: payload.event_time,   // ✅ SAVED TO LOCALSTORAGE
            submittedAt: new Date().toISOString(),
            status: 'pending'
          };

          existingRequests.push(newRequest);
          localStorage.setItem('userEventRequests', JSON.stringify(existingRequests));
        } catch (e) {
          console.error("❌ Error saving to localStorage:", e);
        }

        setResponseData(responseData);
        setSubmitSuccess(true);
        setShowSuccessToast(true);

        setTimeout(() => {
          setShowSuccessToast(false);
        }, 5000);

        // ✅ Reset includes event_time
        setProposalForm({
          name: "",
          category: "",
          event_title: "",
          event_type: "",
          objective: "",
          description: "",
          target_audience: "",
          expected_attendees: "",
          event_date: "",
          event_time: "",   // ✅ RESET
          city: "",
          venue: "false",
          paid: false,
          speaker: []
        });

        setTimeout(() => {
          setShowProposalModal(false);
          setSubmitSuccess(false);
          setResponseData(null);
        }, 2000);
      } else {
        try {
          const errorData = JSON.parse(responseText);
          console.error("❌ Error response:", errorData);
          setFieldErrors(errorData);

          const errorMessages = [];
          if (errorData.objective) errorMessages.push("Objective is required");
          if (errorData.description) errorMessages.push("Description is required");
          if (errorData.category) errorMessages.push("Please select a valid category");
          if (errorData.venue) errorMessages.push("Venue must be true/false");
          if (errorData.speaker) errorMessages.push("Please add at least one speaker with valid information");

          if (errorMessages.length > 0) {
            setSubmitError(errorMessages.join(". "));
          } else {
            setSubmitError("Please check the form for errors");
          }
        } catch {
          setSubmitError(responseText || "Failed to submit proposal");
        }
      }
    } catch (err: any) {
      console.error("❌ Error submitting proposal:", err);
      setSubmitError(err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
          event.description.toLowerCase().includes(search.toLowerCase());

      const eventDate = new Date(event.date).toISOString().split('T')[0];
      const matchesStartDate = !startDate || eventDate >= startDate;
      const matchesEndDate = !endDate || eventDate <= endDate;

      return matchesSearch && matchesStartDate && matchesEndDate;
    });
  }, [search, startDate, endDate, events]);

  if (loading) {
    return (
        <PageTransition className="pt-24 pb-20 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading events...</p>
              </div>
            </div>
          </div>
        </PageTransition>
    );
  }

  if (error) {
    return (
        <PageTransition className="pt-24 pb-20 min-h-screen">
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
      <PageTransition className="pt-24 pb-20 min-h-screen">

        {/* Success Toast Notification */}
        <AnimatePresence>
          {showSuccessToast && (
              <motion.div
                  initial={{ opacity: 0, y: -100, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: -100, x: "-50%" }}
                  className="fixed top-24 left-1/2 z-50 w-full max-w-md"
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl shadow-2xl p-6 mx-4 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-1/4 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: "0.1s" }} />
                    <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: "0.3s" }} />
                    <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-pink-300 rounded-full animate-ping" style={{ animationDelay: "0.5s" }} />
                  </div>

                  <div className="flex items-start gap-4 relative z-10">
                    <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                      <PartyPopper className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-1">Request Sent Successfully!</h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        Thank you for proposing an event! Our team will review your request and get back to you within 2-3 business days.
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-white/80">
                        <Check className="w-4 h-4" />
                        <span>We'll notify you via email once approved</span>
                      </div>
                    </div>
                    <button
                        onClick={() => setShowSuccessToast(false)}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 5, ease: "linear" }}
                      className="absolute bottom-0 left-0 h-1 bg-white/30"
                  />
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Banner */}
        <div className="w-full relative py-20 mb-12 overflow-hidden">
          <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: heroImage ? `url(${heroImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40" />
          </div>

          {!heroImage && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-[#2a0e82] to-accent" />
          )}

          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl font-display font-extrabold mb-6 text-white"
            >
              Discover Events
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-white/90 max-w-2xl mx-auto font-medium"
            >
              Find and secure your spot at the most exclusive experiences happening globally.
            </motion.p>

            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => {
                  setShowProposalModal(true);
                  setResponseData(null);
                }}
                className="mt-8 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl font-bold text-white flex items-center gap-2 mx-auto transition-all border border-white/20"
            >
              <Plus className="w-5 h-5" />
              Request an Event
            </motion.button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Search Bar */}
          <div className="mb-12 relative -mt-24 z-20">
            <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 shadow-2xl bg-card/80 backdrop-blur-2xl">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg font-medium"
                />
              </div>
              <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-8 py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all md:w-auto w-full ${showFilters ? 'bg-primary text-white' : 'bg-secondary text-foreground hover:bg-border'}`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline">Date</span>
                <span className="sm:hidden">Filter by Date</span>
              </button>
            </div>
          </div>

          {/* Date Filters Panel */}
          <AnimatePresence>
            {showFilters && (
                <motion.div
                    initial={{ height: 0, opacity: 0, y: -20 }}
                    animate={{ height: "auto", opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -20 }}
                    className="overflow-hidden mb-10"
                >
                  <div className="glass-card p-8 rounded-3xl">
                    <div className="flex items-center gap-2 mb-6">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-bold">Filter by Date Range</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-foreground"
                        />
                      </div>
                    </div>

                    {(startDate || endDate) && (
                        <div className="mt-6 flex justify-end">
                          <button
                              onClick={() => {
                                setStartDate("");
                                setEndDate("");
                              }}
                              className="text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1 transition-colors"
                          >
                            <Filter className="w-4 h-4" /> Clear dates
                          </button>
                        </div>
                    )}
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Results Info */}
          <div className="mb-8 flex flex-wrap gap-4 justify-between items-center text-muted-foreground font-medium">
            <span className="bg-secondary px-4 py-2 rounded-full">
              Showing <strong className="text-foreground">{filteredEvents.length}</strong> events
              {(startDate || endDate) && (
                  <span className="ml-2 text-accent">(filtered by date)</span>
              )}
            </span>
            {(startDate || endDate || search) && (
                <button
                    onClick={() => {
                      setSearch("");
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="text-sm text-accent hover:text-accent/80 font-bold flex items-center gap-1 transition-colors"
                >
                  <Filter className="w-4 h-4" /> Clear all filters
                </button>
            )}
          </div>

          {/* Results Grid */}
          {filteredEvents.length === 0 ? (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-32 glass-card rounded-3xl flex flex-col items-center"
              >
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
                  <Frown className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-3xl font-display font-bold mb-4">No events found</h3>
                <p className="text-xl text-muted-foreground mb-8">We couldn't find any events in this date range.</p>
                <button
                    onClick={() => {
                      setSearch("");
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  Reset Search
                </button>
              </motion.div>
          ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                  {filteredEvents.map((event) => (
                      <motion.div
                          key={event.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          className="relative"
                      >
                        {event.status === "Past" && (
                            <div className="absolute top-4 left-4 z-10 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                              Past Event
                            </div>
                        )}
                        <EventCard event={event} />
                      </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
          )}
        </div>

        {/* Event Proposal Modal */}
        <AnimatePresence>
          {showProposalModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowProposalModal(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-3xl p-6 z-10"
                >
                  <div className="sticky top-0 bg-card pb-4 border-b border-border mb-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Request an Event</h2>
                    <button
                        onClick={() => {
                          setShowProposalModal(false);
                          setResponseData(null);
                        }}
                        className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {submitSuccess ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Check className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-500 mb-2">Request Submitted!</h3>
                        <p className="text-muted-foreground">Your event proposal has been received.</p>
                        <p className="text-sm text-muted-foreground mt-4">We'll notify you via email once reviewed.</p>
                      </div>
                  ) : (
                      <form onSubmit={handleSubmitProposal} className="space-y-4">

                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Your Name <span className="text-red-500">*</span>
                          </label>
                          <input
                              type="text"
                              name="name"
                              value={proposalForm.name}
                              onChange={handleProposalChange}
                              required
                              className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                              placeholder="John Doe"
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Category <span className="text-red-500">*</span>
                          </label>
                          <select
                              name="category"
                              value={proposalForm.category}
                              onChange={handleProposalChange}
                              required
                              className={`w-full px-4 py-2 rounded-xl bg-background border ${
                                  fieldErrors.category ? 'border-red-500' : 'border-border'
                              } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none`}
                          >
                            <option value="">Select category</option>
                            {CATEGORY_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                            ))}
                          </select>
                          {fieldErrors.category && (
                              <p className="mt-1 text-xs text-red-500">
                                {Array.isArray(fieldErrors.category) ? fieldErrors.category.join(', ') : fieldErrors.category}
                              </p>
                          )}
                        </div>

                        {/* Event Title */}
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Event Title <span className="text-red-500">*</span>
                          </label>
                          <input
                              type="text"
                              name="event_title"
                              value={proposalForm.event_title}
                              onChange={handleProposalChange}
                              required
                              className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                              placeholder="e.g., Tech Conference 2024"
                          />
                        </div>

                        {/* Event Type */}
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Event Type <span className="text-red-500">*</span>
                          </label>
                          <select
                              name="event_type"
                              value={proposalForm.event_type}
                              onChange={handleProposalChange}
                              required
                              className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                          >
                            <option value="">Select type</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>

                        {/* Objective */}
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Objective <span className="text-red-500">*</span>
                          </label>
                          <textarea
                              name="objective"
                              value={proposalForm.objective}
                              onChange={handleProposalChange}
                              required
                              rows={2}
                              className={`w-full px-4 py-2 rounded-xl bg-background border ${
                                  fieldErrors.objective ? 'border-red-500' : 'border-border'
                              } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none`}
                              placeholder="What is the main objective of this event?"
                          />
                          {fieldErrors.objective && (
                              <p className="mt-1 text-xs text-red-500">
                                {Array.isArray(fieldErrors.objective) ? fieldErrors.objective.join(', ') : fieldErrors.objective}
                              </p>
                          )}
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                              name="description"
                              value={proposalForm.description}
                              onChange={handleProposalChange}
                              required
                              rows={3}
                              className={`w-full px-4 py-2 rounded-xl bg-background border ${
                                  fieldErrors.description ? 'border-red-500' : 'border-border'
                              } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none`}
                              placeholder="Describe the event in detail..."
                          />
                          {fieldErrors.description && (
                              <p className="mt-1 text-xs text-red-500">
                                {Array.isArray(fieldErrors.description) ? fieldErrors.description.join(', ') : fieldErrors.description}
                              </p>
                          )}
                        </div>

                        {/* Target Audience */}
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Target Audience <span className="text-red-500">*</span>
                          </label>
                          <input
                              type="text"
                              name="target_audience"
                              value={proposalForm.target_audience}
                              onChange={handleProposalChange}
                              required
                              className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                              placeholder="e.g., Developers, Students"
                          />
                        </div>

                        {/* Expected Attendees */}
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Expected Attendees <span className="text-red-500">*</span>
                          </label>
                          <input
                              type="number"
                              name="expected_attendees"
                              value={proposalForm.expected_attendees}
                              onChange={handleProposalChange}
                              required
                              min="1"
                              className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                              placeholder="e.g., 100"
                          />
                        </div>

                        {/* Event Date & Time — side by side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                              Event Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="event_date"
                                value={proposalForm.event_date}
                                onChange={handleProposalChange}
                                required
                                className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                          </div>

                          {/* ✅ Event Time field */}
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                              Event Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                name="event_time"
                                value={proposalForm.event_time}
                                onChange={handleProposalChange}
                                required
                                className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                          </div>
                        </div>

                        {/* City */}
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                              type="text"
                              name="city"
                              value={proposalForm.city}
                              onChange={handleProposalChange}
                              required
                              className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                              placeholder="e.g., New York"
                          />
                        </div>

                        {/* Venue */}
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Venue <span className="text-red-500">*</span>
                          </label>
                          <select
                              name="venue"
                              value={proposalForm.venue}
                              onChange={handleProposalChange}
                              required
                              className={`w-full px-4 py-2 rounded-xl bg-background border ${
                                  fieldErrors.venue ? 'border-red-500' : 'border-border'
                              } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none`}
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

                        {/* Paid */}
                        <div className="flex items-center gap-3">
                          <input
                              type="checkbox"
                              id="paid"
                              name="paid"
                              checked={proposalForm.paid}
                              onChange={handleProposalChange}
                              className="w-5 h-5 rounded border-border accent-primary cursor-pointer"
                          />
                          <label htmlFor="paid" className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
                            Paid Event
                          </label>
                        </div>

                        {/* Speakers */}
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Speakers <span className="text-red-500">*</span>
                          </label>
                          {proposalForm.speaker.map((speaker, index) => (
                              <div key={index} className="space-y-2 mb-4 p-3 bg-secondary/20 rounded-xl">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-semibold text-muted-foreground">Speaker {index + 1}</span>
                                  {proposalForm.speaker.length > 1 && (
                                      <button
                                          type="button"
                                          onClick={() => removeSpeaker(index)}
                                          className="text-red-500 hover:text-red-600"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                  )}
                                </div>
                                <input
                                    type="text"
                                    value={speaker.name}
                                    onChange={(e) => updateSpeaker(index, "name", e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Speaker name *"
                                    required={index === 0}
                                />
                                <input
                                    type="text"
                                    value={speaker.position}
                                    onChange={(e) => updateSpeaker(index, "position", e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Position (e.g., CEO, Professor)"
                                />
                                <input
                                    type="url"
                                    value={speaker.linked_profile}
                                    onChange={(e) => updateSpeaker(index, "linked_profile", e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="LinkedIn URL (e.g., https://linkedin.com/in/username)"
                                />
                              </div>
                          ))}
                          <button
                              type="button"
                              onClick={addSpeaker}
                              className="mt-2 text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" /> Add Speaker
                          </button>
                          {fieldErrors.speaker && (
                              <p className="mt-1 text-xs text-red-500">
                                {typeof fieldErrors.speaker === 'object'
                                    ? JSON.stringify(fieldErrors.speaker)
                                    : fieldErrors.speaker}
                              </p>
                          )}
                        </div>

                        {/* Error Message */}
                        {submitError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
                              {submitError}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                                Submitting...
                              </span>
                          ) : (
                              "Submit Request"
                          )}
                        </button>
                      </form>
                  )}
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </PageTransition>
  );
}