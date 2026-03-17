import { Link } from "wouter";
import { format } from "date-fns";
import { MapPin, Calendar, Users, Ticket, ArrowRight, Sparkles, Clock } from "lucide-react";
import { Event } from "@/data/events";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "Live": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Upcoming": return "bg-accent/10 text-accent border-accent/20";
      case "Past": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getTypeColor = (type: Event["type"]) => {
    const colors = {
      Tech: "from-blue-500/20 to-cyan-500/20 text-cyan-600 dark:text-cyan-400",
      Music: "from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400",
      Art: "from-orange-500/20 to-red-500/20 text-orange-600 dark:text-orange-400",
      Business: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400",
      Sports: "from-yellow-500/20 to-amber-500/20 text-yellow-600 dark:text-yellow-400",
    };
    return colors[type] || "from-gray-500/20 to-gray-500/20 text-gray-600 dark:text-gray-400";
  };

  const getTypeGradient = (type: Event["type"]) => {
    const gradients = {
      Tech: "from-blue-500 to-cyan-500",
      Music: "from-purple-500 to-pink-500",
      Art: "from-orange-500 to-red-500",
      Business: "from-emerald-500 to-teal-500",
      Sports: "from-yellow-500 to-amber-500",
    };
    return gradients[type] || "from-gray-500 to-gray-500";
  };

  const getTypeTextColor = (type: Event["type"]) => {
    const colors = {
      Tech: "text-cyan-400",
      Music: "text-purple-400",
      Art: "text-orange-400",
      Business: "text-emerald-400",
      Sports: "text-yellow-400",
    };
    return colors[type] || "text-gray-400";
  };

  const isLive = event.status === "Live";

  return (
      <div className="group relative h-full">
        {/* Animated gradient background */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700" />

        {/* Main card */}
        <div className="relative h-full rounded-3xl overflow-hidden transition-all duration-500 bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 hover:border-white/20 hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/20">

          {/* Animated overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Image Section */}
          <div className="relative h-56 overflow-hidden">
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 z-10" />

            <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
            />

            {/* Live indicator with pulse */}
            {isLive && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-md animate-ping" />
                    <div className="relative w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                </div>
            )}

            {/* Top badges container */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
            <span className={cn("px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md shadow-lg", getStatusColor(event.status))}>
              {event.status}
            </span>
              <span className={cn("px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r backdrop-blur-md border border-white/10 shadow-lg", getTypeColor(event.type))}>
              {event.type}
            </span>
            </div>

            {/* Price tag with glass effect */}
            <div className="absolute top-4 right-4 z-20">
              <div className="px-3 py-1 text-xs font-bold rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 flex items-center gap-1 shadow-xl group-hover:scale-105 transition-transform">
                {event.price === 0 ? (
                    <span className="flex items-center gap-1">
                  <Ticket className="w-3 h-3" />
                  FREE
                </span>
                ) : (
                    <span className="flex items-baseline gap-0.5">
                  <span className="text-[10px] text-gray-400">$</span>
                  <span>{event.price}</span>
                </span>
                )}
              </div>
            </div>

            {/* Mode badge with glass effect */}
            <div className="absolute bottom-4 left-4 z-20">
            <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-black/50 text-white backdrop-blur-md border border-white/10 shadow-lg group-hover:bg-black/70 transition-colors">
              {event.mode}
            </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 relative z-10 bg-gradient-to-b from-gray-900/50 to-gray-950/50">
            {/* Date and Location */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full backdrop-blur-sm">
                <Calendar className="w-3 h-3 text-accent" />
                {format(new Date(event.date), "MMM dd, yyyy")}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full backdrop-blur-sm">
                <MapPin className="w-3 h-3 text-primary" />
                {event.city}
              </div>
            </div>

            {/* Title */}
            <h3 className="font-display font-bold text-xl text-white mb-2 line-clamp-1 group-hover:text-accent transition-colors">
              {event.title}
            </h3>

            {/* Description */}
            <p className="text-gray-400 text-sm line-clamp-2 mb-4">
              {event.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {/* Event type indicator with gradient line */}
              <div className="flex items-center gap-2">
                <div className={cn(
                    "w-1 h-8 rounded-full bg-gradient-to-b",
                    getTypeGradient(event.type),
                    "to-transparent"
                )} />
                <span className={cn("text-xs font-medium", getTypeTextColor(event.type))}>
                {event.type}
              </span>
              </div>

              {/* View button with arrow animation */}
              <Link
                  href={`/events/${event.id}`}
                  className="relative group/btn"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-blue-500 rounded-full blur-lg opacity-0 group-hover/btn:opacity-50 transition-opacity" />
                <div className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-accent text-white border border-white/10 hover:border-accent/50 transition-all duration-300">
                  <span className="text-xs font-medium">View</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-0.5 h-8 bg-gradient-to-b from-accent to-transparent group-hover:h-16 transition-all duration-700" />
            <div className="absolute top-0 left-0 w-8 h-0.5 bg-gradient-to-r from-accent to-transparent group-hover:w-16 transition-all duration-700" />
          </div>
          <div className="absolute bottom-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
            <div className="absolute bottom-0 right-0 w-0.5 h-8 bg-gradient-to-t from-accent to-transparent group-hover:h-16 transition-all duration-700" />
            <div className="absolute bottom-0 right-0 w-8 h-0.5 bg-gradient-to-l from-accent to-transparent group-hover:w-16 transition-all duration-700" />
          </div>
        </div>
      </div>
  );
}