import { format } from "date-fns";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarIcon, MessageCircle, PenIcon } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const TaskDetails = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const taskId = searchParams.get("taskId");

    const [task, setTask] = useState(null);
    const [project, setProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        try {
            const response = await api.get(`/comments/${taskId}`);
            setComments(response.data);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        }
    };

    const fetchTaskDetails = async () => {
        setLoading(true);
        if (!taskId) return;

        try {
            const response = await api.get(`/tasks/${taskId}`);
            const tsk = response.data;
            setTask(tsk);
            setProject(tsk.project);
            setComments(tsk.comments || []);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch task details:", error);
            toast.error("Failed to load task details");
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            toast.loading("Adding comment...");
            const response = await api.post(`/comments/${taskId}`, { content: newComment });
            
            setComments((prev) => [response.data, ...prev]);
            setNewComment("");
            toast.dismissAll();
            toast.success("Comment added.");
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.response?.data?.message || error.message);
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTaskDetails();
    }, [taskId]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
    );
    
    if (!task) return <div className="text-red-500 px-4 py-6 text-center">Task not found.</div>;

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-6 sm:p-4 text-zinc-900 dark:text-zinc-100 max-w-6xl mx-auto">
            {/* Left: Comments / Chatbox */}
            <div className="w-full lg:w-2/3">
                <div className="p-5 rounded-md border border-zinc-300 dark:border-zinc-800 flex flex-col lg:h-[80vh]">
                    <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-zinc-900 dark:text-white">
                        <MessageCircle className="size-5" /> Task Discussion ({comments.length})
                    </h2>

                    <div className="flex-1 md:overflow-y-scroll no-scrollbar">
                        {comments.length > 0 ? (
                            <div className="flex flex-col gap-4 mb-6 mr-2">
                                {comments.map((comment) => (
                                    <div key={comment.id} className={`sm:max-w-[80%] dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900 border border-zinc-300 dark:border-zinc-700 p-3 rounded-md ${comment.userId === user?.id ? "ml-auto" : "mr-auto"}`} >
                                        <div className="flex items-center gap-2 mb-1 text-sm text-zinc-500 dark:text-zinc-400">
                                            <img src={comment.user?.image || `https://ui-avatars.com/api/?name=${comment.user?.name}`} alt="avatar" className="size-5 rounded-full" />
                                            <span className="font-medium text-zinc-900 dark:text-white">{comment.user?.name}</span>
                                            <span className="text-xs text-zinc-400 dark:text-zinc-600">
                                                • {format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm")}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-900 dark:text-zinc-200">{comment.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-600 dark:text-zinc-500 mb-4 text-sm">No comments yet. Be the first!</p>
                        )}
                    </div>

                    {/* Add Comment */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md p-2 text-sm text-zinc-900 dark:text-zinc-200 resize-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                            rows={3}
                        />
                        <button onClick={handleAddComment} className="bg-gradient-to-br from-blue-500 to-blue-600 transition-colors text-white text-sm px-6 py-2.5 rounded font-medium shadow-lg shadow-blue-500/20" >
                            Post
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Task + Project Info */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
                {/* Task Info */}
                <div className="p-5 rounded-md bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 shadow-sm">
                    <div className="mb-3">
                        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{task.title}</h1>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                                {task.status}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                {task.type}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                                {task.priority}
                            </span>
                        </div>
                    </div>

                    {task.description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 mt-4">{task.description}</p>
                    )}

                    <hr className="border-zinc-200 dark:border-zinc-800 my-4" />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Assignee</span>
                            <div className="flex items-center gap-2 font-medium">
                                <img src={task.assignee?.image || `https://ui-avatars.com/api/?name=${task.assignee?.name}`} className="size-5 rounded-full" alt="avatar" />
                                {task.assignee?.name || "Unassigned"}
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Due Date</span>
                            <div className="flex items-center gap-2 font-medium">
                                <CalendarIcon className="size-4 text-zinc-400" />
                                {task.due_date ? format(new Date(task.due_date), "dd MMM yyyy") : "No date"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Info */}
                {project && (
                    <div className="p-5 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-800 shadow-sm">
                        <h2 className="text-sm font-bold flex items-center gap-2 mb-4 text-zinc-500 uppercase tracking-widest"> 
                             Project Info
                        </h2>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded bg-indigo-500/10 text-indigo-500">
                                <PenIcon className="size-4" />
                            </div>
                            <span className="font-bold">{project.name}</span>
                        </div>
                        
                        <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                            <div className="flex justify-between">
                                <span>Status</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-200">{project.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Progress</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-200">{project.progress}%</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetails;
