import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Sparkles, Mail, Lock, User, MapPin, ArrowRight, CheckCircle, X, Eye, EyeOff, Linkedin, Target } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useForm } from "react-hook-form";

type FormData = {
    fullName: string;
    email: string;
    password: string;
    city: string;
    phone_no: string;
    user_status: "guest" | "alumni" | "learner" | "city_team" | "voltra_team";
    track: string;
    linked_profile?: string;
};

export default function Register() {
    const [, setLocation] = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);

        try {
            const res = await fetch("https://django-kf3s.vercel.app/api/auth/users/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await res.json();
            console.log(result);

            if (res.ok) {
                setRegisteredEmail(data.email);
                setShowSuccess(true);
                // Scroll to top to show the success message
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Optional: Auto-hide after 8 seconds
                setTimeout(() => {
                    setShowSuccess(false);
                    setLocation("/login");
                }, 8000);
            } else {
                alert(JSON.stringify(result, null, 2)); // show errors
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageTransition className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background py-20">
            {/* Success Toast/Modal */}
            {showSuccess && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md animate-in slide-in-from-top fade-in duration-500">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-green-500/20 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1" />
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Registration Successful!
                                        </h3>
                                        <button
                                            onClick={() => setShowSuccess(false)}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="mt-2 space-y-3">
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            We've sent an activation link to:
                                        </p>
                                        <p className="text-sm font-medium text-accent bg-accent/10 px-3 py-2 rounded-lg inline-block">
                                            {registeredEmail}
                                        </p>
                                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-start gap-3">
                                                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                                <div className="space-y-2">
                                                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                                        Check your inbox and spam folder
                                                    </p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-300">
                                                        Click the activation link in the email to verify your account.
                                                        You'll be redirected to login automatically.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                            Redirecting to login in 8 seconds...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing background effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-xl relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-accent/20 mb-6 group cursor-pointer hover:scale-105 transition-transform">
                        <Sparkles className="text-white w-7 h-7" />
                    </Link>
                    <h1 className="text-3xl font-display font-bold text-foreground mb-2">Create an Account</h1>
                    <p className="text-muted-foreground">Join Voltra to discover and manage extraordinary events</p>
                </div>

                <div className="glass-panel p-8 rounded-3xl shadow-2xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        {...register("fullName", { required: "Full name is required" })}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                                {errors.fullName && <span className="text-red-500 text-sm">{errors.fullName.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">City</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="New York"
                                        {...register("city", { required: "City is required" })}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                                {errors.city && <span className="text-red-500 text-sm">{errors.city.message}</span>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 8,
                                            message: "Password must be at least 8 characters"
                                        }
                                    })}
                                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Phone Number</label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    placeholder="+201234567890"
                                    {...register("phone_no", {
                                        required: "Phone number is required",
                                        pattern: {
                                            value: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{3,4}$/,
                                            message: "Invalid phone number"
                                        }
                                    })}
                                    className="w-full pl-4 pr-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            {errors.phone_no && <span className="text-red-500 text-sm">{errors.phone_no.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">User Status</label>
                            <select
                                {...register("user_status", { required: "User status is required" })}
                                className="w-full pl-4 pr-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                            >
                                <option value="">Select Status</option>
                                <option value="guest">Guest</option>
                                <option value="alumni">Alumni</option>
                                <option value="learner">Learner</option>
                                <option value="city_team">City Team</option>
                                <option value="voltra_team">Voltra Team</option>
                            </select>
                            {errors.user_status && <span className="text-red-500 text-sm">{errors.user_status.message}</span>}
                        </div>

                        {/* Track Field - Required - Now as Text Input */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                Track <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="e.g., Frontend Development, Data Science, UI/UX Design"
                                    {...register("track", {
                                        required: "Track is required",
                                        minLength: {
                                            value: 2,
                                            message: "Track must be at least 2 characters"
                                        }
                                    })}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            {errors.track && <span className="text-red-500 text-sm">{errors.track.message}</span>}
                            <p className="text-xs text-muted-foreground mt-1">
                                Enter your learning or professional track (e.g., Frontend, Backend, Data Science, etc.)
                            </p>
                        </div>

                        {/* Linked Profile Field - Optional */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                LinkedIn Profile (Optional)
                            </label>
                            <div className="relative">
                                <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="url"
                                    placeholder="https://linkedin.com/in/username"
                                    {...register("linked_profile", {
                                        pattern: {
                                            value: /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company|school)\/.+$/i,
                                            message: "Please enter a valid LinkedIn profile URL"
                                        }
                                    })}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            {errors.linked_profile && <span className="text-red-500 text-sm">{errors.linked_profile.message}</span>}
                            <p className="text-xs text-muted-foreground mt-1">
                                Add your LinkedIn profile to connect with professionals
                            </p>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-start gap-3">
                                <input type="checkbox" required className="mt-1 rounded text-primary focus:ring-primary" />
                                <span className="text-sm text-muted-foreground">
                                    I agree to the <a href="#" className="text-accent hover:underline">Terms of Service</a> and <a href="#" className="text-accent hover:underline">Privacy Policy</a>
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || showSuccess}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 mt-4"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Create Account <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-foreground hover:text-accent transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}