import { InvitationService } from "./invitation.service.js";

const invitationService = new InvitationService();

export class InvitationController {
  async inviteToWorkspace(req, res) {
    const result = await invitationService.createWorkspaceInvitation(
      req.params.workspaceId,
      req.body,
      req.user.id
    );
    res.json(result);
  }

  async inviteToProject(req, res) {
    const result = await invitationService.createProjectInvitation(
      req.params.projectId,
      req.body,
      req.user.id
    );
    res.json(result);
  }

  async acceptInvitation(req, res) {
    const { token } = req.body;
    const result = await invitationService.acceptInvitation(token, req.user.id);
    res.json(result);
  }

  async getInvitation(req, res) {
    const result = await invitationService.getInvitationByToken(req.params.token);
    res.json(result);
  }
}
