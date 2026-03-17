import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useTheme } from "@/hooks/use-theme";

import Home from "@/pages/Home";
import Events from "@/pages/Events";
import EventDetails from "@/pages/EventDetails";
import CalendarView from "@/pages/Calendar";
import Gallery from "@/pages/Gallery";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/dashboard.tsx"; // Import the Dashboard page
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPasswordt";
import { UserProvider } from "@/usercontext";

function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                <p className="text-xl text-muted-foreground mb-8">Page not found</p>
                <a href="/" className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                    Go Home
                </a>
            </div>
        </div>
    );
}

function AnimatedRouter() {
    const [location] = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Switch location={location} key={location}>
                <Route path="/" component={Home} />
                <Route path="/events" component={Events} />
                <Route path="/events/:id" component={EventDetails} />
                <Route path="/calendar" component={CalendarView} />
                <Route path="/gallery" component={Gallery} />
                <Route path="/profile" component={Profile} />
                <Route path="/dashboard" component={Dashboard} /> {/* Add dashboard route */}
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/forgot-password" component={ForgotPassword} />
                <Route path="/reset-password" component={ResetPassword} />
                <Route component={NotFound} />
            </Switch>
        </AnimatePresence>
    );
}

function MainLayout({ children }: { children: React.ReactNode }) {
    const [location] = useLocation();
    const isAuthPage = location === "/login" ||
        location === "/register" ||
        location === "/forgot-password" ||
        location.startsWith("/reset-password");

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            {!isAuthPage && <Navbar />}
            <main className="flex-grow flex flex-col relative z-0">{children}</main>
            {!isAuthPage && <Footer />}
        </div>
    );
}

function AppInner() {
    useTheme();
    return (
        <WouterRouter>
            <MainLayout>
                <AnimatedRouter />
            </MainLayout>
        </WouterRouter>
    );
}

export default function App() {
    return (
        <UserProvider>
            <AppInner />
        </UserProvider>
    );
}