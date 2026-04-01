import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {MapPin, Calendar, Clock, User, ArrowLeft, Share2, X, Check, ArrowRight, Linkedin} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { useUser } from "@/usercontext";

const NODE_API_URL = 'https://node-core-1qx9.vercel.app';
const DJANGO_API_URL = 'https://django-kf3s.vercel.app';

export default function EventDetails() {
  const [, params] = useRoute("/events/:id");
  const { token } = useUser();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = window.location.href;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleRegister = async () => {
    if (!token?.access) {
      alert("Please log in to register for events");
      return;
    }

    try {
      setRegistering(true);

      const userRes = await fetch(`${DJANGO_API_URL}/api/account/`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token.access}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!userRes.ok) throw new Error("Failed to fetch your account data");

      const userData = await userRes.json();

      const registrationPayload = {
        id: userData.id ? userData.id.toString() : "",
        username: userData.username || "",
        email: userData.email || "",
        track: userData.track || userData.user_track || "",
        ALX_status: userData.user_status || "learner",
        is_checked: true
      };

      const res = await fetch(`${NODE_API_URL}/api/events/${params?.id}/register/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.access}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(registrationPayload)
      });

      const responseData = await res.json();

      if (res.ok) {
        setRegistrationSuccess(true);
        setIsRegistered(true);
        setTimeout(() => {
          setShowRegistrationModal(false);
          setRegistrationSuccess(false);
        }, 2000);
      } else {
        throw new Error(responseData.message || responseData.error || "Registration failed");
      }
    } catch (err: any) {
      console.error("❌ Registration error:", err);
      alert(err.message);
    } finally {
      setRegistering(false);
    }
  };

  // Maps raw API response → display-ready event object
  const transformEventData = (eventData: any) => {
    return {
      id: eventData.event_id,
      title: eventData.title || "Untitled Event",
      date: eventData.date || new Date().toISOString().split("T")[0],
      time: eventData.time
          ? (() => {
            const [h, m] = eventData.time.split(":");
            const hour = parseInt(h, 10);
            const ampm = hour >= 12 ? "PM" : "AM";
            const hour12 = hour % 12 || 12;
            return `${hour12}:${m} ${ampm}`;
          })()
          : "TBD",
      city: eventData.city || "Unknown City",
      description: eventData.description || "",
      mode: eventData.type === "online" ? "Online" : "In Person",
      category: eventData.category || "General",
      target_audience: eventData.target_audience || "Everyone",
      venue: eventData.venue || false,
      is_finished: eventData.is_finished || false,
      speakers: Array.isArray(eventData.speakers) ? eventData.speakers : [],
      image:
          eventData.photos && eventData.photos.length > 0
              ? eventData.photos[0]
              : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
      num_attendees: eventData.num_attendees || 0,
      status: eventData.is_finished ? "Past" : "Upcoming",
      price: eventData.paid ? 1 : 0,
    };
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const eventId = params?.id;
        if (!eventId) throw new Error("No event ID provided");

        const eventRes = await fetch(`${NODE_API_URL}/api/events/${eventId}/`, {
          headers: { 'Accept': 'application/json' },
        });

        if (!eventRes.ok) throw new Error(`Failed to fetch event: ${eventRes.status}`);

        const eventData = await eventRes.json();
        const rawEvent = eventData.data ?? eventData;

        if (!rawEvent || (!rawEvent.event_id && !rawEvent.title)) {
          throw new Error(`Event with ID "${eventId}" not found.`);
        }

        setEvent(transformEventData(rawEvent));
      } catch (err: any) {
        console.error("Error fetching event details:", err);
        setError(err.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) fetchEventDetails();
  }, [params?.id]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading event details...</p>
          </div>
        </div>
    );
  }

  if (error || !event) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Event not found</h2>
            <p className="text-muted-foreground mb-6">{error || "The event you're looking for doesn't exist."}</p>
            <Link href="/events" className="text-accent hover:underline">Return to events</Link>
          </div>
        </div>
    );
  }

  return (
      <PageTransition className="pt-20 pb-24 bg-background">
        {/* Registration Modal */}
        {showRegistrationModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-card rounded-3xl max-w-sm w-full p-8 relative text-center border border-gray-200 dark:border-white/10"
              >
                <button
                    onClick={() => setShowRegistrationModal(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-secondary flex items-center justify-center hover:bg-gray-200 dark:hover:bg-secondary/80 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>

                {registrationSuccess ? (
                    <div className="py-4">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-green-500 mb-2">Registered Successfully!</h3>
                      <p className="text-gray-600 dark:text-muted-foreground">See you at the event!</p>
                    </div>
                ) : (
                    <div className="py-4">
                      <h2 className="text-2xl font-bold mb-2 text-foreground">Confirm Registration</h2>
                      <p className="text-gray-600 dark:text-muted-foreground mb-8">
                        Register for <span className="font-semibold text-accent">{event.title}</span>?
                      </p>
                      <button
                          onClick={handleRegister}
                          disabled={registering}
                          className="w-full py-4 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {registering ? (
                            <span className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      Registering...
                    </span>
                        ) : (
                            "Confirm"
                        )}
                      </button>
                    </div>
                )}
              </motion.div>
            </div>
        )}

        {/* Hero Image */}
        <div className="w-full h-[40vh] md:h-[50vh] relative">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute top-8 left-4 md:left-8">
            <Link href="/events" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white dark:hover:bg-black/70 transition-colors border border-gray-200 dark:border-white/10">
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
                  className="bg-white dark:bg-gray-900/50 p-8 rounded-3xl mb-8 border border-gray-200 dark:border-white/10"
              >
                <div className="flex gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 text-xs font-bold rounded-lg bg-accent/20 text-accent">
                  {event.mode}
                </span>
                  {event.category && (
                      <span className="px-3 py-1 text-xs font-bold rounded-lg bg-gray-100 dark:bg-secondary/50 text-gray-700 dark:text-foreground">
                    {event.category.replace(/_/g, ' ')}
                  </span>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-gray-900 dark:text-white">
                  {event.title}
                </h1>

                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-lg text-gray-600 dark:text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">About this event</h3>
                  <p className="text-gray-600 dark:text-muted-foreground leading-relaxed">
                    Join us for an incredible experience that brings together the best minds and talents.
                    {event.target_audience && ` This event is perfect for ${event.target_audience}.`}
                  </p>
                </div>

                {event.speakers && event.speakers.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Speakers</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div>
                            <div className="space-y-3">
                              {/* Speaker Header */}
                              <div className="flex items-center gap-2 mb-3">
                                <div className="h-6 w-0.5 bg-gradient-to-b from-accent to-accent rounded-full"/>
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                                  Featured Speaker
                                </h4>
                              </div>

                              {/* Speaker Card */}
                              <div className="group relative">
                                {/* Main Speaker Card - No glow in light mode */}
                                <div className="relative bg-white dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-200 dark:border-white/10 hover:border-accent/50 dark:hover:border-accent/30 transition-all duration-300">
                                  <div className="flex items-start gap-4">
                                    {/* Avatar / Icon */}
                                    <div className="relative">
                                      <div className="relative w-12 h-12 bg-accent/10 dark:bg-accent/20 rounded-full flex items-center justify-center border border-gray-200 dark:border-white/20">
                                        <User className="w-6 h-6 text-accent"/>
                                      </div>
                                    </div>

                                    {/* Speaker Info */}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-accent transition-colors">
                                          {event.speakers[0].name}
                                        </h3>
                                        {event.speakers[0].position && (
                                            <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full border border-accent/20">
                {event.speakers[0].position}
              </span>
                                        )}
                                      </div>

                                      {/* LinkedIn Link */}
                                      {event.speakers[0].linked_profile && (
                                          <a
                                              href={event.speakers[0].linked_profile}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1.5 mt-2 text-sm text-gray-500 dark:text-muted-foreground hover:text-accent transition-colors group/link"
                                          >
                                            <Linkedin className="w-3.5 h-3.5"/>
                                            <span className="text-xs">View Profile</span>
                                            <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform"/>
                                          </a>
                                      )}
                                    </div>

                                    {/* Badge */}
                                    <div className="hidden sm:block">
                                      <div className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-muted-foreground">
                                        Speaker
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                  initial={{opacity: 0, x: 20}}
                  animate={{opacity: 1, x: 0}}
                  transition={{delay: 0.2}}
                  className="bg-white dark:bg-gray-900/50 p-6 rounded-3xl sticky top-24 border border-gray-200 dark:border-white/10"
              >
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1">Price</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {event.price === 0 ? "Free" : `$${event.price}`}
                    </div>
                  </div>
                  <button
                      onClick={handleShare}
                      title={shareCopied ? "Link copied!" : "Copy link"}
                      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-secondary flex items-center justify-center text-gray-600 dark:text-foreground hover:bg-gray-200 dark:hover:bg-secondary/80 transition-colors"
                  >
                    {shareCopied ? <Check className="w-5 h-5 text-green-500"/> : <Share2 className="w-5 h-5"/>}
                  </button>
                </div>

                <ul className="space-y-6 mb-8">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <Calendar className="w-5 h-5"/>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {format(new Date(event.date), "MMMM dd, yyyy")}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-muted-foreground">Add to Calendar</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <Clock className="w-5 h-5"/>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{event.time}</div>
                      <div className="text-sm text-gray-500 dark:text-muted-foreground">Local time</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{event.city}</div>
                      <div className="text-sm text-gray-500 dark:text-muted-foreground">
                        {event.mode === "Online" ? "Virtual link provided" : "Venue details sent upon registration"}
                      </div>
                    </div>
                  </li>
                </ul>

                <button
                    onClick={() => setShowRegistrationModal(true)}
                    disabled={isRegistered || event.status === "Past"}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                        isRegistered
                            ? "bg-green-500 text-white"
                            : event.status === "Past"
                                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                : "bg-accent hover:bg-accent/90 text-white"
                    }`}
                >
                  {isRegistered ? "Registered Successfully!" : event.status === "Past" ? "Event Ended" : "Secure Your Spot"}
                </button>
              </motion.div>
            </div>

          </div>
        </div>
      </PageTransition>
  );
}