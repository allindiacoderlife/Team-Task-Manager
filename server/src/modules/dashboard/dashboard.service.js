import prisma from "../../lib/prisma.js";

export class DashboardService {
  async getStats(userId) {
    const [totalTasks, tasksByStatus, overdueTasks] = await Promise.all([
      prisma.task.count({
        where: {
          OR: [
            { assigneeId: userId },
            { project: { members: { some: { userId } } } },
          ],
        },
      }),
      prisma.task.groupBy({
        by: ["status"],
        where: {
          OR: [
            { assigneeId: userId },
            { project: { members: { some: { userId } } } },
          ],
        },
        _count: true,
      }),
      prisma.task.count({
        where: {
          assigneeId: userId,
          status: { not: "DONE" },
          due_date: { lt: new Date() },
        },
      }),
    ]);

    // Get tasks per user for projects I team lead
    const myManagedProjects = await prisma.project.findMany({
      where: {
        team_lead: userId
      },
      select: { id: true },
    });

    const projectIds = myManagedProjects.map((p) => p.id);
    let tasksPerUser = [];

    if (projectIds.length > 0) {
      tasksPerUser = await prisma.task.groupBy({
        by: ["assigneeId"],
        where: { projectId: { in: projectIds } },
        _count: true,
      });
    }

    return {
      totalTasks,
      statusBreakdown: tasksByStatus,
      overdueTasks,
      tasksPerUser,
    };
  }
}
