import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/api";

export const fetchWorkspaceData = createAsyncThunk(
    "workspace/fetchWorkspaceData",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/workspaces/my");
            return response.data || [];
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createProjectData = createAsyncThunk(
    "workspace/createProjectData",
    async (projectData, { rejectWithValue }) => {
        try {
            const response = await api.post("/projects", projectData);
            return response.data; // The newly created project
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createTaskData = createAsyncThunk(
    "workspace/createTaskData",
    async (taskData, { rejectWithValue }) => {
        try {
            const response = await api.post("/tasks", taskData);
            return response.data; // The newly created task
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const removeMemberData = createAsyncThunk(
    "workspace/removeMemberData",
    async ({ workspaceId, memberId }, { rejectWithValue }) => {
        try {
            await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
            return { workspaceId, memberId };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const removeProjectMemberData = createAsyncThunk(
    "workspace/removeProjectMemberData",
    async ({ projectId, userId }, { rejectWithValue }) => {
        try {
            await api.delete(`/projects/${projectId}/members/${userId}`);
            return { projectId, userId };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    loading: true,
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setWorkspaces: (state, action) => {
            state.workspaces = action.payload;
        },
        setCurrentWorkspace: (state, action) => {
            localStorage.setItem("currentWorkspaceId", action.payload);
            state.currentWorkspace = state.workspaces.find((w) => w.id === action.payload);
        },
        addWorkspace: (state, action) => {
            state.workspaces.push(action.payload);

            // set current workspace to the new workspace
            if (state.currentWorkspace?.id !== action.payload.id) {
                state.currentWorkspace = action.payload;
            }
        },
        updateWorkspace: (state, action) => {
            state.workspaces = state.workspaces.map((w) =>
                w.id === action.payload.id ? action.payload : w
            );

            // if current workspace is updated, set it to the updated workspace
            if (state.currentWorkspace?.id === action.payload.id) {
                state.currentWorkspace = action.payload;
            }
        },
        deleteWorkspace: (state, action) => {
            state.workspaces = state.workspaces.filter((w) => w._id !== action.payload);
        },
        addProject: (state, action) => {
            state.currentWorkspace.projects.push(action.payload);
            // find workspace by id and add project to it
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id ? { ...w, projects: w.projects.concat(action.payload) } : w
            );
        },
        addTask: (state, action) => {

            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                console.log(p.id, action.payload.projectId, p.id === action.payload.projectId);
                if (p.id === action.payload.projectId) {
                    p.tasks.push(action.payload);
                }
                return p;
            });

            // find workspace and project by id and add task to it
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id ? {
                    ...w, projects: w.projects.map((p) =>
                        p.id === action.payload.projectId ? { ...p, tasks: p.tasks.concat(action.payload) } : p
                    )
                } : w
            );
        },
        updateTask: (state, action) => {
            state.currentWorkspace.projects.map((p) => {
                if (p.id === action.payload.projectId) {
                    p.tasks = p.tasks.map((t) =>
                        t.id === action.payload.id ? action.payload : t
                    );
                }
            });
            // find workspace and project by id and update task in it
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id ? {
                    ...w, projects: w.projects.map((p) =>
                        p.id === action.payload.projectId ? {
                            ...p, tasks: p.tasks.map((t) =>
                                t.id === action.payload.id ? action.payload : t
                            )
                        } : p
                    )
                } : w
            );
        },
        deleteTask: (state, action) => {
            state.currentWorkspace.projects.map((p) => {
                p.tasks = p.tasks.filter((t) => !action.payload.includes(t.id));
                return p;
            });
            // find workspace and project by id and delete task from it
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id ? {
                    ...w, projects: w.projects.map((p) =>
                        p.id === action.payload.projectId ? {
                            ...p, tasks: p.tasks.filter((t) => !action.payload.includes(t.id))
                        } : p
                    )
                } : w
            );
        },
        removeMember: (state, action) => {
            const { memberId } = action.payload;
            if (state.currentWorkspace) {
                state.currentWorkspace.members = state.currentWorkspace.members.filter(m => m.userId !== memberId);
            }
            state.workspaces = state.workspaces.map(w => ({
                ...w,
                members: w.members.filter(m => m.userId !== memberId)
            }));
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkspaceData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWorkspaceData.fulfilled, (state, action) => {
                state.loading = false;
                state.workspaces = action.payload;
                // Keep existing currentWorkspace ID if possible, otherwise use the first workspace
                const currentId = localStorage.getItem("currentWorkspaceId");
                const found = action.payload.find((w) => w.id === currentId);
                state.currentWorkspace = found || action.payload[0];
                if (!found && action.payload[0]) {
                    localStorage.setItem("currentWorkspaceId", action.payload[0].id);
                }
            })
            .addCase(fetchWorkspaceData.rejected, (state, action) => {
                state.loading = false;
                console.error("Failed to fetch workspace data:", action.payload);
            })
            .addCase(createProjectData.fulfilled, (state, action) => {
                const newProject = action.payload;
                // Add an empty tasks array to match the expected format
                newProject.tasks = [];
                if (state.currentWorkspace) {
                    state.currentWorkspace.projects.push(newProject);
                }
                const mainWorkspace = state.workspaces.find(w => w.id === "main-workspace-1");
                if (mainWorkspace) {
                    mainWorkspace.projects.push(newProject);
                }
            })
            .addCase(createTaskData.fulfilled, (state, action) => {
                const newTask = action.payload;
                const projectId = newTask.projectId;
                
                if (state.currentWorkspace) {
                    const project = state.currentWorkspace.projects.find(p => p.id === projectId);
                    if (project) {
                        project.tasks.push(newTask);
                    }
                }
                const mainWorkspace = state.workspaces.find(w => w.id === "main-workspace-1");
                if (mainWorkspace) {
                    const project = mainWorkspace.projects.find(p => p.id === projectId);
                    if (project) {
                        project.tasks.push(newTask);
                    }
                }
            })
            .addCase(removeMemberData.fulfilled, (state, action) => {
                const { memberId } = action.payload;
                if (state.currentWorkspace) {
                    state.currentWorkspace.members = state.currentWorkspace.members.filter(m => m.userId !== memberId);
                }
                state.workspaces = state.workspaces.map(w => ({
                    ...w,
                    members: w.members.filter(m => m.userId !== memberId)
                }));
            })
            .addCase(removeProjectMemberData.fulfilled, (state, action) => {
                const { projectId, userId } = action.payload;
                if (state.currentWorkspace) {
                    const project = state.currentWorkspace.projects.find(p => p.id === projectId);
                    if (project) {
                        project.members = project.members.filter(m => m.userId !== userId);
                    }
                }
                state.workspaces = state.workspaces.map(w => ({
                    ...w,
                    projects: w.projects.map(p => 
                        p.id === projectId 
                        ? { ...p, members: p.members.filter(m => m.userId !== userId) } 
                        : p
                    )
                }));
            });
    }
});

export const { setWorkspaces, setCurrentWorkspace, addWorkspace, updateWorkspace, deleteWorkspace, addProject, addTask, updateTask, deleteTask } = workspaceSlice.actions;
export default workspaceSlice.reducer;