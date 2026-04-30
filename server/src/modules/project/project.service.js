import prisma from "../../lib/prisma.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../utils/appError.js";
import { transporter, projectInvitationTemplate } from "../../lib/mailer.js";
import { config } from "../../config/app.config.js";

export class ProjectService {
  async createProject(data, userId) {
    const { name, description, workspaceId, priority, status, start_date, end_date } = data;
    if (!name) throw new BadRequestError("Project name is required");
    if (!workspaceId) throw new BadRequestError("Workspace ID is required");

    return await prisma.project.create({
      data: {
        name,
        description,
        workspaceId,
        priority: priority || "MEDIUM",
        status: status || "ACTIVE",
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        team_lead: userId,
        members: {
          create: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        workspace: true
      },
    });
  }

  async getMyProjects(userId) {
    // Get all workspace IDs the user belongs to
    const userWorkspaces = await prisma.workspaceMember.findMany({
      where: { userId },
      select: { workspaceId: true }
    });
    const workspaceIds = userWorkspaces.map(w => w.workspaceId);

    return await prisma.project.findMany({
      where: {
        OR: [
          { workspaceId: { in: workspaceIds } },
          { team_lead: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        tasks: {
          include: {
            assignee: true
          }
        },
        members: {
          include: {
            user: true
          }
        },
        _count: {
          select: { tasks: true, members: true },
        },
      },
    });
  }

  async addMember(projectId, { email }, adminId) {
    // Check if requester is team lead of project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        teamLead: true, // Need this for the email
      },
    });

    if (!project) throw new NotFoundError("Project not found");
    if (project.team_lead !== adminId) {
      throw new ForbiddenError("Only project team leads can add members");
    }

    const userToAdd = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!userToAdd) throw new NotFoundError("User not found");

    const newMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToAdd.id,
      },
      include: {
        user: true,
      },
    });

    // Send invitation email
    try {
      await transporter.sendMail({
        from: `"Team Task Manager" <${config.smtp.user}>`,
        to: userToAdd.email,
        subject: `You've been added to project: ${project.name}`,
        html: projectInvitationTemplate(
          project.name,
          userToAdd.name,
          project.teamLead?.name || "Your team lead"
        ),
      });
    } catch (emailError) {
      console.error("❌ Failed to send project invitation email:", emailError);
      // We don't throw here to avoid failing the whole request if email fails
    }

    return newMember;
  }

  async removeMember(projectId, userIdToRemove, adminId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new NotFoundError("Project not found");
    if (project.team_lead !== adminId && adminId !== userIdToRemove) {
      throw new ForbiddenError("You don't have permission to remove this member");
    }

    return await prisma.projectMember.delete({
      where: {
        userId_projectId: { projectId, userId: userIdToRemove },
      },
    });
  }

  async updateProject(projectId, data, userId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new NotFoundError("Project not found");
    if (project.team_lead !== userId) {
      throw new ForbiddenError("Only project team leads can update project settings");
    }

    return await prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        start_date: data.start_date ? new Date(data.start_date) : undefined,
        end_date: data.end_date ? new Date(data.end_date) : undefined,
        progress: data.progress,
      },
    });
  }
}
