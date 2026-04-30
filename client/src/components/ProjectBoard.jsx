import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import { fetchWorkspaceData } from "../features/workspaceSlice";
import { Calendar, MoreHorizontal, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const COLUMNS = [
    { id: "TODO", title: "To Do", color: "bg-zinc-500" },
    { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-500" },
    { id: "REVIEW", title: "Review", color: "bg-purple-500" },
    { id: "TESTING", title: "Testing", color: "bg-amber-500" },
    { id: "DONE", title: "Done", color: "bg-emerald-500" },
    { id: "BLOCKED", title: "Blocked", color: "bg-red-500" },
];

export default function ProjectBoard({ tasks, projectId }) {
    const dispatch = useDispatch();

    const tasksByStatus = useMemo(() => {
        const grouped = {};
        COLUMNS.forEach(col => grouped[col.id] = []);
        tasks.forEach(task => {
            if (grouped[task.status]) {
                grouped[task.status].push(task);
            }
        });
        return grouped;
    }, [tasks]);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.patch(`/tasks/${taskId}`, { status: newStatus });
            dispatch(fetchWorkspaceData());
            toast.success("Task moved successfully");
        } catch (error) {
            toast.error("Failed to move task");
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar min-h-[600px]">
            {COLUMNS.map((column) => (
                <div key={column.id} className="flex-shrink-0 w-80 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-200 dark:border-zinc-800/50 flex flex-col">
                    {/* Column Header */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${column.color}`} />
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm">
                                {column.title}
                            </h3>
                            <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                {tasksByStatus[column.id]?.length || 0}
                            </span>
                        </div>
                        <button className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors">
                            <MoreHorizontal size={14} className="text-zinc-500" />
                        </button>
                    </div>

                    {/* Column Body */}
                    <div className="flex-1 p-2 space-y-3 overflow-y-auto max-h-[calc(100vh-350px)] no-scrollbar">
                        {tasksByStatus[column.id]?.map((task) => (
                            <div 
                                key={task.id} 
                                className="group bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/30 transition-all cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                                        {task.type}
                                    </span>
                                    {task.priority === "HIGH" && (
                                        <AlertCircle size={14} className="text-red-500" />
                                    )}
                                </div>
                                
                                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-200 mb-3 line-clamp-2">
                                    {task.title}
                                </h4>

                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        <div className="size-6 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                                            {task.assignee ? (
                                                <img 
                                                    src={task.assignee.image_url || `https://ui-avatars.com/api/?name=${task.assignee.name}`} 
                                                    alt={task.assignee.name}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <User size={12} className="text-zinc-400" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {task.due_date && (
                                            <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                                <Calendar size={10} />
                                                {format(new Date(task.due_date), "MMM d")}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions Overlay (Optional/Future) */}
                                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <select 
                                        className="text-[10px] bg-zinc-100 dark:bg-zinc-800 border-none rounded px-2 py-1 outline-none w-full"
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        {COLUMNS.map(col => (
                                            <option key={col.id} value={col.id}>{col.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                        
                        {tasksByStatus[column.id]?.length === 0 && (
                            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800/50 rounded-xl h-24 flex items-center justify-center">
                                <p className="text-[10px] text-zinc-400">No tasks here</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
