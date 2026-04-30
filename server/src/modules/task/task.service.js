import prisma from "../../lib/prisma.js";
import { BadRequestError, NotFoundError, ForbiddenError } from "../../utils/appError.js";

export class TaskService {
  async createTask(data) {
    const { title, description, due_date, priority, projectId, assigneeId, type } = data;
    if (!title || !projectId) {
      throw new BadRequestError("Title and Project ID are required");
    }

    return await prisma.task.create({
      data: {
        title,
        description,
        due_date: due_date ? new Date(due_date) : null,
        priority: priority || "MEDIUM",
        type: type || "TASK",
        projectId,
        assigneeId,
      },
      include: {
        assignee: true,
        project: true
      }
    });
  }

  async updateTask(taskId, data, userId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });

    if (!task) throw new NotFoundError("Task not found");

    // Check if user is member of project or the assignee
    const isMember = task.project.members.some((m) => m.userId === userId);
    if (!isMember && task.assigneeId !== userId && task.project.team_lead !== userId) {
      throw new ForbiddenError("Unauthorized to update this task");
    }

    return await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        type: data.type,
        due_date: data.due_date ? new Date(data.due_date) : undefined,
        assigneeId: data.assigneeId,
      },
      include: {
        assignee: true
      }
    });
  }

  async deleteTask(taskId, userId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) throw new NotFoundError("Task not found");

    if (task.project.team_lead !== userId) {
      throw new ForbiddenError("Only project team leads can delete tasks");
    }

    return await prisma.task.delete({
      where: { id: taskId },
    });
  }

  async getProjectTasks(projectId, userId) {
    // Verify membership
    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    
    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!member && project?.team_lead !== userId) throw new ForbiddenError("Access denied");

    return await prisma.task.findMany({
      where: { projectId },
      include: { 
        assignee: true,
        comments: {
            include: {
                user: true
            }
        }
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getMyTasks(userId) {
    return await prisma.task.findMany({
      where: { assigneeId: userId },
      include: { project: { select: { name: true } } },
      orderBy: { due_date: "asc" },
    });
  }

  async getTaskById(taskId, userId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: true,
        project: {
          include: {
            members: { include: { user: true } },
            teamLead: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!task) throw new NotFoundError("Task not found");

    const isMember = task.project.members.some(m => m.userId === userId);
    if (!isMember && task.project.team_lead !== userId) {
        throw new ForbiddenError("Access denied");
    }

    return task;
  }

  async updateBulkStatus(taskIds, status, userId) {
    if (!taskIds || !Array.isArray(taskIds)) {
      throw new BadRequestError("taskIds must be an array");
    }

    // Verify ownership/membership for all tasks (simplified: check if team lead or member)
    // For now, we'll loop or use a clever where
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
      include: { project: { include: { members: true } } }
    });

    for (const task of tasks) {
      const isMember = task.project.members.some(m => m.userId === userId);
      if (!isMember && task.project.team_lead !== userId) {
        throw new ForbiddenError(`Unauthorized to update task ${task.id}`);
      }
    }

    return await prisma.task.updateMany({
      where: { id: { in: taskIds } },
      data: { status }
    });
  }
}
