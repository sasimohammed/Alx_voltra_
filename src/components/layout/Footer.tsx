import { Link } from "wouter";
import { Sparkles, Twitter, Instagram, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-2 group mb-6 inline-block">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-accent/20">
                  <Sparkles className="text-white w-5 h-5" />
                </div>
                <span className="font-display font-bold text-2xl tracking-tight text-foreground">
                  Voltra<span className="text-accent">.</span>
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground text-lg mb-8 max-w-sm leading-relaxed">
              The premium platform for discovering, managing, and experiencing extraordinary events worldwide.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors duration-300"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors duration-300"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors duration-300"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors duration-300"><Github className="w-5 h-5" /></a>
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-7">
            <h3 className="font-bold text-foreground mb-6">Platform</h3>
            <ul className="space-y-4">
              <li><Link href="/events" className="text-muted-foreground hover:text-accent transition-colors font-medium">Browse Events</Link></li>
              <li><Link href="/calendar" className="text-muted-foreground hover:text-accent transition-colors font-medium">Calendar</Link></li>
              <li><Link href="/gallery" className="text-muted-foreground hover:text-accent transition-colors font-medium">Gallery</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors font-medium">Pricing</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-bold text-foreground mb-6">Resources</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors font-medium">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors font-medium">Event Guides</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors font-medium">Community</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors font-medium">Blog</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-bold text-foreground mb-6">Company</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors font-medium">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors font-medium">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors font-medium">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors font-medium">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground font-medium">
            © {new Date().getFullYear()} Voltra Platform. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-muted-foreground font-medium flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span> Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
