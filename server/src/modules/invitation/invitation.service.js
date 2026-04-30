import prisma from "../../lib/prisma.js";
import crypto from "crypto";
import { BadRequestError, NotFoundError } from "../../utils/appError.js";
import { transporter, projectInvitationTemplate, workspaceInvitationTemplate } from "../../lib/mailer.js";
import { config } from "../../config/app.config.js";

export class InvitationService {
  async createWorkspaceInvitation(workspaceId, { email, role }, inviterId) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { owner: true }
    });
    if (!workspace) throw new NotFoundError("Workspace not found");

    const invitation = await prisma.invitation.create({
      data: {
        email: email.toLowerCase(),
        workspaceId,
        role: role || "MEMBER",
        token,
        invitedById: inviterId,
        expiresAt,
      },
      include: { invitedBy: true }
    });

    const inviteLink = `${config.appUrl}/invite?token=${token}&type=workspace`;

    // Send email
    try {
      await transporter.sendMail({
        from: `"Team Task Manager" <${config.smtp.user}>`,
        to: email,
        subject: `Invitation to join workspace: ${workspace.name}`,
        html: workspaceInvitationTemplate(workspace.name, email, invitation.invitedBy.name, inviteLink),
      });
    } catch (error) {
      console.error("❌ Email error:", error);
    }

    return invitation;
  }

  async createProjectInvitation(projectId, { email, role }, inviterId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: true, teamLead: true }
    });
    if (!project) throw new NotFoundError("Project not found");

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: {
        email: email.toLowerCase(),
        workspaceId: project.workspaceId,
        projectId,
        role: role || "MEMBER",
        token,
        invitedById: inviterId,
        expiresAt,
      },
      include: { invitedBy: true }
    });

    const inviteLink = `${config.appUrl}/invite?token=${token}&type=project`;

    // Send email
    try {
      await transporter.sendMail({
        from: `"Team Task Manager" <${config.smtp.user}>`,
        to: email,
        subject: `Invitation to join project: ${project.name}`,
        html: projectInvitationTemplate(project.name, email, invitation.invitedBy.name, inviteLink),
      });
    } catch (error) {
        console.error("❌ Email error:", error);
    }

    return invitation;
  }

  async acceptInvitation(token, userId) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { workspace_rel: true, project: true }
    });

    if (!invitation) throw new NotFoundError("Invitation not found");
    if (invitation.status !== "PENDING") throw new BadRequestError("Invitation already processed");
    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({ where: { id: invitation.id }, data: { status: "EXPIRED" } });
      throw new BadRequestError("Invitation expired");
    }

    // Check if user matches email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");
    
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new BadRequestError("This invitation is for a different email address");
    }

    // Add to workspace
    await prisma.workspaceMember.upsert({
      where: { userId_workspaceId: { userId, workspaceId: invitation.workspaceId } },
      create: { userId, workspaceId: invitation.workspaceId, role: "MEMBER" },
      update: {}
    });

    // Add to project if applicable
    if (invitation.projectId) {
      await prisma.projectMember.upsert({
        where: { userId_projectId: { userId, projectId: invitation.projectId } },
        create: { userId, projectId: invitation.projectId },
        update: {}
      });
    }

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" }
    });

    return { success: true, workspaceId: invitation.workspaceId, projectId: invitation.projectId };
  }

  async getInvitationByToken(token) {
    const invitation = await prisma.invitation.findUnique({
        where: { token },
        include: { 
            workspace_rel: true,
            project: true, 
            invitedBy: true
        }
    });
    if (!invitation) throw new NotFoundError("Invitation not found");
    return invitation;
  }
}
