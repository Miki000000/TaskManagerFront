import { type Component, createSignal, onMount, createEffect } from "solid-js";
import { useDecode } from "../hooks/useDecode";
import type { Task } from "../types";
import TaskModal from "./TaskModal";
import ErrorModal from "./ErrorModal";
import TaskCard from "./TaskCard";
import { useTableData } from "../hooks/useTableData";
import { useNavigate } from "@solidjs/router";
import { TaskService } from "../shared/TaskService";
import {
  filterTasksByStatus,
  filterTasksBySearchQuery,
  paginateTasks,
  calculateTotalPages,
} from "../utils/taskUtils";
import { formatDate } from "~/utils/dateFormatter";
import AdminViewOptions, { ViewOption } from "./AdminViewOptions";

const TaskTable: Component = () => {
  const [decoder, getUsername] = useDecode();
  const [isAdmin, setAdmin] = createSignal(false);
  const [currentUsername, setCurrentUsername] = createSignal("");
  const [endpoint, setEndpoint] = createSignal("api/task");
  const navigate = useNavigate();
  let dropdownRef: HTMLDetailsElement | undefined;
  let relationshipDropdownRef: HTMLDetailsElement | undefined;

  const [allTasks, setAllTasks] = createSignal<Task[]>([]);
  const [displayedTasks, setDisplayedTasks] = createSignal<Task[]>([]);
  const [filterMode, setFilterMode] = createSignal<
    "all" | "completed" | "uncompleted"
  >("uncompleted");
  const [relationshipFilter, setRelationshipFilter] = createSignal<
    "all" | "related" | "created" | "attributed"
  >("all");

  const {
    data: tasks,
    errorMessage,
    fetchData: fetchTasks,
    setEndpoint: updateEndpoint,
  } = useTableData<Task>(endpoint());

  const [currentPage, setCurrentPage] = createSignal(1);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedItem, setSelectedItem] = createSignal<Task | null>(null);
  const itemsPerPage = 20;

  const [errorModalMessage, setErrorModalMessage] = createSignal("");

  const [usernames, setUsernames] = createSignal<string[]>([]);
  const [selectedUsername, setSelectedUsername] = createSignal("");
  const [isLoadingUsernames, setIsLoadingUsernames] = createSignal(false);

  const updateFiltersAndFetch = () => {
    const newEndpoint = TaskService.getEndpointForRelationship(
      relationshipFilter()
    );
    setEndpoint(newEndpoint);
    updateEndpoint(newEndpoint);
    fetchTasks();
  };

  const handleEndpointChange = (mode: "all" | "completed" | "uncompleted") => {
    setFilterMode(mode);
    setCurrentPage(1);
    applyFilters();
    dropdownRef?.removeAttribute("open");
  };

  const handleRelationshipChange = (
    relationship: "all" | "related" | "created" | "attributed"
  ) => {
    setRelationshipFilter(relationship);
    setCurrentPage(1);
    updateFiltersAndFetch();
    relationshipDropdownRef?.removeAttribute("open");
  };

  const applyFilters = () => {
    let filtered = [...allTasks()];
    filtered = filterTasksByStatus(filtered, filterMode());
    filtered = filterTasksBySearchQuery(filtered, searchQuery());
    setDisplayedTasks(filtered);
  };

  createEffect(() => {
    const fetchedTasks = tasks();
    if (fetchedTasks && Array.isArray(fetchedTasks)) {
      setAllTasks(fetchedTasks);
      applyFilters();
    }
  });

  createEffect(() => {
    const mode = filterMode();
    const query = searchQuery();
    const taskCount = allTasks().length;

    if (taskCount > 0) {
      applyFilters();
    }
  });

  onMount(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const isUserAdmin = decoder(token).info.role === "ADMIN";
      console.log("TaskTable - User is admin:", isUserAdmin); // Add debug log
      setAdmin(isUserAdmin);
      setCurrentUsername(getUsername(token));
      fetchTasks();

      if (isUserAdmin) {
        fetchUsernames();
      }
    }
  });

  const updateTaskCompletion = async (
    taskId: number | undefined,
    completed: boolean
  ) => {
    const token = localStorage.getItem("authToken") || "";
    const response = await TaskService.updateTaskCompletion(
      taskId,
      completed,
      token,
      navigate,
      (errorMsg) => {
        setErrorModalMessage(errorMsg);
        const errorDialog = document.getElementById(
          "error_modal"
        ) as HTMLDialogElement;
        if (errorDialog) {
          errorDialog.showModal();
        }
      }
    );

    if (response) {
      fetchTasks();
    }
  };

  const fetchUsernames = async () => {
    if (usernames().length > 0) return;

    setIsLoadingUsernames(true);
    const token = localStorage.getItem("authToken") || "";

    try {
      const fetchedUsernames = await TaskService.fetchUsernames(
        token,
        navigate,
        (errorMsg) => {
          setErrorModalMessage(errorMsg);
          const errorDialog = document.getElementById(
            "error_modal"
          ) as HTMLDialogElement;
          if (errorDialog) {
            errorDialog.showModal();
          }
        }
      );

      setUsernames(fetchedUsernames);
    } finally {
      setIsLoadingUsernames(false);
    }
  };

  const handleUsernameSearch = () => {
    const username = selectedUsername();
    if (!username) return;

    const newEndpoint = TaskService.getEndpointForUsername(username);
    setEndpoint(newEndpoint);
    updateEndpoint(newEndpoint);
    setFilterMode("all");
    setRelationshipFilter("all");
    setCurrentPage(1);
    fetchTasks();
  };

  const getCurrentItems = () => {
    return paginateTasks(displayedTasks(), currentPage(), itemsPerPage);
  };

  const totalPages = () => {
    return calculateTotalPages(displayedTasks().length, itemsPerPage);
  };

  const canCompleteTask = (task: Task): boolean => {
    return task.attributedUser === currentUsername() || isAdmin();
  };

  const adminViewOptions: ViewOption[] = [
    { label: "My Tasks", endpoint: "uncompleted" },
    { label: "All Tasks", endpoint: "all" },
  ];

  const handleAdminEndpointChange = (option: string) => {
    handleEndpointChange(option as "all" | "completed" | "uncompleted");
  };

  return (
    <>
      <ErrorModal message={errorModalMessage() || errorMessage()} />
      {selectedItem() && (
        <TaskCard data={selectedItem()} onClose={() => setSelectedItem(null)} />
      )}
      <div class="flex flex-col h-[calc(100vh-12rem)]">
        <div class="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search by title, description, user or company..."
            class="input input-bordered w-full sm:w-[20rem]"
            value={searchQuery()}
            onInput={(e) => {
              setSearchQuery(e.currentTarget.value);
              setCurrentPage(1);
            }}
          />

          {isAdmin() && (
            <div class="flex gap-2 items-center">
              <div class="relative">
                <input
                  type="text"
                  class="input input-bordered w-[15rem]"
                  placeholder="Search by user"
                  value={selectedUsername()}
                  onInput={(e) => setSelectedUsername(e.currentTarget.value)}
                  onClick={fetchUsernames}
                  list="usernames-list"
                />
                <datalist id="usernames-list">
                  {usernames().map((username) => (
                    <option value={username} />
                  ))}
                </datalist>
                {isLoadingUsernames() && (
                  <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span class="loading loading-spinner loading-xs"></span>
                  </div>
                )}
              </div>
              <button
                class="btn btn-sm btn-primary"
                onClick={handleUsernameSearch}
                disabled={!selectedUsername()}
              >
                Search
              </button>
            </div>
          )}

          <div class="flex gap-2">
            <details class="dropdown dropdown-end" ref={dropdownRef}>
              <summary role="button" class="btn w-[10rem]">
                Status Filter
              </summary>
              <ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-sm">
                <li>
                  <a onClick={() => handleEndpointChange("uncompleted")}>
                    Uncompleted Tasks
                  </a>
                </li>
                <li>
                  <a onClick={() => handleEndpointChange("completed")}>
                    Completed Tasks
                  </a>
                </li>
                <li>
                  <a onClick={() => handleEndpointChange("all")}>All Tasks</a>
                </li>
              </ul>
            </details>

            <details
              class="dropdown dropdown-end"
              ref={relationshipDropdownRef}
            >
              <summary role="button" class="btn w-[10rem]">
                Relationship
              </summary>
              <ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-sm">
                <li>
                  <a onClick={() => handleRelationshipChange("all")}>
                    All Tasks
                  </a>
                </li>
                <li>
                  <a onClick={() => handleRelationshipChange("related")}>
                    Relacionado a mim
                  </a>
                </li>
                <li>
                  <a onClick={() => handleRelationshipChange("created")}>
                    Criado por mim
                  </a>
                </li>
                <li>
                  <a onClick={() => handleRelationshipChange("attributed")}>
                    Atribuido a mim
                  </a>
                </li>
              </ul>
            </details>

            <AdminViewOptions
              isAdmin={isAdmin()}
              options={adminViewOptions}
              onEndpointChange={handleAdminEndpointChange}
              dropdownRef={(el) => (dropdownRef = el)}
              buttonLabel="View Options"
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto overflow-x-auto">
          <table class="table table-pin-rows">
            <thead>
              <tr>
                <th class="w-[5%]">Status</th>
                <th class="w-[12%]">Title</th>
                <th class="w-[18%]">Description</th>
                <th class="w-[12%]">Companies</th>
                <th class="w-[10%]">Assigned To</th>
                <th class="w-[10%]">Created By</th>
                <th class="w-[8%]">Created</th>
                <th class="w-[8%]">Completed</th>
                <th class="w-[5%]">Edit</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentItems().map((item) => (
                <tr
                  class="hover:bg-base-200 cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <td onClick={(e) => e.stopPropagation()} class="text-center">
                    {canCompleteTask(item) ? (
                      <input
                        type="checkbox"
                        checked={item.completed}
                        class="checkbox"
                        onChange={() =>
                          updateTaskCompletion(item.id, !item.completed)
                        }
                      />
                    ) : (
                      <div class="badge badge-outline">
                        {item.completed ? "Completed" : "Pending"}
                      </div>
                    )}
                  </td>
                  <td class="max-w-[150px] truncate">{item.title || "N/A"}</td>
                  <td class="max-w-[200px] truncate">
                    {item.description || "N/A"}
                  </td>
                  <td>
                    <div class="flex flex-wrap gap-1">
                      {item.companies.map((company) => (
                        <div class="badge badge-outline badge-accent">
                          {company}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div class="badge badge-outline badge-primary">
                      {item.attributedUser}
                    </div>
                  </td>
                  <td class="max-w-[120px] truncate">
                    {item.createdBy || "N/A"}
                  </td>
                  <td class="whitespace-nowrap">
                    {item.creationDate ? formatDate(item.creationDate) : "N/A"}
                  </td>
                  <td class="whitespace-nowrap">
                    {item.completedDate ? formatDate(item.completedDate) : "-"}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <TaskModal item={item} onSuccess={fetchTasks} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center">
          <div class="join mt-4 flex justify-center">
            <button
              class="join-item btn btn-sm min-w-[40px]"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage() === 1 || !displayedTasks().length}
            >
              «
            </button>
            <button class="join-item btn btn-sm min-w-[100px]">
              {displayedTasks().length ? `Page ${currentPage()}` : "No items"}
            </button>
            <button
              class="join-item btn btn-sm min-w-[40px]"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages(), p + 1))
              }
              disabled={
                currentPage() === totalPages() || !displayedTasks().length
              }
            >
              »
            </button>
          </div>
          <TaskModal
            onSuccess={() => {
              fetchTasks();
            }}
          />
        </div>
      </div>
    </>
  );
};

export default TaskTable;
