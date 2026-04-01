import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight,
  MapPin,
  Users,
  Calendar,
  Target,
  ChevronLeft,
  ChevronRight,
  Award,
  Heart,
  Rocket
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { EventCard } from "@/components/EventCard";
import { useUser } from "@/usercontext";

const NODE_API_URL = 'https://node-core-1qx9.vercel.app';

function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const inView = useInView(nodeRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    let startTime: number;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      if (progress < duration) {
        const percentage = progress / duration;
        const easeOut = 1 - Math.pow(1 - percentage, 4);
        setCount(Math.floor(end * easeOut));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, inView]);

  return { count, nodeRef };
}

const TEAM_MEMBERS = [
  { id: 1, name: "Abanob Gamal", role: "Team Leader", position: "Hype Makers" },
  { id: 2, name: "Sahar Emad Ahmed", role: "Core Team", position: "Hype Makers" },
  { id: 3, name: "Menna Mahmoud Sadek", role: "Core Team", position: "Hype Makers" },
  { id: 4, name: "Mahmoud Mostafa (Future)", role: "Core Team", position: "Hype Makers" },
  { id: 5, name: "Youssef Magdy Shabaan", role: "Core Team", position: "Hype Makers" },
];

export default function Home() {
  const { token } = useUser();
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loadingPast, setLoadingPast] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);
  const sliderRef = useRef<HTMLDivElement>(null);

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch { return "7:00 PM"; }
  };

  // Responsive slidesToShow — NO auto-slide
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setSlidesToShow(1);
      else if (window.innerWidth < 1024) setSlidesToShow(2);
      else setSlidesToShow(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, TEAM_MEMBERS.length - slidesToShow);

  const prevSlide = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
  const nextSlide = () => setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));

  // Fetch past events
  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        setApiError(null);
        const res = await fetch(`${NODE_API_URL}/api/events/past/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token?.access}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          const transformedEvents = data.data.map((event: any) => ({
            id: event.event_id,
            title: event.title || "Untitled Event",
            date: event.date || new Date().toISOString(),
            city: event.city || "Unknown City",
            description: event.description || "",
            type: event.type || "unknown",
            category: event.category || "General",
            target_audience: event.target_audience || "Everyone",
            venue: event.venue || false,
            is_finished: true,
            created_at: event.created_at,
            speakers: event.speakers || [],
            image: event.photos && event.photos.length > 0
                ? event.photos[0]
                : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
            num_attendees: event.num_attendees || 0,
            status: "Past",
          }));
          setPastEvents(transformedEvents.slice(0, 3));
          setUsingFallback(false);
        }
      } catch (err: any) {
        setApiError(err.message);
      } finally {
        setLoadingPast(false);
      }
    };
    fetchPastEvents();
  }, [token]);

  // Fetch upcoming events
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const res = await fetch(`${NODE_API_URL}/api/events/upcoming/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token?.access}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          const transformedEvents = data.data.map((event: any) => ({
            id: event.event_id,
            title: event.title || "Untitled Event",
            date: event.date || new Date().toISOString(),
            city: event.city || "Unknown City",
            description: event.description || "",
            type: event.type || "unknown",
            category: event.category || "General",
            target_audience: event.target_audience || "Everyone",
            venue: event.venue || false,
            is_finished: false,
            created_at: event.created_at,
            speakers: event.speakers || [],
            image: event.photos && event.photos.length > 0
                ? event.photos[0]
                : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
            num_attendees: event.num_attendees || 0,
            status: "Upcoming",
            mode: event.type === "online" ? "Online" : "In Person",
            price: 0,
            speaker: event.speakers?.[0]?.name || "TBD",
            attendees: event.num_attendees || 0,
            time: formatTime(event.date),
          }));
          setUpcomingEvents(transformedEvents.slice(0, 3));
        } else {
          setUpcomingEvents([]);
        }
      } catch (err: any) {
        setUpcomingEvents([]);
      } finally {
        setLoadingUpcoming(false);
      }
    };
    fetchUpcomingEvents();
  }, [token]);

  const heroText = "Experience the Extraordinary.".split(" ");

  return (
      <PageTransition className="pt-16 sm:pt-20">

        {/* ── Hero ── */}
        <section
            className="relative min-h-[80vh] sm:min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
                src="/images/image.jpeg"
                alt="Hero Background"
                className="w-full h-full object-cover blur-xs scale-105"
            />
            <div className="absolute inset-0 bg-black/50"/>
          </div>
          <div
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center flex flex-col items-center pt-12 sm:pt-20">
            <motion.div
                initial={{opacity: 0, scale: 0.8}}
                animate={{opacity: 1, scale: 1}}
                transition={{type: "spring", bounce: 0.5}}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6 border border-white/20"
            >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"/>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"/>
            </span>
              <span className="text-sm font-bold text-white">Live Now: {upcomingEvents.length} Events</span>
            </motion.div>

            <div className="mb-6 flex flex-wrap justify-center gap-x-4 max-w-4xl">
              {heroText.map((word, i) => (
                  <motion.span
                      key={i}
                      initial={{opacity: 0, y: 40}}
                      animate={{opacity: 1, y: 0}}
                      transition={{delay: i * 0.15, duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9]}}
                      className={`text-4xl md:text-6xl xl:text-7xl font-display font-extrabold leading-tight tracking-tight ${word === 'Extraordinary.' ? 'text-accent' : 'text-white'}`}
                  >
                    {word}
                  </motion.span>
              ))}
            </div>

            <motion.p
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.6, duration: 0.8}}
                className="text-base sm:text-xl text-gray-200 mb-10 max-w-2xl leading-relaxed font-medium"
            >
              Voltra is the premium platform connecting visionaries, creators, and attendees. Discover curated tech
              summits, exclusive art shows, and global music festivals.
            </motion.p>

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.8, duration: 0.8}}
            >
              <Link href="/events"
                    className="group relative px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="relative flex items-center gap-2">
                  Explore Events <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── About ── */}
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="order-2 lg:order-1">
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">
                  We're on a Mission to <span className="text-accent">Transform Events</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Voltra was born from a simple idea: events should be extraordinary. Founded in 2025, we've grown from a small team of passionate event enthusiasts to a global platform connecting creators with audiences worldwide.
                </p>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[
                    { icon: Award, color: "accent", value: "500+", label: "Events Hosted" },
                    { icon: Heart, color: "accent", value: "50k+", label: "Happy Attendees" },
                    { icon: Users, color: "accent", value: "120+", label: "Cities Worldwide" },
                    { icon: Rocket, color: "accent", value: "24/7", label: "Support" },
                  ].map(({ icon: Icon, color, value, label }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div className={`p-3 rounded-xl bg-${color}/10`}>
                          <Icon className={`w-6 h-6 text-${color}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-xl text-foreground">{value}</h4>
                          <p className="text-sm text-muted-foreground">{label}</p>
                        </div>
                      </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="relative order-1 lg:order-2">
                <div className="relative rounded-3xl overflow-hidden shadow-lg">
                  <img src="/images/image2.jpeg" alt="About Voltra" className="w-full h-auto rounded-3xl" />
                  <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-sm p-4 rounded-2xl">
                    <div className="flex justify-around">
                      {[["4.9", "Rating"], ["150+", "Partners"], ["98%", "Satisfaction"]].map(([val, lbl]) => (
                          <div key={lbl} className="text-center">
                            <div className="text-2xl font-bold text-white">{val}</div>
                            <div className="text-xs text-gray-300">{lbl}</div>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Team Slider ── */}
        <section className="py-20 bg-secondary/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">Meet Our Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The brilliant minds behind Voltra, working tirelessly to bring you the best events.
              </p>
            </div>

            <div className="relative">
              {/* Prev Arrow */}
              <button
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-md hover:bg-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>

              {/* Next Arrow */}
              <button
                  onClick={nextSlide}
                  disabled={currentIndex >= maxIndex}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-md hover:bg-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>

              {/* Track */}
              <div ref={sliderRef} className="overflow-hidden mx-6">
                <motion.div
                    className="flex"
                    animate={{ x: `-${currentIndex * (100 / slidesToShow)}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {TEAM_MEMBERS.map((member) => (
                      <motion.div
                          key={member.id}
                          className="flex-shrink-0 px-3"
                          style={{ width: `${100 / slidesToShow}%` }}
                          whileHover={{ y: -4 }}
                          transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="bg-card border border-border rounded-3xl p-6 text-center group h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
                          {/* Avatar */}
                          <div className="relative mb-5 mx-auto w-24 h-24 md:w-28 md:h-28">
                            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-border flex items-center justify-center">
                              <span className="text-2xl font-bold text-accent">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          {/* Info */}
                          <div className="flex-1 flex flex-col items-center justify-center gap-1">
                            <h3 className="font-bold text-lg md:text-xl text-foreground">{member.name}</h3>
                            <p className="text-sm text-accent font-medium">{member.role}</p>
                            <p className="text-xs text-muted-foreground">{member.position}</p>
                          </div>
                        </div>
                      </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`rounded-full transition-all duration-300 ${
                            currentIndex === idx
                                ? "w-8 bg-accent h-2"
                                : "w-2 h-2 bg-border hover:bg-muted-foreground/30"
                        }`}
                    />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Upcoming Events ── */}
        <section className="py-32 bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-16">
              <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">Trending Upcoming</h2>
                <p className="text-xl text-muted-foreground font-medium">Secure your spot at the most anticipated events.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {loadingUpcoming ? (
                  <div className="col-span-3 text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent" />
                    <p className="mt-4 text-muted-foreground">Loading upcoming events...</p>
                  </div>
              ) : upcomingEvents.length === 0 ? (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-muted-foreground">No upcoming events found.</p>
                  </div>
              ) : (
                  upcomingEvents.map((event, i) => (
                      <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.15, duration: 0.5 }}
                          className="h-full"
                      >
                        <EventCard event={event} />
                      </motion.div>
                  ))
              )}
            </div>
          </div>
        </section>

        {/* ── Past Events ── */}
        <section className="py-24 bg-secondary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">Relive the Magic</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Catch up on what you missed. Watch recordings and view galleries from our most iconic past events.
              </p>
              {apiError && (
                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg inline-block">
                    <p className="text-sm text-amber-500">⚠️ {apiError}</p>
                  </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {loadingPast ? (
                  <div className="col-span-3 text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent" />
                    <p className="mt-4 text-muted-foreground">Loading past events...</p>
                  </div>
              ) : pastEvents.length === 0 ? (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-muted-foreground">No past events found.</p>
                  </div>
              ) : (
                  pastEvents.map((event, i) => (
                      <motion.div
                          key={event.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="group relative rounded-3xl overflow-hidden bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg"
                      >
                        <Link href={`/events/${event.id}`}>
                          <div className="relative aspect-video overflow-hidden">
                            <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop";
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <span className="absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full bg-black/60 text-white backdrop-blur-sm">
                        {event.type === "online" ? "🖥️ Online" : "📍 In Person"}
                      </span>
                            <span className="absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full bg-accent/90 text-white">
                        {event.category?.replace('_', ' ')}
                      </span>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1">{event.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description || "No description available"}</p>
                            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                                <span className="truncate">{event.city}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="w-4 h-4 text-accent flex-shrink-0" />
                                <span>{event.num_attendees || 0}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Target className="w-4 h-4 text-accent flex-shrink-0" />
                                <span className="truncate">{event.target_audience || "All"}</span>
                              </div>
                            </div>
                            {event.speakers && event.speakers.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Speakers</p>
                                  <div className="flex flex-wrap gap-2">
                                    {event.speakers.map((speaker: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-1 bg-secondary/50 rounded-full px-3 py-1">
                                          <span className="text-xs font-medium text-foreground">{speaker.name}</span>
                                          {speaker.position && <span className="text-[10px] text-muted-foreground">• {speaker.position}</span>}
                                        </div>
                                    ))}
                                  </div>
                                </div>
                            )}
                            <div className="flex gap-3 mt-4">
                        <span className="flex-1 px-4 py-2 rounded-xl bg-accent text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors">
                          View Details <ArrowRight className="w-4 h-4" />
                        </span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                  ))
              )}
            </div>

            {pastEvents.length > 0 && !usingFallback && (
                <div className="text-center mt-12">
                  <Link href="/events?filter=past" className="inline-flex items-center gap-2 text-accent font-bold hover:underline">
                    View All Events <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
            )}
          </div>
        </section>

      </PageTransition>
  );
}