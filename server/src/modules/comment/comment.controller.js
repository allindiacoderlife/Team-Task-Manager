import { CommentService } from "./comment.service.js";

const commentService = new CommentService();

export class CommentController {
  async add(req, res) {
    const result = await commentService.addComment(
      req.params.taskId,
      req.user.id,
      req.body
    );
    res.status(201).json(result);
  }

  async getByTask(req, res) {
    const result = await commentService.getTaskComments(req.params.taskId);
    res.json(result);
  }

  async delete(req, res) {
    const result = await commentService.deleteComment(
      req.params.id,
      req.user.id
    );
    res.json(result);
  }
}
