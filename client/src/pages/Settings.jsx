import { useState } from "react";
import { User, Building2, Save, Trash2, Shield, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import { updateWorkspace } from "../features/workspaceSlice";

export default function Settings() {
    const { user, logout } = useAuth();
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();
    
    const [activeTab, setActiveTab] = useState("profile");
    const [isSaving, setIsSaving] = useState(false);
    
    // Form states
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });
    
    const [workspaceData, setWorkspaceData] = useState({
        name: currentWorkspace?.name || "",
        description: currentWorkspace?.description || "",
        image_url: currentWorkspace?.image_url || "",
    });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // In a real app, you'd call an API to update the profile
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Profile updated (simulated)");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleWorkspaceSubmit = async (e) => {
        e.preventDefault();
        if (!currentWorkspace) return;
        
        setIsSaving(true);
        try {
            const response = await api.patch(`/workspaces/${currentWorkspace.id}`, workspaceData);
            dispatch(updateWorkspace(response.data));
            toast.success("Workspace updated successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update workspace");
        } finally {
            setIsSaving(false);
        }
    };

    const isAdmin = currentWorkspace?.ownerId === user?.id || 
                    currentWorkspace?.members?.find(m => m.userId === user?.id)?.role === "ADMIN";

    const inputClasses = "w-full px-4 py-2.5 rounded-lg border text-sm transition-all dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-300";
    const labelClasses = "block text-sm font-medium text-zinc-700 dark:text-zinc-400 mb-1.5";
    const cardClasses = "bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm";

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Settings</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your account and workspace preferences</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl w-fit">
                <button 
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "profile" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                >
                    <User size={16} /> Profile
                </button>
                <button 
                    onClick={() => setActiveTab("workspace")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "workspace" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                >
                    <Building2 size={16} /> Workspace
                </button>
            </div>

            {activeTab === "profile" ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className={cardClasses}>
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Personal Information</h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Update your personal details and how others see you.</p>
                        </div>
                        <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className={labelClasses}>Full Name</label>
                                    <input 
                                        type="text" 
                                        value={profileData.name} 
                                        onChange={e => setProfileData({...profileData, name: e.target.value})}
                                        className={inputClasses} 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClasses}>Email Address</label>
                                    <input 
                                        type="email" 
                                        value={profileData.email} 
                                        disabled
                                        className={inputClasses + " opacity-60 cursor-not-allowed"} 
                                    />
                                    <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                                        <Shield size={12} /> Email cannot be changed for security reasons
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50">
                                    <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className={cardClasses}>
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Security</h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your account security and password.</p>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Reset Password</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Receive an OTP to reset your account password.</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        if (window.confirm("You will be logged out and sent to the reset password page. Continue?")) {
                                            logout();
                                            window.location.href = "/forget-password";
                                        }
                                    }}
                                    className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-sm font-medium transition-all"
                                >
                                    Start Reset Flow
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={cardClasses}>
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Account Session</h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Logout from your current session.</p>
                        </div>
                        <div className="p-6">
                            <button 
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-sm font-medium transition-all"
                            >
                                <LogOut size={16} /> Logout Account
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className={cardClasses}>
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Workspace Details</h2>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your workspace identity and appearance.</p>
                            </div>
                            {!isAdmin && (
                                <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] uppercase font-bold rounded tracking-wider">View Only</span>
                            )}
                        </div>
                        <form onSubmit={handleWorkspaceSubmit} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className={labelClasses}>Workspace Name</label>
                                    <input 
                                        type="text" 
                                        value={workspaceData.name} 
                                        onChange={e => setWorkspaceData({...workspaceData, name: e.target.value})}
                                        disabled={!isAdmin}
                                        className={inputClasses + (!isAdmin ? " opacity-60 cursor-not-allowed" : "")} 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClasses}>Description</label>
                                    <textarea 
                                        value={workspaceData.description} 
                                        onChange={e => setWorkspaceData({...workspaceData, description: e.target.value})}
                                        disabled={!isAdmin}
                                        className={inputClasses + " h-24 " + (!isAdmin ? " opacity-60 cursor-not-allowed" : "")}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClasses}>Workspace Logo URL</label>
                                    <input 
                                        type="text" 
                                        value={workspaceData.image_url} 
                                        onChange={e => setWorkspaceData({...workspaceData, image_url: e.target.value})}
                                        disabled={!isAdmin}
                                        placeholder="https://example.com/logo.png"
                                        className={inputClasses + (!isAdmin ? " opacity-60 cursor-not-allowed" : "")} 
                                    />
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                    <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50">
                                        <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {isAdmin && (
                        <div className={cardClasses + " border-red-200 dark:border-red-900/30"}>
                            <div className="p-6 border-b border-red-100 dark:border-red-900/10 bg-red-50/30 dark:bg-red-900/5">
                                <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
                                <p className="text-sm text-red-600/70 dark:text-red-400/60">Irreversible actions for this workspace.</p>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-white">Delete this workspace</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Once deleted, all data will be permanently removed.</p>
                                    </div>
                                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all">
                                        <Trash2 size={16} /> Delete Workspace
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
