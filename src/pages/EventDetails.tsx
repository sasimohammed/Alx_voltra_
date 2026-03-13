import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { MapPin, Calendar, Clock, Users, User, ArrowLeft, Share2, Heart, X } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { useUser } from "@/usercontext";

export default function EventDetails() {
  const [, params] = useRoute("/events/:id");
  const { token } = useUser();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [registeredAttendees, setRegisteredAttendees] = useState<number>(0);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // All possible tracks for the datalist
  const allTracks = [
    "frontend",
    "backend",
    "fullstack",
    "data_science",
    "devops",
    "mobile",
    "cloud",
    "cybersecurity",
    "ai_ml",
    "ui_ux",
    "product_management",
    "qa_testing",
    "blockchain",
    "iot",
    "game_development",
    "database_administration",
    "systems_architecture"
  ];

  // Registration modal state
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationErrors, setRegistrationErrors] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    email: "",
    track: "",
    alx_status: ""
  });

  // Fetch number of registered attendees - WITH AUTH TOKEN
  const fetchRegisteredAttendees = async () => {
    if (!params?.id) return;

    try {
      setLoadingAttendees(true);

      console.log(`Fetching registered attendees for event ${params.id}...`);

      // Include authorization token
      const res = await fetch(`/api/events/registered/${params.id}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token?.access}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("✅ Registered attendees data:", data);

        // Handle different possible response formats
        if (typeof data === 'number') {
          setRegisteredAttendees(data);
        } else if (data.count !== undefined) {
          setRegisteredAttendees(data.count);
        } else if (data.attendees_count !== undefined) {
          setRegisteredAttendees(data.attendees_count);
        } else if (data.registered_count !== undefined) {
          setRegisteredAttendees(data.registered_count);
        } else if (Array.isArray(data)) {
          setRegisteredAttendees(data.length);
        } else if (data.data && typeof data.data === 'number') {
          setRegisteredAttendees(data.data);
        } else if (data.attendees && Array.isArray(data.attendees)) {
          setRegisteredAttendees(data.attendees.length);
        } else {
          console.warn("Unexpected response format:", data);
          // Try to find any numeric property that might be the count
          const possibleCountProps = ['total', 'count', 'size', 'length', 'num_attendees', 'attendee_count'];
          for (const prop of possibleCountProps) {
            if (typeof data[prop] === 'number') {
              setRegisteredAttendees(data[prop]);
              break;
            }
          }
        }
      } else if (res.status === 401) {
        console.error("❌ Unauthorized - Token may be invalid or expired");
        setRegisteredAttendees(0);
      } else {
        console.error("❌ Failed to fetch registered attendees:", res.status);
        const errorText = await res.text();
        console.error("Error response:", errorText);
      }
    } catch (err) {
      console.error("❌ Error fetching registered attendees:", err);
    } finally {
      setLoadingAttendees(false);
    }
  };

  // Fetch user data from account API
  const fetchUserData = async () => {
    if (!token?.access) {
      alert("Please log in to register for events");
      return;
    }
    else{
      console.log(token);
    }

    try {
      setLoadingUser(true);

      console.log("Fetching user data with token...");

      const res = await fetch('/django-api/account/', {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token.access}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("✅ User data from account API:", data);

        const registrationFormData = {
          id: data.id ? data.id.toString() : "",
          username: data.username || "",
          email: data.email || "",
          track: "",
          alx_status: data.user_status || "learner"
        };

        console.log("📝 Mapped registration data:", registrationFormData);

        setUserData(data);
        setFormData(registrationFormData);
      } else {
        console.error("❌ Failed to fetch user data:", res.status);
      }
    } catch (err) {
      console.error("❌ Error fetching user data:", err);
    } finally {
      setLoadingUser(false);
    }
  };

  // Handle registration submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationErrors(null);

    try {
      setRegistering(true);

      console.log("Current form data before submission:", formData);

      if (!formData.id) throw new Error("User ID is missing");
      if (!formData.username) throw new Error("Username is missing");
      if (!formData.email) throw new Error("Email is missing");
      if (!formData.track) throw new Error("Please select a track");
      if (!formData.alx_status) throw new Error("ALX status is missing");

      // Prepare payload exactly as the API expects
      const registrationPayload = {
        id: formData.id,
        username: formData.username,
        email: formData.email,
        track: formData.track,
        ALX_status: formData.alx_status,
        is_checked: true
      };

      console.log("📤 Sending registration payload:", JSON.stringify(registrationPayload, null, 2));
      console.log("Event ID:", params?.id);

      const res = await fetch(`/api/events/${params?.id}/register/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token?.access}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(registrationPayload)
      });

      const responseData = await res.json();
      console.log("Registration response status:", res.status);
      console.log("Registration response data:", JSON.stringify(responseData, null, 2));

      if (res.ok) {
        console.log("✅ Registration successful:", responseData);
        setRegistrationSuccess(true);
        setIsRegistered(true);

        // Refresh attendees count after successful registration
        await fetchRegisteredAttendees();

        setTimeout(() => {
          setShowRegistrationModal(false);
          setRegistrationSuccess(false);
        }, 2000);
      } else {
        console.error("Full error response:", responseData);

        if (responseData.errors) {
          setRegistrationErrors(responseData.errors);

          let errorMessage = "Registration failed:\n";

          if (responseData.errors.fieldErrors) {
            Object.entries(responseData.errors.fieldErrors).forEach(([field, errors]) => {
              errorMessage += `${field}: ${(errors as string[]).join(', ')}\n`;
            });
          }

          if (responseData.errors.formErrors && responseData.errors.formErrors.length > 0) {
            errorMessage += `Form errors: ${responseData.errors.formErrors.join(', ')}\n`;
          }

          throw new Error(errorMessage);
        } else {
          throw new Error(responseData.message || responseData.error || "Registration failed");
        }
      }
    } catch (err: any) {
      console.error("❌ Registration error:", err);
      alert(err.message);
    } finally {
      setRegistering(false);
    }
  };

  // Handle track input change
  const handleTrackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      track: e.target.value
    });
  };

  // Open registration modal
  const openRegistrationModal = async () => {
    if (!token?.access) {
      alert("Please log in to register for events");
      return;
    }
    await fetchUserData();
    setShowRegistrationModal(true);
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const eventId = params?.id;
        console.log("Fetching event details for ID:", eventId);

        // Fetch registered attendees count - with token
        if (token?.access) {
          await fetchRegisteredAttendees();
        }

        const upcomingRes = await fetch(`/api/events/upcoming/`, {
          headers: { 'Accept': 'application/json' },
        });

        if (upcomingRes.ok) {
          const upcomingData = await upcomingRes.json();
          const foundEvent = upcomingData.data?.find((e: any) => e.event_id === parseInt(eventId!));
          if (foundEvent) {
            setEvent(transformEventData(foundEvent));
            setLoading(false);
            return;
          }
        }

        const pastRes = await fetch(`/api/events/past/`, {
          headers: { 'Accept': 'application/json' },
        });

        if (pastRes.ok) {
          const pastData = await pastRes.json();
          const foundEvent = pastData.data?.find((e: any) => e.event_id === parseInt(eventId!));
          if (foundEvent) {
            setEvent(transformEventData(foundEvent));
            setLoading(false);
            return;
          }
        }

        throw new Error("Event not found");

      } catch (err: any) {
        console.error("Error fetching event details:", err);
        setError(err.message || "Failed to load event");
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchEventDetails();
    }
  }, [params?.id, token?.access]); // Added token dependency

  const transformEventData = (eventData: any) => {
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

    return {
      id: eventData.event_id,
      title: eventData.title || "Untitled Event",
      date: eventData.date || new Date().toISOString(),
      city: eventData.city || "Unknown City",
      description: eventData.description || "",
      type: eventData.type || "unknown",
      mode: eventData.type === "online" ? "Online" : "In Person",
      category: eventData.category || "General",
      target_audience: eventData.target_audience || "Everyone",
      venue: eventData.venue || false,
      is_finished: eventData.is_finished || false,
      speakers: eventData.event_speakers || [],
      image: eventData.photos && eventData.photos.length > 0
          ? eventData.photos[0]
          : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
      num_attendees: eventData.num_attendees || 0,
      status: eventData.is_finished ? "Past" : "Upcoming",
      price: 0,
      speaker: eventData.event_speakers?.[0]?.name || "TBD",
      attendees: eventData.num_attendees || 0,
      time: formatTime(eventData.date)
    };
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading event details...</p>
          </div>
        </div>
    );
  }

  if (error || !event) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Event not found</h2>
            <p className="text-muted-foreground mb-6">{error || "The event you're looking for doesn't exist."}</p>
            <Link href="/events" className="text-accent hover:underline">Return to events</Link>
          </div>
        </div>
    );
  }

  return (
      <PageTransition className="pt-20 pb-24">
        {/* Registration Modal */}
        {showRegistrationModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-3xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
              >
                <button
                    onClick={() => setShowRegistrationModal(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <h2 className="text-2xl font-bold mb-6">Register for {event.title}</h2>

                {registrationSuccess ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-green-500 mb-2">Registered Successfully!</h3>
                      <p className="text-muted-foreground">See you at the event!</p>
                    </div>
                ) : (
                    <>
                      {loadingUser ? (
                          <div className="text-center py-8">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
                            <p className="mt-4 text-muted-foreground">Loading your profile data...</p>
                          </div>
                      ) : (
                          <form onSubmit={handleRegister} className="space-y-4">
                            {/* Display user info */}
                            <div className="bg-secondary/30 rounded-xl p-4 mb-4">
                              <div className="text-sm text-muted-foreground mb-1">Registering as:</div>
                              <div className="font-medium">{formData.username} ({formData.email})</div>
                            </div>

                            {/* Validation Errors Display */}
                            {registrationErrors && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                                  <p className="text-xs text-red-500 font-semibold mb-1">Validation Errors:</p>
                                  {registrationErrors.fieldErrors && Object.entries(registrationErrors.fieldErrors).map(([field, errors]) => (
                                      <div key={field} className="mb-2">
                                        <p className="text-xs text-red-400 font-medium">{field}:</p>
                                        {(errors as string[]).map((error, idx) => (
                                            <p key={idx} className="text-xs text-red-400/80 ml-2">• {error}</p>
                                        ))}
                                      </div>
                                  ))}
                                  {registrationErrors.formErrors && registrationErrors.formErrors.length > 0 && (
                                      <div>
                                        <p className="text-xs text-red-400 font-medium">Form Errors:</p>
                                        {registrationErrors.formErrors.map((error: string, idx: number) => (
                                            <p key={idx} className="text-xs text-red-400/80 ml-2">• {error}</p>
                                        ))}
                                      </div>
                                  )}
                                </div>
                            )}

                            {/* Track Selection - Input with Datalist */}
                            <div>
                              <label className="block text-sm font-medium text-muted-foreground mb-2">
                                Enter Your Track <span className="text-red-500">*</span>
                              </label>
                              <input
                                  type="text"
                                  list="tracks"
                                  value={formData.track}
                                  onChange={handleTrackChange}
                                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-accent focus:outline-none"
                                  placeholder="Start typing or select from list"
                                  required
                              />
                              <datalist id="tracks">
                                {allTracks.map((track) => (
                                    <option key={track} value={track}>
                                      {track.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                              </datalist>
                              <p className="text-xs text-muted-foreground mt-1">
                                You can type any track or select from the suggestions
                              </p>
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                              Your registration will be confirmed with your account details above.
                            </p>

                            <button
                                type="submit"
                                disabled={registering}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                            >
                              {registering ? (
                                  <span className="flex items-center justify-center gap-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                          Registering...
                        </span>
                              ) : (
                                  "Confirm Registration"
                              )}
                            </button>
                          </form>
                      )}
                    </>
                )}
              </motion.div>
            </div>
        )}

        {/* Hero Image */}
        <div className="w-full h-[40vh] md:h-[50vh] relative">
          <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

          <div className="absolute top-8 left-4 md:left-8">
            <Link href="/events" className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-white hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-32 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-8 rounded-3xl mb-8"
              >
                <div className="flex gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 text-xs font-bold rounded-lg bg-accent/20 text-accent">
                  {event.type}
                </span>
                  <span className="px-3 py-1 text-xs font-bold rounded-lg bg-primary/20 text-primary-foreground">
                  {event.mode}
                </span>
                  {event.category && (
                      <span className="px-3 py-1 text-xs font-bold rounded-lg bg-secondary/50 text-foreground">
                    {event.category.replace('_', ' ')}
                  </span>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">
                  {event.title}
                </h1>

                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                  <h3 className="text-2xl font-bold mt-8 mb-4">About this event</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Join us for an incredible experience that brings together the best minds and talents.
                    {event.target_audience && ` This event is perfect for ${event.target_audience}.`}
                  </p>
                </div>

                {/* Speakers Section */}
                {event.speakers && event.speakers.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-2xl font-bold mb-4">Speakers</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {event.speakers.map((speaker: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30">
                              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                                <User className="w-6 h-6 text-accent" />
                              </div>
                              <div>
                                <div className="font-semibold">{speaker.name}</div>
                                <div className="text-sm text-muted-foreground">{speaker.position}</div>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-6 rounded-3xl sticky top-24"
              >
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-border">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Price</div>
                    <div className="text-3xl font-bold text-foreground">
                      {event.price === 0 ? "Free" : `$${event.price}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <ul className="space-y-6 mb-8">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{format(new Date(event.date), "MMMM dd, yyyy")}</div>
                      <div className="text-sm text-muted-foreground">Add to Calendar</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{event.time}</div>
                      <div className="text-sm text-muted-foreground">Local time</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{event.city}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.mode === "Online" ? "Virtual Link provided" : "Venue details sent upon registration"}
                      </div>
                    </div>
                  </li>
                  {event.speakers && event.speakers.length > 0 && (
                      <li className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{event.speakers[0].name}</div>
                          <div className="text-sm text-muted-foreground">{event.speakers[0].position}</div>
                        </div>
                      </li>
                  )}
                </ul>

                <button
                    onClick={openRegistrationModal}
                    disabled={isRegistered || event.status === "Past"}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                        isRegistered
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                            : event.status === "Past"
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1"
                    }`}
                >
                  {isRegistered ? "Registered Successfully!" : event.status === "Past" ? "Event Ended" : "Secure Your Spot"}
                </button>

                <div className="mt-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  {loadingAttendees ? (
                      <span>Loading attendees...</span>
                  ) : !token?.access ? (
                      <span>Login to see attendee count</span>
                  ) : (
                      <span>{registeredAttendees || 0} attending</span>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </PageTransition>
  );
}