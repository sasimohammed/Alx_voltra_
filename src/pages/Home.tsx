import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight,
  Star,
  Shield,
  Zap,
  Map,
  MapPin,
  Globe,
  MonitorPlay,
  Users,
  Calendar,
  Target,
  ChevronLeft,
  ChevronRight,
  Twitter,
  Linkedin,
  Github,
  Award,
  Sparkles,
  Heart,
  Rocket
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { EventCard } from "@/components/EventCard";

// API URLs
const NODE_API_URL = 'https://node-core-1qx9.vercel.app';

// Animated Counter Hook
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

function StatCard({ label, value, suffix = "", icon: Icon }: { label: string, value: number, suffix?: string, icon: any }) {
  const { count, nodeRef } = useCounter(value);

  return (
      <div ref={nodeRef} className="relative overflow-hidden p-6 sm:p-8 rounded-2xl sm:rounded-3xl glass-card flex flex-col items-center justify-center text-center group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-accent mb-2 sm:mb-4" />
        <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-foreground mb-1 sm:mb-2 flex items-baseline">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">{label}</div>
      </div>
  );
}

// Team member data
const TEAM_MEMBERS = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "CEO & Founder",
    image: "https://images.unsplash.com/photo-1494790108777-76666e7fad0c?q=80&w=987&auto=format&fit=crop",
    social: { twitter: "#", linkedin: "#", github: "#" }
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Creative Director",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=987&auto=format&fit=crop",
    social: { twitter: "#", linkedin: "#", github: "#" }
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Lead Designer",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f9e?q=80&w=987&auto=format&fit=crop",
    social: { twitter: "#", linkedin: "#", github: "#" }
  },
  {
    id: 4,
    name: "David Kim",
    role: "Head of Events",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=987&auto=format&fit=crop",
    social: { twitter: "#", linkedin: "#", github: "#" }
  },
  {
    id: 5,
    name: "Lisa Wang",
    role: "Marketing Manager",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1061&auto=format&fit=crop",
    social: { twitter: "#", linkedin: "#", github: "#" }
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Technical Lead",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
    social: { twitter: "#", linkedin: "#", github: "#" }
  }
];

const CATEGORIES = [
  { name: "Tech", icon: MonitorPlay, count: 320, color: "from-blue-500 to-cyan-500" },
  { name: "Music", icon: Users, count: 184, color: "from-purple-500 to-pink-500" },
  { name: "Art", icon: Star, count: 96, color: "from-orange-500 to-red-500" },
  { name: "Business", icon: Shield, count: 412, color: "from-emerald-500 to-teal-500" },
  { name: "Sports", icon: Zap, count: 145, color: "from-yellow-500 to-amber-500" },
];

// Fallback past events
const FALLBACK_PAST_EVENTS = [
  {
    id: "fallback-1",
    title: "Tech Summit 2024",
    city: "San Francisco",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
    status: "Past",
    date: "2024-12-01",
    type: "online",
    category: "Tech",
    description: "A major tech summit featuring industry leaders",
    num_attendees: 500,
    target_audience: "developers",
    speakers: [{ name: "John Doe", position: "CTO" }]
  },
  {
    id: "fallback-2",
    title: "Music Festival",
    city: "Austin",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070&auto=format&fit=crop",
    status: "Past",
    date: "2024-11-15",
    type: "in-person",
    category: "Music",
    description: "Annual music festival with top artists",
    num_attendees: 1000,
    target_audience: "music lovers",
    speakers: []
  },
  {
    id: "fallback-3",
    title: "Art Exhibition",
    city: "New York",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2080&auto=format&fit=crop",
    status: "Past",
    date: "2024-10-20",
    type: "in-person",
    category: "Art",
    description: "Contemporary art exhibition",
    num_attendees: 300,
    target_audience: "art enthusiasts",
    speakers: []
  }
];

export default function Home() {
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loadingPast, setLoadingPast] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Team slider state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(4);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Format time helper function
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

  // Update slidesToShow based on window width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 768) {
        setSlidesToShow(2);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(3);
      } else {
        setSlidesToShow(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(timer);
  }, [currentIndex, slidesToShow]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
        prevIndex + slidesToShow >= TEAM_MEMBERS.length ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? Math.max(0, TEAM_MEMBERS.length - slidesToShow) : prevIndex - 1
    );
  };

  // Fetch past events from API
  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        setApiError(null);
        console.log("Fetching past events...");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`${NODE_API_URL}/api/events/past/`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-cache',
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
        }

        const data = await res.json();
        console.log("Past Events API Response:", data);

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
            is_finished: event.is_finished || true,
            created_at: event.created_at,
            speakers: event.event_speakers || [],
            image: event.photos && event.photos.length > 0
                ? event.photos[0]
                : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
            num_attendees: event.num_attendees || 0,
            status: "Past"
          }));

          setPastEvents(transformedEvents.slice(0, 3));
          setUsingFallback(false);
          setApiError(null);
        } else {
          console.log("No past events found in API, using fallback data");
          setPastEvents(FALLBACK_PAST_EVENTS);
          setUsingFallback(true);
          setApiError("No past events available from server");
        }
      } catch (err: any) {
        console.error("Error fetching past events:", err);
        setApiError(err.message || "Failed to connect to server");
        setPastEvents(FALLBACK_PAST_EVENTS);
        setUsingFallback(true);
      } finally {
        setLoadingPast(false);
      }
    };

    fetchPastEvents();
  }, []);

  // Fetch upcoming events from API
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        console.log("Fetching upcoming events...");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`${NODE_API_URL}/api/events/upcoming/`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-cache',
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
        }

        const data = await res.json();
        console.log("Upcoming API Response:", data);

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
            is_finished: event.is_finished || false,
            created_at: event.created_at,
            speakers: event.event_speakers || [],
            image: event.photos && event.photos.length > 0
                ? event.photos[0]
                : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
            num_attendees: event.num_attendees || 0,
            status: "Upcoming",
            mode: event.type === "online" ? "Online" : "In Person",
            price: 0,
            speaker: event.event_speakers?.[0]?.name || "TBD",
            attendees: event.num_attendees || 0,
            time: formatTime(event.date)
          }));

          setUpcomingEvents(transformedEvents.slice(0, 3));
        } else {
          console.log("No upcoming events found in API");
          setUpcomingEvents([]);
        }
      } catch (err: any) {
        console.error("Error fetching upcoming events:", err);
        setUpcomingEvents([]);
      } finally {
        setLoadingUpcoming(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  const heroText = "Experience the Extraordinary.".split(" ");

  return (
      <PageTransition className="pt-16 sm:pt-20">
        {/* Hero Section - Optimized for mobile */}
        <section
            className="relative min-h-[80vh] sm:min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
          {/* Simple Blurred Background Image */}
          <div className="absolute inset-0 z-0">
            <img
                src="/images/image.jpeg"
                alt="Hero Background"
                className="w-full h-full object-cover"
            />
            {/* Single blur layer */}
            <div className="absolute inset-0 backdrop-blur-xs bg-black/40"/>
          </div>

          {/* Background Orbs - Smaller on mobile */}
          <div
              className="absolute top-1/4 left-1/4 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-[50px] sm:blur-[100px] opacity-70 animate-float"/>
          <div
              className="absolute top-1/3 right-1/4 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-accent/30 rounded-full mix-blend-multiply filter blur-[50px] sm:blur-[100px] opacity-70 animate-float-delayed"/>
          <div
              className="absolute bottom-1/4 left-1/2 w-40 sm:w-64 md:w-80 h-40 sm:h-64 md:h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-[40px] sm:blur-[80px] opacity-50 animate-float"
              style={{animationDelay: '4s'}}/>

          {/* Content - Mobile optimized */}
          <div
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center flex flex-col items-center pt-12 sm:pt-20">
            <motion.div
                initial={{opacity: 0, scale: 0.8}}
                animate={{opacity: 1, scale: 1}}
                transition={{type: "spring", bounce: 0.5}}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-panel mb-4 sm:mb-8 border border-red-500/30 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            >
              <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-red-500"></span>
              </span>
              <span
                  className="text-xs sm:text-sm font-bold text-foreground">Live Now: {upcomingEvents.length} Events</span>
            </motion.div>

            <div className="mb-4 sm:mb-6 flex flex-wrap justify-center gap-x-2 sm:gap-x-4 max-w-4xl px-2 sm:px-0">
              {heroText.map((word, i) => (
                  <motion.span
                      key={i}
                      initial={{opacity: 0, y: 40}}
                      animate={{opacity: 1, y: 0}}
                      transition={{delay: i * 0.15, duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9]}}
                      className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-display font-extrabold leading-tight tracking-tight ${
                          word === 'Extraordinary.' ? 'text-gradient' : 'text-white'
                      }`}
                  >
                    {word}
                  </motion.span>
              ))}
            </div>

            <motion.p
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.6, duration: 0.8}}
                className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-8 sm:mb-12 max-w-2xl leading-relaxed mx-auto font-medium px-4 sm:px-0"
            >
              Voltra is the premium platform connecting visionaries, creators, and attendees. Discover curated tech
              summits, exclusive art shows, and global music festivals.
            </motion.p>

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.8, duration: 0.8}}
                className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center w-full max-w-xs sm:max-w-md px-4 sm:px-0"
            >
              <Link href="/events"
                    className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white text-black font-bold text-sm sm:text-lg flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 hover:scale-105">
                <div
                    className="absolute -inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary via-accent to-primary opacity-50 blur-md group-hover:opacity-100 group-hover:duration-200 animate-gradient"/>
                <div className="relative flex items-center gap-1.5 sm:gap-2">
                  Explore Events <ArrowRight
                    className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform"/>
                </div>
              </Link>

            </motion.div>
          </div>
        </section>

        {/* About Section - Mobile optimized */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Column - Content */}
              <motion.div
                  initial={{opacity: 0, x: -30}}
                  whileInView={{opacity: 1, x: 0}}
                  viewport={{once: true}}
                  transition={{duration: 0.6}}
                  className="order-2 lg:order-1"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4 sm:mb-6">
                  We're on a Mission to{' '}
                  <span className="text-gradient">Transform Events</span>
                </h2>

                <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                  Voltra was born from a simple idea: events should be extraordinary. Founded in 2025, we've grown from
                  a small team of passionate event enthusiasts to a global platform connecting creators with audiences
                  worldwide.
                </p>

                <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-xl bg-primary/10">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary"/>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg sm:text-xl">500+</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Events Hosted</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-xl bg-accent/10">
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-accent"/>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg sm:text-xl">50k+</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Happy Attendees</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-xl bg-purple-500/10">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500"/>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg sm:text-xl">120+</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Cities Worldwide</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-xl bg-orange-500/10">
                      <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500"/>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg sm:text-xl">24/7</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Support</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Image/Video Placeholder */}
              <motion.div
                  initial={{opacity: 0, x: 30}}
                  whileInView={{opacity: 1, x: 0}}
                  viewport={{once: true}}
                  transition={{duration: 0.6, delay: 0.2}}
                  className="relative order-1 lg:order-2"
              >
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 mix-blend-overlay"/>
                  <img
                      src="/images/image2.jpeg"
                      alt="About Voltra"
                      className="w-full h-auto rounded-2xl sm:rounded-3xl"
                  />

                  {/* Stats Overlay */}
                  <div
                      className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 glass-panel p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-md">
                    <div className="flex justify-around">
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold text-white">4.9</div>
                        <div className="text-[10px] sm:text-xs text-white/80">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold text-white">150+</div>
                        <div className="text-[10px] sm:text-xs text-white/80">Partners</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold text-white">98%</div>
                        <div className="text-[10px] sm:text-xs text-white/80">Satisfaction</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div
                    className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-16 sm:w-24 h-16 sm:h-24 bg-primary/20 rounded-full blur-xl sm:blur-2xl"/>
                <div
                    className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 w-20 sm:w-32 h-20 sm:h-32 bg-accent/20 rounded-full blur-xl sm:blur-2xl"/>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team Slider Section - Mobile optimized */}
        <section className="py-12 sm:py-16 md:py-20 bg-secondary/30 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-2 sm:mb-4">
                Meet Our Team
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                The brilliant minds behind Voltra, working tirelessly to bring you the best events.
              </p>
            </div>

            <div className="relative">
              {/* Slider Controls - Hidden on mobile, visible from sm up */}
              <button
                  onClick={prevSlide}
                  className="hidden sm:flex absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={currentIndex === 0}
                  aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5"/>
              </button>

              <button
                  onClick={nextSlide}
                  className="hidden sm:flex absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={currentIndex >= TEAM_MEMBERS.length - slidesToShow}
                  aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5"/>
              </button>

              {/* Slider Container */}
              <div className="relative">
                <div
                    ref={sliderRef}
                    className="overflow-hidden px-0"
                    style={{WebkitOverflowScrolling: 'touch'}}
                >
                  <motion.div
                      className="flex"
                      animate={{x: `-${currentIndex * 100}%`}}
                      transition={{type: "spring", stiffness: 300, damping: 30}}
                  >
                    {TEAM_MEMBERS.map((member) => (
                        <motion.div
                            key={member.id}
                            className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-1 sm:px-2"
                            style={{
                              width: typeof window !== 'undefined' && window.innerWidth < 640
                                  ? '100%'
                                  : undefined
                            }}
                            whileHover={{y: -4}}
                            transition={{type: "spring", stiffness: 300}}
                        >
                          <div
                              className="glass-card p-5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl text-center group h-full flex flex-col w-full">
                            {/* Avatar with glow effect */}
                            <div className="relative mb-4 sm:mb-4 mx-auto">
                              <div
                                  className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"
                                  style={{width: '100%', height: '100%'}}/>
                              <div
                                  className="relative w-24 h-24 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mx-auto">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover rounded-full border-3 sm:border-3 md:border-4 border-white/20"
                                    loading="lazy"
                                />
                              </div>
                            </div>

                            {/* Member info */}
                            <div className="flex-1">
                              <h3 className="font-bold text-lg sm:text-lg md:text-xl mb-1">
                                {member.name}
                              </h3>
                              <p className="text-sm sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-4 md:mb-5">
                                {member.role}
                              </p>
                            </div>

                            {/* Social links */}
                            <div className="flex items-center justify-center gap-4 sm:gap-4 mt-auto">
                              <a
                                  href={member.social.twitter}
                                  className="p-2.5 sm:p-2.5 md:p-3 rounded-full bg-secondary/50 hover:bg-secondary/80 hover:text-primary transition-all hover:scale-110"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`${member.name}'s Twitter`}
                              >
                                <Twitter className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5"/>
                              </a>
                              <a
                                  href={member.social.linkedin}
                                  className="p-2.5 sm:p-2.5 md:p-3 rounded-full bg-secondary/50 hover:bg-secondary/80 hover:text-primary transition-all hover:scale-110"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`${member.name}'s LinkedIn`}
                              >
                                <Linkedin className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5"/>
                              </a>
                              <a
                                  href={member.social.github}
                                  className="p-2.5 sm:p-2.5 md:p-3 rounded-full bg-secondary/50 hover:bg-secondary/80 hover:text-primary transition-all hover:scale-110"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`${member.name}'s GitHub`}
                              >
                                <Github className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5"/>
                              </a>
                            </div>
                          </div>
                        </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Mobile Swipe Hint - Only visible on mobile */}
              <div className="sm:hidden flex justify-center mt-6">
                <div
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                  <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground"/>
                  <span className="text-xs text-muted-foreground font-medium">Swipe to browse team</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground"/>
                </div>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 md:mt-10">
                {Array.from({length: Math.ceil(TEAM_MEMBERS.length / slidesToShow)}).map((_, idx) => {
                  const isActive = Math.floor(currentIndex / slidesToShow) === idx;
                  return (
                      <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx * slidesToShow)}
                          className={`rounded-full transition-all duration-300 ${
                              isActive
                                  ? 'w-8 sm:w-10 bg-primary h-2 sm:h-2.5'
                                  : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-secondary hover:bg-primary/50'
                          }`}
                          aria-label={`Go to slide group ${idx + 1}`}
                      />
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Events - Mobile optimized */}
        <section className="py-20 sm:py-32 bg-background relative border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 sm:mb-16">
              <div className="px-4 sm:px-0">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-2 sm:mb-4">Trending
                  Upcoming</h2>
                <p className="text-base sm:text-xl text-muted-foreground font-medium">Secure your spot at the most
                  anticipated events.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
              <div
                  className="absolute -inset-4 bg-gradient-to-b from-transparent via-accent/5 to-transparent blur-2xl -z-10"/>
              {loadingUpcoming ? (
                  <div className="col-span-3 text-center py-8 sm:py-12">
                    <div
                        className="inline-block h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
                    <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">Loading upcoming
                      events...</p>
                  </div>
              ) : upcomingEvents.length === 0 ? (
                  <div className="col-span-3 text-center py-8 sm:py-12">
                    <p className="text-sm sm:text-base text-muted-foreground">No upcoming events found.</p>
                  </div>
              ) : (
                  upcomingEvents.map((event, i) => (
                      <motion.div
                          key={event.id}
                          initial={{opacity: 0, y: 30}}
                          whileInView={{opacity: 1, y: 0}}
                          viewport={{once: true}}
                          transition={{delay: i * 0.15, duration: 0.5}}
                          className="h-full"
                      >
                        <EventCard event={event}/>
                      </motion.div>
                  ))
              )}
            </div>
          </div>
        </section>

        {/* Past Events - Mobile optimized */}
        <section className="py-16 sm:py-24 bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4">Relive the Magic</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
                Catch up on what you missed. Watch recordings and view galleries from our most iconic past events.
              </p>
              {apiError && (
                  <div
                      className="mt-3 sm:mt-4 p-2 sm:p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg inline-block mx-4 sm:mx-0">
                    <p className="text-xs sm:text-sm text-amber-500">
                      ⚠️ Using sample events - {apiError}
                    </p>
                  </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
              {loadingPast ? (
                  <div className="text-center text-muted-foreground col-span-3 py-8 sm:py-12">
                    <div
                        className="inline-block h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
                    <p className="mt-3 sm:mt-4 text-sm sm:text-base">Loading past events...</p>
                  </div>
              ) : pastEvents.length === 0 ? (
                  <div className="text-center text-muted-foreground col-span-3 py-8 sm:py-12">
                    <p className="text-sm sm:text-base">No past events found.</p>
                  </div>
              ) : (
                  pastEvents.map((event, i) => (
                      <motion.div
                          key={event.id}
                          initial={{opacity: 0, scale: 0.95}}
                          whileInView={{opacity: 1, scale: 1}}
                          viewport={{once: true}}
                          transition={{delay: i * 0.1}}
                          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-2xl"
                      >
                        {/* Image Section */}
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
                            <div
                                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"/>

                            {/* Event Type Badge */}
                            <span
                                className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full bg-white/20 text-white backdrop-blur-md">
                              {event.type === "online" ? "🖥️ Online" : "📍 In Person"}
                            </span>

                            {/* Category Badge */}
                            <span
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full bg-accent/80 text-white backdrop-blur-md">
                              {event.category?.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Content Section */}
                          <div className="p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 line-clamp-1">{event.title}</h3>

                            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                              {event.description || "No description available"}
                            </p>

                            {/* Event Details Grid */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs sm:text-sm">
                              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-accent flex-shrink-0"/>
                                <span className="truncate">{event.city}</span>
                              </div>

                              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-accent flex-shrink-0"/>
                                <span className="truncate">{event.num_attendees || 0}</span>
                              </div>

                              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-accent flex-shrink-0"/>
                                <span className="truncate">{new Date(event.date).toLocaleDateString()}</span>
                              </div>

                              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                                <Target className="w-3 h-3 sm:w-4 sm:h-4 text-accent flex-shrink-0"/>
                                <span className="truncate">{event.target_audience || "All"}</span>
                              </div>
                            </div>

                            {/* Speakers Section */}
                            {event.speakers && event.speakers.length > 0 && (
                                <div className="mb-3 sm:mb-4">
                                  <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2">Speakers</p>
                                  <div className="flex flex-wrap gap-1 sm:gap-2">
                                    {event.speakers.map((speaker: any, idx: number) => (
                                        <div key={idx}
                                             className="flex items-center gap-0.5 sm:gap-1 bg-secondary/50 rounded-full px-2 sm:px-3 py-0.5 sm:py-1">
                                          <span
                                              className="text-[10px] sm:text-xs font-medium truncate max-w-[60px] sm:max-w-none">{speaker.name}</span>
                                          <span
                                              className="text-[8px] sm:text-[10px] text-muted-foreground truncate max-w-[40px] sm:max-w-none">• {speaker.position}</span>
                                        </div>
                                    ))}
                                  </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
                              <Link
                                  href={`/events/${event.id}`}
                                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-accent text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 hover:bg-accent/90 transition-colors"
                              >
                                View Details <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4"/>
                              </Link>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                  ))
              )}
            </div>

            {pastEvents.length > 0 && !usingFallback && (
                <div className="text-center mt-8 sm:mt-12">
                  <Link href="/events?filter=past"
                        className="inline-flex items-center gap-1 sm:gap-2 text-accent font-bold text-sm sm:text-base hover:underline">
                    View All Events <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4"/>
                  </Link>
                </div>
            )}
          </div>
        </section>
      </PageTransition>
  );
}