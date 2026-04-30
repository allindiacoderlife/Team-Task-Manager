import { useState } from "react";
import { XIcon, Building2, Layout, Image as ImageIcon } from "lucide-react";
import { useDispatch } from "react-redux";
import { fetchWorkspaceData } from "../features/workspaceSlice";
import api from "../lib/api";
import toast from "react-hot-toast";

const CreateWorkspaceDialog = ({ isOpen, setIsOpen }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image_url: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post("/workspaces", formData);
            toast.success("Workspace created successfully!");
            dispatch(fetchWorkspaceData());
            setIsOpen(false);
            setFormData({ name: "", description: "", image_url: "" });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to create workspace");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center text-left z-[100]">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 w-full max-w-md text-zinc-900 dark:text-zinc-200 relative shadow-2xl">
                <button 
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition-colors" 
                    onClick={() => setIsOpen(false)} 
                >
                    <XIcon className="size-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Building2 className="size-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Create Workspace</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Collaborate with your team in a new space.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                            Workspace Name
                        </label>
                        <div className="relative">
                            <Layout className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                placeholder="Acme Corp, Design Team, etc." 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" 
                                required 
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                        <textarea 
                            value={formData.description} 
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                            placeholder="What is this workspace for?" 
                            className="w-full px-4 py-3 rounded-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm h-24 resize-none" 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                            Workspace Logo URL
                        </label>
                        <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                            <input 
                                type="text" 
                                value={formData.image_url} 
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} 
                                placeholder="https://example.com/logo.png" 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" 
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={() => setIsOpen(false)} 
                            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-medium transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting || !formData.name} 
                            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:shadow-none text-sm"
                        >
                            {isSubmitting ? "Creating..." : "Create Space"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkspaceDialog;
