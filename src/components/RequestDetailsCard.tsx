import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, MapPin, Users, X, Clock, Tag, Target,
    User, Award, FileText, Building2,
    CheckCircle, XCircle, AlertCircle, ThumbsUp, ThumbsDown,
    Clock3, Sparkles
} from "lucide-react";

interface RequestDetailsCardProps {
    requestId: string | number;
    token: string;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange?: () => void;
}

interface RequestSpeaker {
    name: string;
    position: string;
}

interface RequestDetails {
    eventrequest_id: number;
    name: string;
    description: string;
    category: string;
    event_type: string;
    objective: string;
    target_audience: string;
    expected_attendees: number;
    event_date: string;
    city: string;
    status: string;
    venue: boolean;
    created_at: string;
    speaker: RequestSpeaker[];
}

// Ultra-modern dark theme status configuration
const STATUS_CONFIG = {
    new: {
        color: 'from-purple-500 to-purple-600',
        lightColor: 'from-purple-400 to-purple-500',
        icon: Sparkles,
        label: 'New',
        glow: 'shadow-purple-500/30',
        text: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        gradient: 'from-purple-500/20 to-transparent',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    reviewing: {
        color: 'from-blue-500 to-blue-600',
        lightColor: 'from-blue-400 to-blue-500',
        icon: Clock,
        label: 'Reviewing',
        glow: 'shadow-blue-500/30',
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        gradient: 'from-blue-500/20 to-transparent',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    approved: {
        color: 'from-emerald-500 to-emerald-600',
        lightColor: 'from-emerald-400 to-emerald-500',
        icon: CheckCircle,
        label: 'Approved',
        glow: 'shadow-emerald-500/30',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        gradient: 'from-emerald-500/20 to-transparent',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    rejected: {
        color: 'from-rose-500 to-rose-600',
        lightColor: 'from-rose-400 to-rose-500',
        icon: XCircle,
        label: 'Rejected',
        glow: 'shadow-rose-500/30',
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        gradient: 'from-rose-500/20 to-transparent',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    }
};

export default function RequestDetailsCard({
                                               requestId,
                                               token,
                                               isOpen,
                                               onClose,
                                               onStatusChange
                                           }: RequestDetailsCardProps) {
    const [request, setRequest] = useState<RequestDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    // Fetch request details when opened
    useEffect(() => {
        if (isOpen && requestId && token) {
            fetchRequestDetails();
        }
    }, [isOpen, requestId, token]);

    // Fetch request details - using actual API data
    const fetchRequestDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            if (typeof requestId === 'string' && requestId.startsWith('temp-')) {
                throw new Error('Invalid request ID - cannot fetch details');
            }

            const url = `https://django-kf3s.vercel.app/api/admin/request/${requestId}/`;
            console.log(`📡 Fetching request details from: ${url}`);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch request details: ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ Request details received:", data);

            setRequest(data);
        } catch (err) {
            console.error("❌ Error fetching request details:", err);
            setError(err instanceof Error ? err.message : "Failed to load request details");
        } finally {
            setLoading(false);
        }
    };

    // Approve endpoint - using full URL
    const handleApprove = async () => {
        if (!request || !token) return;

        setUpdating(true);
        setActionError(null);

        try {
            const url = `https://django-kf3s.vercel.app/api/admin/approve/${requestId}/`;
            console.log(`📡 Approving request via: ${url}`);

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || `Failed to approve request: ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ Request approved successfully:", data);

            setRequest(prev => prev ? { ...prev, status: 'approved' } : null);
            setUpdateSuccess(true);

            if (onStatusChange) {
                onStatusChange();
            }

            setTimeout(() => setUpdateSuccess(false), 3000);
        } catch (err) {
            console.error("❌ Error approving request:", err);
            setActionError(err instanceof Error ? err.message : "Failed to approve request");
            setTimeout(() => setActionError(null), 3000);
        } finally {
            setUpdating(false);
        }
    };

    // Reject endpoint - using full URL
    const handleReject = async () => {
        if (!request || !token) return;

        setUpdating(true);
        setActionError(null);

        try {
            const url = `https://django-kf3s.vercel.app/api/admin/reject/${requestId}/`;
            console.log(`📡 Rejecting request via: ${url}`);

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || `Failed to reject request: ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ Request rejected successfully:", data);

            setRequest(prev => prev ? { ...prev, status: 'rejected' } : null);
            setUpdateSuccess(true);

            if (onStatusChange) {
                onStatusChange();
            }

            setTimeout(() => setUpdateSuccess(false), 3000);
        } catch (err) {
            console.error("❌ Error rejecting request:", err);
            setActionError(err instanceof Error ? err.message : "Failed to reject request");
            setTimeout(() => setActionError(null), 3000);
        } finally {
            setUpdating(false);
        }
    };

    const getStatusConfig = (status: string) => {
        return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
            color: 'from-gray-500 to-gray-600',
            icon: AlertCircle,
            label: status,
            text: 'text-gray-400',
            bg: 'bg-gray-500/10',
            border: 'border-gray-500/30',
            badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        };
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return "Invalid date";
        }
    };

    // Format category by replacing underscores with spaces
    const formatCategory = (category: string) => {
        if (!category) return "General";
        return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop with intense blur and gradient */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-900/98 to-black/95 backdrop-blur-xl"
                    />

                    {/* Card - Dark Theme with Glass Effect */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl z-10 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-xl border border-white/10"
                    >
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-rose-500/5 animate-pulse" />

                        {/* Header with Glass Effect */}
                        <div className="sticky top-0 z-10 bg-gray-900/50 backdrop-blur-xl border-b border-white/10 px-6 py-4 rounded-t-2xl">
                            <div className="flex items-center justify-between relative">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-lg opacity-50" />
                                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                            <FileText className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Request Details</h2>
                                        <p className="text-sm text-gray-400">ID: {requestId}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group"
                                >
                                    <X className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all" />
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            // Loading State with Dark Theme
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse" />
                                    <div className="relative w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                </div>
                                <p className="mt-6 text-sm text-gray-400">Loading request details...</p>
                            </div>
                        ) : error ? (
                            // Error State with Dark Theme
                            <div className="flex flex-col items-center justify-center py-20 px-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-rose-500 rounded-full blur-xl opacity-30" />
                                    <div className="relative w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/30">
                                        <XCircle className="w-10 h-10 text-rose-400" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">Failed to Load</h3>
                                <p className="text-sm text-gray-400 text-center max-w-md mb-6">{error}</p>
                                <button
                                    onClick={fetchRequestDetails}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : request ? (
                            // Request Content
                            <div className="p-6 relative">
                                {/* Status Banner with Glass Effect */}
                                {(() => {
                                    const config = getStatusConfig(request.status);
                                    const Icon = config.icon;
                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`relative overflow-hidden ${config.bg} ${config.border} border rounded-xl p-4 mb-6 backdrop-blur-sm`}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-20`} />
                                            <div className="relative flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center shadow-lg ${config.glow}`}>
                                                        <Icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-400">Current Status</p>
                                                        <p className={`text-lg font-semibold ${config.text}`}>{config.label}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${config.badge}`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })()}

                                {/* Success/Error Messages */}
                                {updateSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm flex items-center gap-2 backdrop-blur-sm"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Status updated successfully!
                                    </motion.div>
                                )}

                                {actionError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm backdrop-blur-sm"
                                    >
                                        {actionError}
                                    </motion.div>
                                )}

                                {/* Main Content Grid */}
                                <div className="space-y-6">
                                    {/* Requester Info with Glass Effect */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="relative overflow-hidden bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <h1 className="text-2xl font-bold text-white mb-3">
                                            Event Request from <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{request.name}</span>
                                        </h1>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                <User className="w-4 h-4 text-blue-400" />
                                                <span className="font-medium">{request.name}</span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Key Info Cards - Dark Glass Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { icon: Calendar, label: 'Date', value: formatDate(request.event_date), color: 'from-blue-500 to-blue-600' },
                                            { icon: MapPin, label: 'City', value: request.city, color: 'from-emerald-500 to-emerald-600' },
                                            { icon: Tag, label: 'Category', value: formatCategory(request.category), color: 'from-purple-500 to-purple-600' },
                                            { icon: Target, label: 'Type', value: request.event_type, color: 'from-amber-500 to-amber-600' }
                                        ].map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 + idx * 0.05 }}
                                                className="relative group bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:border-white/20 transition-all"
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity rounded-lg`} />
                                                <div className="flex items-center gap-2 mb-1">
                                                    <item.icon className={`w-4 h-4 bg-gradient-to-br ${item.color} bg-clip-text text-transparent`} />
                                                    <span className="text-xs font-medium text-gray-400">{item.label}</span>
                                                </div>
                                                <p className="text-sm font-semibold text-white truncate">{item.value}</p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Expected Attendees */}
                                    {request.expected_attendees > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="relative overflow-hidden bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all group"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-orange-500 rounded-lg blur-md opacity-50" />
                                                    <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                                        <Users className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-white">Expected Attendees</h3>
                                            </div>
                                            <p className="text-gray-300">{request.expected_attendees}</p>
                                        </motion.div>
                                    )}

                                    {/* Objective */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        className="relative overflow-hidden bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-purple-500 rounded-lg blur-md opacity-50" />
                                                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                    <Target className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-white">Objective</h3>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed">
                                            {request.objective || "No objective provided"}
                                        </p>
                                    </motion.div>

                                    {/* Description */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="relative overflow-hidden bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-blue-500 rounded-lg blur-md opacity-50" />
                                                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                    <FileText className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-white">Description</h3>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed">
                                            {request.description || "No description provided"}
                                        </p>
                                    </motion.div>

                                    {/* Target Audience */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                        className="relative overflow-hidden bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-green-500 rounded-lg blur-md opacity-50" />
                                                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                                    <Users className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-white">Target Audience</h3>
                                        </div>
                                        <p className="text-gray-300">{request.target_audience || "Not specified"}</p>
                                    </motion.div>

                                    {/* Venue Info */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="relative overflow-hidden bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-teal-500 rounded-lg blur-md opacity-50" />
                                                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                                                    <Building2 className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-white">Venue</h3>
                                        </div>
                                        <p className="text-gray-300">
                                            {request.venue === true ? "Venue required" : "No venue required"}
                                        </p>
                                    </motion.div>

                                    {/* Speakers */}
                                    {request.speaker && request.speaker.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.45 }}
                                            className="relative overflow-hidden bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all group"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-amber-500 rounded-lg blur-md opacity-50" />
                                                    <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                                        <Award className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-white">Speakers</h3>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                {request.speaker.map((speaker, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.5 + idx * 0.05 }}
                                                        className="flex items-center gap-3 p-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 transition-all group/item"
                                                    >
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-md opacity-50 group-hover/item:opacity-75 transition-opacity" />
                                                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                                {speaker.name?.charAt(0) || '?'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">{speaker.name}</p>
                                                            {speaker.position && (
                                                                <p className="text-xs text-gray-400">{speaker.position}</p>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Created Date */}
                                    {request.created_at && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="relative overflow-hidden bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all group"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-gray-500 rounded-lg blur-md opacity-50" />
                                                    <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center">
                                                        <Clock3 className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-white">Submitted</h3>
                                            </div>
                                            <p className="text-gray-300">
                                                {new Date(request.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Action Buttons - Dark Glass */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.55 }}
                                    className="sticky bottom-0 bg-gray-900/50 backdrop-blur-xl border-t border-white/10 mt-8 pt-6 pb-2 flex flex-wrap items-center justify-end gap-3"
                                >
                                    {/* Approve Button */}
                                    <button
                                        onClick={handleApprove}
                                        disabled={updating || request.status === 'approved' || request.status === 'rejected'}
                                        className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 overflow-hidden group ${
                                            request.status === 'approved'
                                                ? 'bg-emerald-500/10 text-emerald-300 cursor-default border border-emerald-500/30'
                                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5'
                                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        {updating ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <ThumbsUp className="w-4 h-4 relative z-10" />
                                        )}
                                        <span className="relative z-10">Approve</span>
                                    </button>

                                    {/* Reject Button */}
                                    <button
                                        onClick={handleReject}
                                        disabled={updating || request.status === 'rejected' || request.status === 'approved'}
                                        className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 overflow-hidden group ${
                                            request.status === 'rejected'
                                                ? 'bg-rose-500/10 text-rose-300 cursor-default border border-rose-500/30'
                                                : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:-translate-y-0.5'
                                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        {updating ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <ThumbsDown className="w-4 h-4 relative z-10" />
                                        )}
                                        <span className="relative z-10">Reject</span>
                                    </button>

                                    {/* Close Button */}
                                    <button
                                        onClick={onClose}
                                        className="relative px-5 py-2.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 font-medium transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-sm overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        <span className="relative z-10">Close</span>
                                    </button>
                                </motion.div>
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}