import { Link } from "wouter";
import { format } from "date-fns";
import { MapPin, Calendar, Users, Ticket, ArrowRight } from "lucide-react";
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
    return colors[type];
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden group flex flex-col h-full hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(72,200,185,0.15)] dark:hover:shadow-[0_8px_30px_rgba(72,200,185,0.1)] transition-all duration-300 relative border border-border/50">
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20 group-hover:from-black/40 transition-colors z-10" />
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-2"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <span className={cn("px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md", getStatusColor(event.status))}>
            {event.status}
          </span>
          <span className={cn("px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r backdrop-blur-md border border-white/10 dark:border-white/5", getTypeColor(event.type))}>
            {event.type}
          </span>
        </div>
        <div className="absolute top-4 right-4 z-20">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 flex items-center gap-1 shadow-lg">
            {event.price === 0 ? "Free" : `$${event.price}`}
          </span>
        </div>
        <div className="absolute bottom-4 right-4 z-20">
          <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-black/50 text-white backdrop-blur-md border border-white/10">
            {event.mode}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow bg-card/50">
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 font-medium">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-accent" />
            {format(new Date(event.date), "MMM dd, yyyy")}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {event.city}
          </span>
        </div>

        <h3 className="font-display font-bold text-xl text-foreground mb-2 line-clamp-1 group-hover:text-accent transition-colors">
          {event.title}
        </h3>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-grow">
          {event.description}
        </p>

        <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Users className="w-4 h-4 text-muted-foreground" />
              {event.attendees.toLocaleString()}
            </span>
          </div>
          
          <Link
            href={`/events/${event.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary hover:bg-accent hover:text-white text-foreground transition-all duration-300 group/btn"
          >
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
