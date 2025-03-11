import { Task } from "../types";
import { RequestHandler } from "./RequestHandler";
import { Navigator } from "@solidjs/router";

type UserResponse = { username: string }[];

export class TaskService {
  static async updateTaskCompletion(
    taskId: number | undefined,
    completed: boolean,
    token: string,
    navigate: Navigator,
    errorHandler: (error: string) => void
  ): Promise<Task | null> {
    if (!taskId) return null;

    return await RequestHandler<Task>({
      route: `api/task/${taskId}`,
      method: "PATCH",
      data: { completed: completed },
      authorization: token,
      navigate: navigate,
      fallback: errorHandler,
    });
  }

  static getEndpointForRelationship(
    relationship: "all" | "related" | "created" | "attributed"
  ): string {
    switch (relationship) {
      case "related":
        return "api/task";
      case "created":
        return "api/task/created";
      case "attributed":
        return "api/task/attributed";
      default:
        return "api/task";
    }
  }

  static async fetchUsernames(
    token: string,
    navigate: Navigator,
    errorHandler: (error: string) => void
  ): Promise<string[]> {
    const response = await RequestHandler<UserResponse>({
      route: "api/user/usernames",
      method: "GET",
      authorization: token,
      navigate: navigate,
      fallback: errorHandler,
    });

    if (response) {
      return response.map((user) => user.username);
    }
    return [];
  }

  static getEndpointForUsername(username: string): string {
    return `api/task/username/${username}`;
  }
}
