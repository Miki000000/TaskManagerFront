import { Task } from "../types";
import { formatDate } from "./dateFormatter";

/**
 * Filters tasks based on completion status
 */
export const filterTasksByStatus = (
  tasks: Task[],
  mode: "all" | "completed" | "uncompleted"
): Task[] => {
  if (mode === "completed") {
    return tasks.filter((task) => task.completed === true);
  } else if (mode === "uncompleted") {
    return tasks.filter((task) => task.completed === false);
  }
  return tasks;
};

/**
 * Filters tasks by search query across various fields
 */
export const filterTasksBySearchQuery = (
  tasks: Task[],
  query: string
): Task[] => {
  if (!query.trim()) {
    return tasks;
  }

  const lowercaseQuery = query.toLowerCase().trim();

  return tasks.filter((task) => {
    return (
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description.toLowerCase().includes(lowercaseQuery) ||
      task.attributedUser.toLowerCase().includes(lowercaseQuery) ||
      task.createdBy.toLowerCase().includes(lowercaseQuery) ||
      task.companies.some((company) =>
        company.toLowerCase().includes(lowercaseQuery)
      ) ||
      formatDate(task.creationDate || Date.now().toString())
        .toLowerCase()
        .includes(lowercaseQuery)
    );
  });
};

/**
 * Apply pagination to an array of tasks
 */
export const paginateTasks = (
  tasks: Task[],
  currentPage: number,
  itemsPerPage: number
): Task[] => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return tasks.slice(startIndex, endIndex);
};

/**
 * Calculate total pages based on task count and items per page
 */
export const calculateTotalPages = (
  taskCount: number,
  itemsPerPage: number
): number => {
  return taskCount ? Math.ceil(taskCount / itemsPerPage) : 1;
};
