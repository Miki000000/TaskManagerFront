import { createSignal, type Component, Show, For } from "solid-js";
import type { Task } from "../types";
import { RequestHandler } from "../shared/RequestHandler";
import { useNavigate } from "@solidjs/router";
import ErrorModal from "./ErrorModal";
import SuccessModal from "./SuccessModal";

type UserResponse = { username: string }[];

type Props = {
  item?: Task;
  onSuccess?: () => void;
};

const TaskModal: Component<Props> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [isClosing, setIsClosing] = createSignal(false);
  const [error, setError] = createSignal("");
  const [successMessage, setSuccessMessage] = createSignal("");
  const [companies, setCompanies] = createSignal<string[]>(
    props.item?.companies || []
  );
  const [newCompany, setNewCompany] = createSignal("");
  const [usernames, setUsernames] = createSignal<string[]>([]);
  const [isUsernameDropdownOpen, setIsUsernameDropdownOpen] =
    createSignal(false);
  const [attributedUser, setAttributedUser] = createSignal(
    props.item?.attributedUser || ""
  );

  const dialogId = `task_modal_${props.item?.id || "new"}`;
  const navigate = useNavigate();

  const fetchUsernames = async () => {
    const token = localStorage.getItem("authToken");
    const response = await RequestHandler<UserResponse>({
      route: "api/user/usernames",
      method: "GET",
      authorization: token || "",
      fallback: (err) => setError(err),
      navigate: navigate,
    });

    if (response) {
      setUsernames(response.map((user) => user.username));
      setIsUsernameDropdownOpen(true);
    }
  };

  const showErrorModal = (errorMessage: string) => {
    setError(errorMessage);
    const modal = document.getElementById("error_modal") as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  const showSuccessModal = (message: string) => {
    setSuccessMessage(message);
    const modal = document.getElementById("success_modal") as HTMLDialogElement;
    if (modal) modal.showModal();
    setTimeout(() => {
      setIsOpen(false);
      if (props.onSuccess) props.onSuccess();
    }, 500);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const newTask: Task = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      companies: companies(),
      attributedUser: attributedUser(),
      createdBy: props.item?.createdBy || "", // Will be set by the backend if not provided
      completed: props.item?.completed || false,
    };

    const token = localStorage.getItem("authToken");
    const response = await RequestHandler<Task>({
      route: props.item ? `api/task/${props.item.id}` : "api/task",
      method: props.item ? "PUT" : "POST",
      data: newTask,
      authorization: token || "",
      fallback: showErrorModal,
      success: showSuccessModal,
      navigate: navigate,
    });

    if (response) {
      props.onSuccess?.();
      setIsOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!props.item?.id) return;

    const token = localStorage.getItem("authToken");
    const response = await RequestHandler<Task>({
      route: `api/task/${props.item.id}`,
      method: "DELETE",
      authorization: token || "",
      fallback: showErrorModal,
      success: showSuccessModal,
      navigate: navigate,
    });

    if (response) {
      props.onSuccess?.();
      setIsOpen(false);
    }
  };

  const addCompany = (e: KeyboardEvent) => {
    if (e.key === "Enter" && newCompany()) {
      e.preventDefault();
      if (!companies().includes(newCompany())) {
        setCompanies([...companies(), newCompany()]);
      }
      setNewCompany("");
    }
  };

  const removeCompany = (company: string) => {
    setCompanies(companies().filter((c) => c !== company));
  };

  const selectUser = (username: string) => {
    setAttributedUser(username);
    setIsUsernameDropdownOpen(false);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200); // Match animation duration
  };

  const openModal = () => {
    setIsClosing(false);
    if (props.item) {
      setCompanies(props.item.companies || []);
      setAttributedUser(props.item.attributedUser || "");
    } else {
      setCompanies([]);
      setAttributedUser("");
    }
    setIsOpen(true);
  };

  return (
    <>
      <ErrorModal message={error()} />
      <SuccessModal message={successMessage()} />
      <button class="btn w-[7rem]" onClick={openModal}>
        {props.item ? "Edit" : "Create"}
      </button>

      <Show when={isOpen()}>
        <dialog
          id={dialogId}
          class="modal modal-bottom sm:modal-middle fixed"
          open
        >
          <div
            class={`modal-box relative z-20 ${
              isClosing() ? "animate-modal-out" : "animate-modal-in"
            }`}
          >
            <h3 class="font-bold text-lg mb-4">
              {props.item ? "Edit" : "Create"} Task
            </h3>
            <form onSubmit={handleSubmit} class="space-y-4">
              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  class="input input-bordered w-full"
                  value={props.item?.title || ""}
                  required
                />
              </div>

              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  class="textarea textarea-bordered w-full min-h-[100px]"
                  value={props.item?.description || ""}
                  required
                />
              </div>

              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Companies</span>
                </label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <For each={companies()}>
                    {(company) => (
                      <div class="badge badge-outline badge-accent gap-2">
                        {company}
                        <button
                          type="button"
                          onClick={() => removeCompany(company)}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </For>
                </div>
                <input
                  type="text"
                  placeholder="Type company name and press Enter"
                  value={newCompany()}
                  onInput={(e) => setNewCompany(e.currentTarget.value)}
                  onKeyDown={addCompany}
                  class="input input-bordered w-full"
                />
              </div>

              <div class="form-control w-full relative">
                <label class="label">
                  <span class="label-text">Attributed User</span>
                </label>
                <div class="flex">
                  <input
                    type="text"
                    class="input input-bordered w-full"
                    placeholder="Select a user"
                    value={attributedUser()}
                    readonly
                  />
                  <button
                    type="button"
                    class="btn btn-square ml-2"
                    onClick={fetchUsernames}
                  >
                    +
                  </button>
                </div>

                <Show when={isUsernameDropdownOpen()}>
                  <div class="dropdown dropdown-open dropdown-bottom absolute top-full left-0 mt-1 w-full z-30">
                    <ul class="dropdown-content menu bg-base-100 rounded-box shadow-lg w-full max-h-52 overflow-y-auto p-2">
                      <For each={usernames()}>
                        {(username) => (
                          <li>
                            <a onClick={() => selectUser(username)}>
                              {username}
                            </a>
                          </li>
                        )}
                      </For>
                    </ul>
                  </div>
                </Show>
              </div>

              <div class="modal-action flex justify-between">
                <div class="flex gap-2">
                  <button type="button" class="btn" onClick={closeModal}>
                    Cancel
                  </button>
                  {props.item && (
                    <button
                      type="button"
                      class="btn btn-error"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <button type="submit" class="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
          <div
            class={`modal-backdrop fixed inset-0 bg-base-300 bg-opacity-70 ${
              isClosing() ? "animate-backdrop-out" : "animate-backdrop-in"
            }`}
            onClick={closeModal}
          ></div>
        </dialog>
      </Show>
    </>
  );
};

export default TaskModal;
