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
      case "Past": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getTypeColor = (type: Event["type"]) => {
    // All types now use accent color
    return "from-accent/20 to-accent/20 text-accent";
  };

  const getTypeGradient = (type: Event["type"]) => {
    // All types now use accent color
    return "from-accent to-accent";
  };

  const getTypeTextColor = (type: Event["type"]) => {
    // All types now use accent color
    return "text-accent";
  };

  const isLive = event.status === "Live";

  return (
      <div className="group relative h-full">
        {/* Animated gradient background */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700" />

        {/* Main card */}
        <div className="relative h-full rounded-3xl overflow-hidden transition-all duration-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-accent/50 dark:hover:border-accent/50 hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/20 dark:hover:shadow-2xl dark:hover:shadow-accent/20">

          {/* Animated overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-accent/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Image Section */}
          <div className="relative h-56 overflow-hidden">
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-gray-900 dark:via-gray-900/80 dark:to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 dark:from-black/30 dark:via-transparent dark:to-black/60 z-10" />

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
            <span className={cn("px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm shadow-sm", getStatusColor(event.status))}>
              {event.status}
            </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30 shadow-sm text-accent">
              {event.type}
            </span>
            </div>

            {/* Price tag with glass effect */}
            <div className="absolute top-4 right-4 z-20">
              <div className="px-3 py-1 text-xs font-bold rounded-full bg-white/90 dark:bg-black/60 text-gray-900 dark:text-white backdrop-blur-sm border border-gray-200 dark:border-gray-700 flex items-center gap-1 shadow-md group-hover:scale-105 transition-transform">
                {event.price === 0 ? (
                    <span className="flex items-center gap-1">
                  <Ticket className="w-3 h-3 text-accent" />
                  FREE
                </span>
                ) : (
                    <span className="flex items-baseline gap-0.5">
                  <span className="text-[10px] text-accent">$</span>
                  <span>{event.price}</span>
                </span>
                )}
              </div>
            </div>

            {/* Mode badge with glass effect */}

          </div>

          {/* Content Section */}
          <div className="p-6 relative z-10 bg-white dark:bg-gray-900">
            {/* Date and Location */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 bg-accent/5 dark:bg-accent/10 px-2.5 py-1 rounded-full">
                <Calendar className="w-3 h-3 text-accent" />
                {format(new Date(event.date), "MMM dd, yyyy")}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 bg-accent/5 dark:bg-accent/10 px-2.5 py-1 rounded-full">
                <MapPin className="w-3 h-3 text-accent" />
                {event.city}
              </div>
            </div>

            {/* Title */}
            <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-accent transition-colors">
              {event.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
              {event.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
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

              {/* View button - clean and simple */}
              <Link
                  href={`/events/${event.id}`}
                  className="group/btn"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 hover:border-accent transition-all duration-300">
                  <span className="text-xs font-medium">View Details</span>
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