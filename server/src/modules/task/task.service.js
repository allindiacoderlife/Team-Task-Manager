import prisma from "../../lib/prisma.js";
import { BadRequestError, NotFoundError } from "../../utils/appError.js";

export class TaskService {
  async createTask(data) {
    const { title, description, dueDate, priority, projectId, assigneeId } = data;
    if (!title || !projectId) {
      throw new BadRequestError("Title and Project ID are required");
    }

    return await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        projectId,
        assigneeId,
      },
    });
  }

  async updateTaskStatus(taskId, status, userId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { memberships: true } } },
    });

    if (!task) throw new NotFoundError("Task not found");

    // Check if user is member of project or the assignee
    const isMember = task.project.memberships.some((m) => m.userId === userId);
    if (!isMember && task.assigneeId !== userId) {
      throw new BadRequestError("Unauthorized to update this task");
    }

    return await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  }

  async getProjectTasks(projectId, userId) {
    // Verify membership
    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    if (!member) throw new BadRequestError("Access denied");

    return await prisma.task.findMany({
      where: { projectId },
      include: { assignee: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async getMyTasks(userId) {
    return await prisma.task.findMany({
      where: { assigneeId: userId },
      include: { project: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
    });
  }
}
