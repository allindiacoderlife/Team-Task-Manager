import { WorkspaceService } from "./workspace.service.js";
import { InvitationService } from "../invitation/invitation.service.js";

const workspaceService = new WorkspaceService();
const invitationService = new InvitationService();

export class WorkspaceController {
  async create(req, res) {
    const result = await workspaceService.createWorkspace(req.body, req.user.id);
    res.status(201).json(result);
  }

  async getMyWorkspaces(req, res) {
    const result = await workspaceService.getUserWorkspaces(req.user.id);
    res.json(result);
  }

  async getById(req, res) {
    const result = await workspaceService.getWorkspaceById(req.params.id, req.user.id);
    res.json(result);
  }

  async addMember(req, res) {
    const result = await invitationService.createWorkspaceInvitation(
      req.params.id,
      req.body,
      req.user.id
    );
    res.json(result);
  }

  async removeMember(req, res) {
    const result = await workspaceService.removeMember(
      req.params.id,
      req.params.memberId,
      req.user.id
    );
    res.json(result);
  }
}
