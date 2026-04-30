import { ProjectService } from "./project.service.js";

const projectService = new ProjectService();

export class ProjectController {
  async create(req, res) {
    const result = await projectService.createProject(req.body, req.user.id);
    res.status(201).json(result);
  }

  async getMyProjects(req, res) {
    const result = await projectService.getMyProjects(req.user.id);
    res.json(result);
  }

  async addMember(req, res) {
    const result = await projectService.addMember(
      parseInt(req.params.id),
      req.body,
      req.user.id,
    );
    res.json(result);
  }

  async removeMember(req, res) {
    const result = await projectService.removeMember(
      parseInt(req.params.id),
      req.params.userId,
      req.user.id,
    );
    res.json(result);
  }
}
