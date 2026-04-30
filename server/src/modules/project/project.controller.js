import { ProjectService } from "./project.service.js";
import { InvitationService } from "../invitation/invitation.service.js";

const projectService = new ProjectService();
const invitationService = new InvitationService();

export class ProjectController {
  async create(req, res) {
    const result = await projectService.createProject(req.body, req.user.id);
    res.status(201).json(result);
  }

  async getMyProjects(req, res) {
    const result = await projectService.getMyProjects(req.user.id);
    res.json(result);
  }

  async update(req, res) {
    const result = await projectService.updateProject(
      req.params.id,
      req.body,
      req.user.id
    );
    res.json(result);
  }

  async addMember(req, res) {
    const result = await invitationService.createProjectInvitation(
      req.params.id,
      req.body,
      req.user.id
    );
    res.json(result);
  }

  async removeMember(req, res) {
    const result = await projectService.removeMember(
      req.params.id,
      req.params.userId,
      req.user.id
    );
    res.json(result);
  }
}
