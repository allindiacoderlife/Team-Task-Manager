import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { toast } from "react-hot-toast";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const AcceptInvite = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [invitation, setInvitation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvite = async () => {
            try {
                const response = await api.get(`/invitations/${token}`);
                setInvitation(response.data);
                setLoading(false);
            } catch (err) {
                setError("This invitation link is invalid or has expired.");
                setLoading(false);
            }
        };
        if (token) {
            fetchInvite();
        } else {
            setError("No invitation token provided.");
            setLoading(false);
        }
    }, [token]);

    const handleAccept = async () => {
        try {
            setLoading(true);
            const response = await api.post("/invitations/accept", { token });
            const { workspaceId } = response.data;
            
            // Set as current workspace so user sees it immediately
            localStorage.setItem("currentWorkspaceId", workspaceId);
            
            toast.success("Invitation accepted successfully!");
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to accept invitation");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
                <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Invalid Link</h1>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">{error}</p>
                    <button onClick={() => navigate("/")} className="mt-6 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200" >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
            <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Join Team</h1>
                </div>

                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{invitation.invitedBy?.name}</span> has invited you to join the workspace{" "}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {invitation.workspace_rel?.name}
                    </span>
                    {invitation.project && (
                        <>
                            {" "}and the project{" "}
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {invitation.project?.name}
                            </span>
                        </>
                    )}
                    .
                </p>

                <div className="mt-8 space-y-3">
                    <button onClick={handleAccept} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20" >
                        Accept & Join
                    </button>
                    <button onClick={() => navigate("/")} className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors" >
                        Decline
                    </button>
                </div>
                
                <p className="mt-6 text-xs text-center text-zinc-500 dark:text-zinc-500">
                    By joining, you'll have access to collaborate with the team on their projects.
                </p>
            </div>
        </div>
    );
};

export default AcceptInvite;
