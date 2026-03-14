import { useState } from "react";
import { useUser } from "@/usercontext";
import { motion } from "framer-motion";
import { Mail, CheckCircle, AlertCircle, Send } from "lucide-react";

export default function ForgotPassword() {
    const { token } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("https://django-kf3s.vercel.app/api/auth/users/set_password/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` })
                },
                body: JSON.stringify({ email })
            });

            const result = await res.json();
            console.log(result);

            if (res.ok) {
                setSuccess(true);
                setEmail("");
                setTimeout(() => setSuccess(false), 5000);
            } else {
                setError(result.email?.[0] || result.non_field_errors?.[0] || "Failed to send reset link");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Reset Password
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Enter your email to receive a password reset link
                    </p>
                </div>

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-3"
                    >
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Reset link sent!</p>
                            <p className="text-sm">Check your email for instructions to reset your password.</p>
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                                placeholder="you@example.com"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            We'll send a password reset link to this email
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !email}
                        className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Send Reset Link
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a
                        href="/login"
                        className="text-sm text-primary hover:text-accent transition-colors"
                    >
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
}