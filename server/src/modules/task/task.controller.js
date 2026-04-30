import { TaskService } from "./task.service.js";

const taskService = new TaskService();

export class TaskController {
  async create(req, res) {
    const result = await taskService.createTask(req.body);
    res.status(201).json(result);
  }

  async updateStatus(req, res) {
    const result = await taskService.updateTaskStatus(
      parseInt(req.params.id),
      req.body.status,
      req.user.id,
    );
    res.json(result);
  }

  async getMyTasks(req, res) {
    const result = await taskService.getMyTasks(req.user.id);
    res.json(result);
  }

  async getProjectTasks(req, res) {
    const result = await taskService.getProjectTasks(
      parseInt(req.params.projectId),
      req.user.id,
    );
    res.json(result);
  }
}
