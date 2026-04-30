import prisma from "../../lib/prisma.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../utils/appError.js";

export class ProjectService {
  async createProject(data, userId) {
    const { name, description } = data;
    if (!name) throw new BadRequestError("Project name is required");

    return await prisma.project.create({
      data: {
        name,
        description,
        memberships: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
      include: {
        memberships: true,
      },
    });
  }

  async getMyProjects(userId) {
    return await prisma.project.findMany({
      where: {
        memberships: {
          some: { userId },
        },
      },
      include: {
        _count: {
          select: { tasks: true, memberships: true },
        },
      },
    });
  }

  async addMember(projectId, { email, role = "MEMBER" }, adminId) {
    // Check if requester is admin/owner of project
    const adminMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: adminId },
      },
    });

    if (!adminMember || !["OWNER", "ADMIN"].includes(adminMember.role)) {
      throw new ForbiddenError("Only project owners or admins can add members");
    }

    const userToAdd = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!userToAdd) throw new NotFoundError("User not found");

    return await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToAdd.id,
        role,
      },
    });
  }

  async removeMember(projectId, userIdToRemove, adminId) {
    const adminMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: adminId },
      },
    });

    if (!adminMember || !["OWNER", "ADMIN"].includes(adminMember.role)) {
      throw new ForbiddenError("Only project owners or admins can remove members");
    }

    return await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId: userIdToRemove },
      },
    });
  }
}
