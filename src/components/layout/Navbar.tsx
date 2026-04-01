import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Sun, Moon, LogOut, User as UserIcon,
  ChevronDown, Loader2
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { useUser } from "@/usercontext";
import logo from '../../../public/images/logo.png';
import darklogo from '../../../public/images/logo_black.png';

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Events", path: "/events" },
  { name: "Calendar", path: "/calendar" },
  { name: "Gallery", path: "/gallery" },
];

export function Navbar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout, isLoading } = useUser();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    setMobileMenuOpen(false);
    window.location.href = "/";
  };

  const getUserInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    return 'U';
  };

  const currentLogo = theme === "dark" ? logo : darklogo;

  return (
      <>
        <header className="fixed top-[3px]  z-50 inset-x-0  py-2 transition-all duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl bg-background/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-primary/5"
            >
              <div className="flex justify-between items-center px-4 py-2 lg:px-6">

                {/* Logo - Fixed height container with theme switching */}
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                  <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      key={theme}
                  >
                    <img
                        src={currentLogo}
                        alt="logo"
                        className="h-auto w-auto sm:max-h-18  max-h-10 object-contain"
                        style={{ height: '100px', width: 'auto' }}
                    />
                  </motion.div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-6">
                  <ul className="flex items-center gap-1">
                    {NAV_LINKS.map((link) => {
                      const isActive = location === link.path;
                      return (
                          <motion.li key={link.path} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                            <Link
                                href={link.path}
                                className={cn(
                                    "relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                                    isActive
                                        ? "text-accent bg-accent/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                )}
                            >
                              {link.name}
                              {isActive && (
                                  <motion.div
                                      layoutId="nav-indicator"
                                      className="absolute inset-0 rounded-xl border border-accent/50"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                  />
                              )}
                            </Link>
                          </motion.li>
                      );
                    })}
                  </ul>

                  <div className="w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent mx-2" />

                  <div className="flex items-center gap-3">
                    {/* Theme toggle */}
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all border border-white/5"
                    >
                      <motion.div animate={{ rotate: theme === "dark" ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </motion.div>
                    </motion.button>

                    {!user ? (
                        <motion.div className="flex items-center gap-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                          <Link href="/login">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-5 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                            >
                              Log in
                            </motion.button>
                          </Link>
                          <Link href="/register">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/40 transition-all duration-300 relative overflow-hidden group"
                            >
                              <span className="relative z-10">Sign up</span>
                              <motion.div
                                  className="absolute inset-0 bg-white/20"
                                  initial={{ x: "-100%" }}
                                  whileHover={{ x: "100%" }}
                                  transition={{ duration: 0.5 }}
                              />
                            </motion.button>
                          </Link>
                        </motion.div>
                    ) : (
                        <div className="relative">
                          <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-white/5 transition-all"
                              disabled={isLoading}
                          >
                            <div className="relative">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {getUserInitial()}
                              </div>
                              <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"
                              />
                            </div>
                            <div className="hidden xl:block text-left">
                              <p className="text-sm font-medium text-foreground">{user.name || 'User'}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                              {isLoading
                                  ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                  : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              }
                            </motion.div>
                          </motion.button>

                          <AnimatePresence>
                            {isDropdownOpen && !isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ type: "spring", damping: 15 }}
                                    className="absolute right-0 mt-2 w-64 origin-top-right z-50"
                                >
                                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl">
                                    <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-white/5">
                                      <p className="text-sm font-medium text-foreground">Signed in as</p>
                                      <p className="text-sm font-bold text-accent truncate mt-1">{user.email}</p>
                                    </div>
                                    <div className="p-2">
                                      <Link href="/profile">
                                        <motion.button
                                            whileHover={{ x: 5 }}
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-accent/10 rounded-xl transition-all group"
                                        >
                                          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                            <UserIcon className="w-4 h-4 text-accent" />
                                          </div>
                                          <span className="flex-1 text-left">Profile</span>
                                          <span className="text-xs text-muted-foreground">→</span>
                                        </motion.button>
                                      </Link>

                                      <div className="h-px bg-border my-2" />

                                      <motion.button
                                          whileHover={{ x: 5 }}
                                          onClick={handleLogout}
                                          disabled={isLoading}
                                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                        </div>
                                        <span className="flex-1 text-left">{isLoading ? "Signing out..." : "Sign Out"}</span>
                                        <span className="text-xs">↗</span>
                                      </motion.button>
                                    </div>
                                  </div>
                                </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                    )}
                  </div>
                </nav>

                {/* Mobile controls */}
                <div className="flex items-center gap-2 lg:hidden">
                  <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleTheme}
                      className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground"
                  >
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </motion.button>

                  <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-accent/25"
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.button>
                </div>

              </div>
            </motion.div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="lg:hidden fixed inset-x-4 top-20 mt-2 z-50"
                >
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl">
                    <nav className="flex flex-col p-3 gap-1">
                      {NAV_LINKS.map((link) => {
                        const isActive = location === link.path;
                        return (
                            <motion.div key={link.path} whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                              <Link
                                  href={link.path}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                      "flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all",
                                      isActive
                                          ? "bg-gradient-to-r from-primary/10 to-accent/10 text-accent"
                                          : "text-muted-foreground hover:bg-secondary/50"
                                  )}
                              >
                                <span className="flex-1">{link.name}</span>
                                {isActive && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-2 h-2 rounded-full bg-accent"
                                    />
                                )}
                              </Link>
                            </motion.div>
                        );
                      })}

                      <div className="h-px bg-border my-2" />

                      {!user ? (
                          <div className="p-3 space-y-2">
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                              <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full py-3.5 text-base font-medium text-foreground/80 hover:text-foreground bg-secondary/30 hover:bg-secondary/50 rounded-xl transition-all"
                              >
                                Log in
                              </motion.button>
                            </Link>
                            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                              <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full py-3.5 text-base font-semibold bg-gradient-to-r from-primary to-accent text-white rounded-xl shadow-lg"
                              >
                                Sign up
                              </motion.button>
                            </Link>
                          </div>
                      ) : (
                          <div className="p-3 space-y-2">
                            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-white/5">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                                {getUserInitial()}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{user.name || 'User'}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>

                            <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                              <motion.button
                                  whileHover={{ x: 5 }}
                                  className="w-full flex items-center gap-3 px-4 py-3.5 text-base text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-all"
                              >
                                <UserIcon className="w-5 h-5" />
                                Profile
                              </motion.button>
                            </Link>

                            <motion.button
                                whileHover={{ x: 5 }}
                                onClick={handleLogout}
                                disabled={isLoading}
                                className="w-full flex items-center gap-3 px-4 py-3.5 text-base text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-50"
                            >
                              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                              <span>{isLoading ? "Signing out..." : "Sign Out"}</span>
                            </motion.button>
                          </div>
                      )}
                    </nav>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
        </header>
      </>
  );
}