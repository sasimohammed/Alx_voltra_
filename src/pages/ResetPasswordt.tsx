import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, ArrowRight, CheckCircle, X, AlertCircle, Eye, EyeOff } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useForm } from "react-hook-form";

type ResetPasswordData = {
    new_password: string;
    re_new_password: string;
};

export default function ResetPassword() {
    const [, setLocation] = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Get token from URL (you'll need to parse the URL)
    const [searchParams] = useState(new URLSearchParams(window.location.search));
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');

    const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordData>();
    const newPassword = watch('new_password');

    useEffect(() => {
        // Redirect if no uid/token
        if (!uid || !token) {
            setError("Invalid password reset link. Please request a new one.");
        }
    }, [uid, token]);

    const onSubmit = async (data: ResetPasswordData) => {
        if (!uid || !token) {
            setError("Invalid reset link");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // This is the set_password endpoint you mentioned
            const res = await fetch("https://django-kf3s.vercel.app/api/auth/users/set_password/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid,
                    token,
                    new_password: data.new_password,
                    re_new_password: data.re_new_password
                })
            });

            const result = await res.json();
            console.log(result);

            if (res.ok) {
                setIsSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    setLocation("/login");
                }, 3000);
            } else {
                // Handle different error formats
                if (result.new_password) {
                    setError(result.new_password[0]);
                } else if (result.token) {
                    setError("Reset link has expired. Please request a new one.");
                } else if (result.uid) {
                    setError("Invalid user. Please request a new reset link.");
                } else {
                    setError("Failed to reset password. Please try again.");
                }
            }
        } catch (err) {
            setError("Network error. Please check your connection.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageTransition className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Success Modal */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
                    >
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
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Password Reset Successful! 🎉
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                            Your password has been successfully reset.
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
                                            <span>Redirecting to login...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-accent/20 mb-6 group cursor-pointer hover:scale-105 transition-transform">
                        <Sparkles className="text-white w-7 h-7" />
                    </Link>
                    <h1 className="text-3xl font-display font-bold text-foreground mb-2">Set New Password</h1>
                    <p className="text-muted-foreground">Enter your new password below</p>
                </div>

                <div className="glass-panel p-8 rounded-3xl shadow-2xl">
                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    {...register("new_password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 8,
                                            message: "Password must be at least 8 characters"
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                            message: "Must contain uppercase, lowercase and number"
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
                            {errors.new_password && (
                                <span className="text-red-500 text-sm mt-1">{errors.new_password.message}</span>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    {...register("re_new_password", {
                                        required: "Please confirm your password",
                                        validate: value => value === newPassword || "Passwords do not match"
                                    })}
                                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.re_new_password && (
                                <span className="text-red-500 text-sm mt-1">{errors.re_new_password.message}</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !uid || !token}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 mt-4"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Reset Password <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-sm text-accent hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}