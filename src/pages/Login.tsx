import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Sparkles, Mail, Lock, ArrowRight, CheckCircle, X, Eye, EyeOff } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useForm } from "react-hook-form";
import { useUser } from "@/usercontext";

type LoginFormData = { email: string; password: string };

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useUser();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  // Function to fetch user account details after login
  const fetchUserAccount = async (token: string) => {
    try {
      const response = await fetch("https://django-kf3s.vercel.app/api/account/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log({token});

      if (!response.ok) {
        throw new Error("Failed to fetch account details");
      }

      const accountData = await response.json();
      console.log("Account data:", accountData);
      return accountData;
    } catch (error) {
      console.error("Error fetching account:", error);
      return null;
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("https://django-kf3s.vercel.app/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log(result);

      if (res.ok) {
        // Fetch user account details to get role
        const accountData = await fetchUserAccount(result.access);

        const userData = {
          name: accountData?.username || result.user?.fullName || data.email.split("@")[0],
          email: data.email,
          role: accountData?.role || "user", // Store role in user context
          id: accountData?.id,
        };

        const tokenObj = { access: result.access, refresh: result.refresh };
        setUser(userData, tokenObj);

        setShowSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Redirect based on role
        setTimeout(() => {
          if (accountData?.role === "admin") {
            setLocation("/dashboard");
          } else {
            setLocation("/profile");
          }
        }, 2000);
      } else {
        alert(JSON.stringify(result, null, 2));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <PageTransition className="min-h-screen flex  items-center justify-center p-4 relative overflow-hidden bg-background">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Success Toast Notification */}
        {showSuccess && (
            <div className="fixed top-6 right-6 z-50 animate-slide-in">
              <div className="bg-green-500/10 backdrop-blur-md border border-green-500/30 rounded-xl p-4 shadow-2xl flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-green-400 font-semibold">Login Successful!</h3>
                  <p className="text-green-300/80 text-sm">Redirecting to dashboard...</p>
                </div>
                <button
                    onClick={() => setShowSuccess(false)}
                    className="ml-4 text-green-300 hover:text-green-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
        )}

        {/* Login Form - Centered */}
        <div className="w-full max-w-md relative z-10">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-accent/20 mb-6 hover:scale-105 transition-transform duration-300">
              <Sparkles className="text-white w-7 h-7" />
            </Link>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">Enter your details to access your account</p>
          </div>

          {/* Form Card */}
          <div className="glass-panel p-8 rounded-3xl shadow-2xl backdrop-blur-md bg-background/30 border border-white/10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                      type="email"
                      placeholder="name@example.com"
                      {...register("email", { required: "Email is required" })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                {errors.email && (
                    <p className="text-red-500 text-sm mt-1 animate-fade-in">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password", { required: "Password is required" })}
                      className="w-full pl-11 pr-12 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                    <p className="text-red-500 text-sm mt-1 animate-fade-in">{errors.password.message}</p>
                )}
              </div>


              {/* Submit Button */}
              <button
                  type="submit"
                  disabled={isLoading || showSuccess}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 mt-2"
              >
                {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                )}
              </button>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary hover:text-accent font-semibold transition-colors">
                    Create account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </PageTransition>
  );
}