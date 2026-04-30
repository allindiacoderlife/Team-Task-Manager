import prisma from "../../lib/prisma.js";
import { BadRequestError, NotFoundError, ForbiddenError } from "../../utils/appError.js";
import { transporter, workspaceInvitationTemplate } from "../../lib/mailer.js";
import { config } from "../../config/app.config.js";

export class WorkspaceService {
  async createWorkspace(data, userId) {
    const { name, slug, description, image_url } = data;
    if (!name || !slug) {
      throw new BadRequestError("Name and slug are required");
    }

    const existingWorkspace = await prisma.workspace.findUnique({
      where: { slug },
    });
    if (existingWorkspace) {
      throw new BadRequestError("Workspace with this slug already exists");
    }

    return await prisma.workspace.create({
      data: {
        name,
        slug,
        description,
        image_url,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: "ADMIN",
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async getUserWorkspaces(userId) {
    return await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        projects: {
          include: {
            tasks: true,
            members: true,
            _count: {
              select: { tasks: true }
            }
          }
        },
        members: {
            include: {
                user: true
            }
        },
        owner: true
      },
    });
  }

  async getWorkspaceById(id, userId) {
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        projects: true,
        members: {
            include: {
                user: true
            }
        },
      },
    });

    if (!workspace) throw new NotFoundError("Workspace not found");

    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenError("Access denied");

    return workspace;
  }

  async addMember(workspaceId, { email, role = "MEMBER" }, adminId) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { 
        members: true,
        owner: true, // Need this for the email
      },
    });

    if (!workspace) throw new NotFoundError("Workspace not found");

    const isAdmin = workspace.members.some((m) => m.userId === adminId && m.role === "ADMIN");
    if (!isAdmin && workspace.ownerId !== adminId) {
      throw new ForbiddenError("Only workspace admins can add members");
    }

    const userToAdd = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!userToAdd) throw new NotFoundError("User not found");

    const existingMember = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: userToAdd.id, workspaceId } }
    });

    if (existingMember) throw new BadRequestError("User is already a member of this workspace");

    const newMember = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: userToAdd.id,
        role: role.replace("org:", "").toUpperCase(), // handle frontend roles like org:admin
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
        subject: `You've been added to workspace: ${workspace.name}`,
        html: workspaceInvitationTemplate(
          workspace.name,
          userToAdd.name,
          workspace.owner?.name || "The workspace owner"
        ),
      });
    } catch (emailError) {
      console.error("❌ Failed to send workspace invitation email:", emailError);
    }

    return newMember;
  }
}
