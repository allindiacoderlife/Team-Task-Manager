import { TaskService } from "./task.service.js";

const taskService = new TaskService();

export class TaskController {
  async create(req, res) {
    const result = await taskService.createTask(req.body);
    res.status(201).json(result);
  }

  async update(req, res) {
    const result = await taskService.updateTask(
      req.params.id,
      req.body,
      req.user.id
    );
    res.json(result);
  }

  async delete(req, res) {
    const result = await taskService.deleteTask(req.params.id, req.user.id);
    res.json(result);
  }

  async getProjectTasks(req, res) {
    const result = await taskService.getProjectTasks(
      req.params.projectId,
      req.user.id
    );
    res.json(result);
  }

  async getMyTasks(req, res) {
    const result = await taskService.getMyTasks(req.user.id);
    res.json(result);
  }

  async getById(req, res) {
    const result = await taskService.getTaskById(req.params.id, req.user.id);
    res.json(result);
  }

  async updateBulkStatus(req, res) {
    const { taskIds, status } = req.body;
    const result = await taskService.updateBulkStatus(taskIds, status, req.user.id);
    res.json(result);
  }
}
