import prisma from "../../lib/prisma.js";
import { BadRequestError, NotFoundError } from "../../utils/appError.js";

export class CommentService {
  async addComment(taskId, userId, { content }) {
    if (!content) throw new BadRequestError("Comment content is required");

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) throw new NotFoundError("Task not found");

    return await prisma.comment.create({
      data: {
        content,
        userId,
        taskId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  async getTaskComments(taskId) {
    return await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async deleteComment(commentId, userId) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new NotFoundError("Comment not found");
    if (comment.userId !== userId) {
      throw new ForbiddenError("You can only delete your own comments");
    }

    return await prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
