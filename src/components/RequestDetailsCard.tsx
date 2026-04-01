import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, MapPin, Users, X, Clock, Tag, Target,
    User, Award, FileText, Building2,
    CheckCircle, XCircle, AlertCircle, ThumbsUp, ThumbsDown,
    Clock3, Sparkles, Edit, Save, Plus
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
    linked_profile?: string;
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
    admin_notes?: string;
}

const STATUS_CONFIG = {
    new: {
        color: 'from-accent to-accent/80',
        lightColor: 'from-accent to-accent/80',
        icon: Sparkles,
        label: 'New',
        glow: 'shadow-accent/30',
        text: 'text-accent',
        bg: 'bg-accent/10',
        border: 'border-accent/30',
        gradient: 'from-accent/20 to-transparent',
        badge: 'bg-accent/20 text-accent border-accent/30'
    },
    reviewing: {
        color: 'from-accent to-accent/80',
        lightColor: 'from-accent to-accent/80',
        icon: Clock,
        label: 'Reviewing',
        glow: 'shadow-accent/30',
        text: 'text-accent',
        bg: 'bg-accent/10',
        border: 'border-accent/30',
        gradient: 'from-accent/20 to-transparent',
        badge: 'bg-accent/20 text-accent border-accent/30'
    },
    approved: {
        color: 'from-accent to-accent/80',
        lightColor: 'from-accent to-accent/80',
        icon: CheckCircle,
        label: 'Approved',
        glow: 'shadow-accent/30',
        text: 'text-accent',
        bg: 'bg-accent/10',
        border: 'border-accent/30',
        gradient: 'from-accent/20 to-transparent',
        badge: 'bg-accent/20 text-accent border-accent/30'
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

const STATUS_OPTIONS = [
    { value: 'new', label: 'New' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
];

const CATEGORY_OPTIONS = [
    { value: "private", label: "Private" },
    { value: "public", label: "Public" }
];

const EVENT_TYPE_OPTIONS = [
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
    { value: "hybrid", label: "Hybrid" }
];

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
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        category: '',
        event_type: '',
        objective: '',
        target_audience: '',
        expected_attendees: 0,
        event_date: '',
        city: '',
        venue: false,
        status: '',
        admin_notes: '',
        speaker: [] as RequestSpeaker[]
    });

    useEffect(() => {
        if (isOpen && requestId && token) {
            fetchRequestDetails();
        }
    }, [isOpen, requestId, token]);

    const fetchRequestDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `https://django-kf3s.vercel.app/api/admin/request/${requestId}/`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
            });
            if (!response.ok) throw new Error(`Failed to fetch request details: ${response.status}`);
            const data = await response.json();
            setRequest(data);
            setEditForm({
                name: data.name || '',
                description: data.description || '',
                category: data.category || '',
                event_type: data.event_type || '',
                objective: data.objective || '',
                target_audience: data.target_audience || '',
                expected_attendees: data.expected_attendees || 0,
                event_date: data.event_date ? data.event_date.split('T')[0] : '',
                city: data.city || '',
                venue: data.venue || false,
                status: data.status?.toLowerCase() || 'new',
                admin_notes: data.admin_notes || '',
                speaker: data.speaker || []
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load request details");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRequest = async () => {
        if (!request || !token) return;
        setUpdating(true);
        setActionError(null);
        try {
            const url = `https://django-kf3s.vercel.app/api/admin/request/${requestId}/`;
            const updateData = {
                name: editForm.name,
                description: editForm.description,
                category: editForm.category,
                event_type: editForm.event_type,
                objective: editForm.objective,
                target_audience: editForm.target_audience,
                expected_attendees: editForm.expected_attendees,
                event_date: editForm.event_date,
                city: editForm.city,
                venue: editForm.venue,
                speaker: editForm.speaker,
                paid: (request as any).paid || false,
                status: editForm.status,
                admin_notes: editForm.admin_notes
            };
            const response = await fetch(url, {
                method: "PUT",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(updateData)
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || `Failed to update request: ${response.status}`);
            }
            const updatedData = await response.json();
            setRequest(updatedData);
            setUpdateSuccess(true);
            setIsEditing(false);
            if (onStatusChange) onStatusChange();
            setTimeout(() => setUpdateSuccess(false), 3000);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Failed to update request");
            setTimeout(() => setActionError(null), 3000);
        } finally {
            setUpdating(false);
        }
    };

    const handleApprove = async () => {
        if (!request || !token) return;
        setUpdating(true);
        setActionError(null);
        try {
            const url = `https://django-kf3s.vercel.app/api/admin/approve/${requestId}/`;
            const response = await fetch(url, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || `Failed to approve request: ${response.status}`);
            }
            setRequest(prev => prev ? { ...prev, status: 'approved' } : null);
            setEditForm(prev => ({ ...prev, status: 'approved' }));
            setUpdateSuccess(true);
            if (onStatusChange) onStatusChange();
            setTimeout(() => setUpdateSuccess(false), 3000);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Failed to approve request");
            setTimeout(() => setActionError(null), 3000);
        } finally {
            setUpdating(false);
        }
    };

    const handleReject = async () => {
        if (!request || !token) return;
        setUpdating(true);
        setActionError(null);
        try {
            const url = `https://django-kf3s.vercel.app/api/admin/reject/${requestId}/`;
            const response = await fetch(url, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || `Failed to reject request: ${response.status}`);
            }
            setRequest(prev => prev ? { ...prev, status: 'rejected' } : null);
            setEditForm(prev => ({ ...prev, status: 'rejected' }));
            setUpdateSuccess(true);
            if (onStatusChange) onStatusChange();
            setTimeout(() => setUpdateSuccess(false), 3000);
        } catch (err) {
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
            gradient: 'from-gray-500/20 to-transparent',
            badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        };
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
            });
        } catch { return "Invalid date"; }
    };

    const formatCategory = (category: string) => {
        if (!category) return "General";
        return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const addSpeaker = () => {
        setEditForm(prev => ({
            ...prev,
            speaker: [...prev.speaker, { name: "", position: "", linked_profile: "" }]
        }));
    };

    const updateSpeaker = (index: number, field: string, value: string) => {
        const updatedSpeakers = [...editForm.speaker];
        updatedSpeakers[index] = { ...updatedSpeakers[index], [field]: value };
        setEditForm(prev => ({ ...prev, speaker: updatedSpeakers }));
    };

    const removeSpeaker = (index: number) => {
        setEditForm(prev => ({
            ...prev,
            speaker: prev.speaker.filter((_, i) => i !== index)
        }));
    };

    const resetEditForm = () => {
        if (request) {
            setEditForm({
                name: request.name || '',
                description: request.description || '',
                category: request.category || '',
                event_type: request.event_type || '',
                objective: request.objective || '',
                target_audience: request.target_audience || '',
                expected_attendees: request.expected_attendees || 0,
                event_date: request.event_date ? request.event_date.split('T')[0] : '',
                city: request.city || '',
                venue: request.venue || false,
                status: request.status?.toLowerCase() || 'new',
                admin_notes: request.admin_notes || '',
                speaker: request.speaker || []
            });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Card — flex column so header/footer are sticky, only middle scrolls */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-3xl h-[70vh] rounded-2xl shadow-2xl z-10 bg-white dark:bg-gradient-to-br dark:from-gray-900/90 dark:to-gray-950/90 dark:backdrop-blur-xl border border-gray-200 dark:border-white/10 flex flex-col"
                    >
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 flex-1">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-xl opacity-50 animate-pulse" />
                                    <div className="relative w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
                                </div>
                                <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">Loading request details...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4 flex-1">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-rose-500 rounded-full blur-xl opacity-30" />
                                    <div className="relative w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/30">
                                        <XCircle className="w-10 h-10 text-rose-400" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to Load</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">{error}</p>
                                <button
                                    onClick={fetchRequestDetails}
                                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-lg text-white font-medium"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : request ? (
                            <div className="flex flex-col h-full">

                                {/* ── STICKY HEADER (status banner, never scrolls) ── */}
                                {(() => {
                                    const config = getStatusConfig(request.status);
                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`relative shrink-0 overflow-hidden ${config.bg} border-b ${config.border} rounded-t-2xl p-5 backdrop-blur-sm`}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-20`} />
                                            <div className="relative flex items-center justify-between pr-10">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Event Request</p>
                                                        <p className={`text-base font-semibold ${config.text}`}>{config.label}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={onClose}
                                                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    );
                                })()}

                                {/* ── SCROLLABLE BODY (scrollbar fully hidden) ── */}
                                <div
                                    className="flex-1 overflow-y-auto p-6"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {/* Hide webkit scrollbar */}
                                    <style>{`
                                        .hide-scroll::-webkit-scrollbar { display: none; }
                                    `}</style>

                                    {updateSuccess && (
                                        <motion.div className="mb-6 p-3 bg-accent/10 border border-accent/30 rounded-lg text-accent text-sm flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Request updated successfully!
                                        </motion.div>
                                    )}

                                    {actionError && (
                                        <motion.div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
                                            {actionError}
                                        </motion.div>
                                    )}

                                    {/* Requester Info */}
                                    <div className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-white/10 mb-6">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-white/20 focus:border-primary outline-none w-full mb-3"
                                            />
                                        ) : (
                                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                                Event Request from <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{request.name}</span>
                                            </h1>
                                        )}
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <User className="w-4 h-4 text-primary" />
                                                <span className="font-medium">{request.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Key Info Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-gray-50 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Date</span>
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    type="date"
                                                    value={editForm.event_date}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, event_date: e.target.value }))}
                                                    className="text-sm font-semibold text-gray-900 dark:text-white bg-transparent w-full focus:outline-none"
                                                />
                                            ) : (
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(request.event_date)}</p>
                                            )}
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="w-4 h-4 text-accent" />
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">City</span>
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.city}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                                                    className="text-sm font-semibold text-gray-900 dark:text-white bg-transparent w-full focus:outline-none"
                                                />
                                            ) : (
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{request.city}</p>
                                            )}
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Tag className="w-4 h-4 text-primary" />
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Category</span>
                                            </div>
                                            {isEditing ? (
                                                <select
                                                    value={editForm.category}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                                    className="text-sm font-semibold text-gray-900 dark:text-white bg-transparent w-full focus:outline-none"
                                                >
                                                    {CATEGORY_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-900">{opt.label}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCategory(request.category)}</p>
                                            )}
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Target className="w-4 h-4 text-accent" />
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Type</span>
                                            </div>
                                            {isEditing ? (
                                                <select
                                                    value={editForm.event_type}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, event_type: e.target.value }))}
                                                    className="text-sm font-semibold text-gray-900 dark:text-white bg-transparent w-full focus:outline-none"
                                                >
                                                    {EVENT_TYPE_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-900">{opt.label}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{request.event_type}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expected Attendees */}
                                    <div className="bg-gray-50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-white/10 mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Users className="w-4 h-4 text-primary" />
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Expected Attendees</h3>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={editForm.expected_attendees}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, expected_attendees: parseInt(e.target.value) || 0 }))}
                                                className="w-full px-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-primary outline-none"
                                            />
                                        ) : (
                                            <p className="text-gray-700 dark:text-gray-300">{request.expected_attendees}</p>
                                        )}
                                    </div>

                                    {/* Objective */}
                                    <div className="bg-gray-50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-white/10 mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Target className="w-4 h-4 text-accent" />
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Objective</h3>
                                        </div>
                                        {isEditing ? (
                                            <textarea
                                                value={editForm.objective}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, objective: e.target.value }))}
                                                rows={2}
                                                className="w-full px-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-accent outline-none resize-none"
                                            />
                                        ) : (
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{request.objective || "No objective provided"}</p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="bg-gray-50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-white/10 mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className="w-4 h-4 text-primary" />
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Description</h3>
                                        </div>
                                        {isEditing ? (
                                            <textarea
                                                value={editForm.description}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                rows={3}
                                                className="w-full px-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-primary outline-none resize-none"
                                            />
                                        ) : (
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{request.description || "No description provided"}</p>
                                        )}
                                    </div>

                                    {/* Target Audience */}
                                    <div className="bg-gray-50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-white/10 mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Users className="w-4 h-4 text-accent" />
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Target Audience</h3>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.target_audience}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, target_audience: e.target.value }))}
                                                className="w-full px-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-accent outline-none"
                                            />
                                        ) : (
                                            <p className="text-gray-700 dark:text-gray-300">{request.target_audience || "Not specified"}</p>
                                        )}
                                    </div>

                                    {/* Venue */}
                                    <div className="bg-gray-50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-white/10 mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Building2 className="w-4 h-4 text-primary" />
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Venue Required</h3>
                                        </div>
                                        {isEditing ? (
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={editForm.venue === true}
                                                        onChange={() => setEditForm(prev => ({ ...prev, venue: true }))}
                                                        className="w-4 h-4 text-primary"
                                                    />
                                                    <span className="text-gray-700 dark:text-white text-sm">Yes</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={editForm.venue === false}
                                                        onChange={() => setEditForm(prev => ({ ...prev, venue: false }))}
                                                        className="w-4 h-4 text-primary"
                                                    />
                                                    <span className="text-gray-700 dark:text-white text-sm">No</span>
                                                </label>
                                            </div>
                                        ) : (
                                            <p className="text-gray-700 dark:text-gray-300">{request.venue ? "Venue required" : "No venue required"}</p>
                                        )}
                                    </div>

                                    {/* Speakers */}
                                    {editForm.speaker && (editForm.speaker.length > 0 || isEditing) && (
                                        <div className="bg-gray-50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-white/10 mb-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Award className="w-4 h-4 text-accent" />
                                                <h3 className="font-semibold text-gray-900 dark:text-white">Speakers</h3>
                                            </div>
                                            {isEditing ? (
                                                <>
                                                    {editForm.speaker.map((speaker, idx) => (
                                                        <div key={idx} className="space-y-2 mb-3 p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-white/10">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">Speaker {idx + 1}</span>
                                                                <button type="button" onClick={() => removeSpeaker(idx)} className="text-red-500 hover:text-red-600">
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={speaker.name}
                                                                onChange={(e) => updateSpeaker(idx, "name", e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-primary outline-none"
                                                                placeholder="Speaker name"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={speaker.position}
                                                                onChange={(e) => updateSpeaker(idx, "position", e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-primary outline-none"
                                                                placeholder="Position"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={speaker.linked_profile || ''}
                                                                onChange={(e) => updateSpeaker(idx, "linked_profile", e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-primary outline-none"
                                                                placeholder="LinkedIn Profile URL"
                                                            />
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={addSpeaker}
                                                        className="mt-2 text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                                                    >
                                                        <Plus className="w-4 h-4" /> Add Speaker
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="grid sm:grid-cols-2 gap-3">
                                                    {request.speaker.map((speaker, idx) => (
                                                        /* White in light mode, dark in dark mode */
                                                        <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-white/10">
                                                            <div className="relative shrink-0">
                                                                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-md opacity-40" />
                                                                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
                                                                    {speaker.name?.charAt(0) || '?'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">{speaker.name}</p>
                                                                {speaker.position && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{speaker.position}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Status & Admin Notes */}
                                    <div className="bg-gray-50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-white/10 mb-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                                {isEditing ? (
                                                    <select
                                                        value={editForm.status}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                                        className="w-full px-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-primary outline-none"
                                                    >
                                                        {STATUS_OPTIONS.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <p className="text-gray-700 dark:text-gray-300 capitalize">{request.status}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Admin Notes</label>
                                                {isEditing ? (
                                                    <textarea
                                                        value={editForm.admin_notes}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                                                        rows={3}
                                                        className="w-full px-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-accent outline-none resize-none"
                                                        placeholder="Add notes about this request..."
                                                    />
                                                ) : (
                                                    <p className="text-gray-700 dark:text-gray-300">{request.admin_notes || "No admin notes"}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Created Date */}
                                    <div className="bg-gray-50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-white/10 mb-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Clock3 className="w-4 h-4 text-primary" />
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Submitted</h3>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300">
                                            {new Date(request.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* ── STICKY FOOTER (action buttons, never scrolls) ── */}
                                <div className="shrink-0 bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 rounded-b-2xl px-6 py-4 flex flex-wrap items-center justify-end gap-3">
                                    {!isEditing ? (
                                        <>
                                            <button
                                                onClick={handleApprove}
                                                disabled={updating || request.status === 'approved' || request.status === 'rejected'}
                                                className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                                                    request.status === 'approved'
                                                        ? 'bg-accent/10 text-accent cursor-default'
                                                        : 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg shadow-primary/30'
                                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                                            >
                                                <ThumbsUp className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={handleReject}
                                                disabled={updating || request.status === 'rejected' || request.status === 'approved'}
                                                className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                                                    request.status === 'rejected'
                                                        ? 'bg-rose-500/10 text-rose-300 cursor-default'
                                                        : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg shadow-rose-500/30'
                                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                                            >
                                                <ThumbsDown className="w-4 h-4" />
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                                                title="Edit Request"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={onClose}
                                                className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium"
                                            >
                                                Close
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { setIsEditing(false); resetEditForm(); }}
                                                className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleUpdateRequest}
                                                disabled={updating}
                                                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium flex items-center gap-2"
                                            >
                                                {updating ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                Save Changes
                                            </button>
                                        </>
                                    )}
                                </div>

                            </div>
                        ) : null}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}