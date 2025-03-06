import { createSignal, type Component, Show } from "solid-js";
import type { Call } from "../types";
import { RequestHandler } from "../shared/RequestHandler";
import { useNavigate } from "@solidjs/router";

type Props = {
  item?: Call;
  onSuccess?: () => void;
};

const CallModal: Component<Props> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [isClosing, setIsClosing] = createSignal(false);
  const dialogId = `call_modal_${props.item?.id || "new"}`;
  const navigate = useNavigate();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const newCall: Call = {
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      problem: formData.get("problem") as string,
      solution: formData.get("solution") as string,
    };

    const token = localStorage.getItem("authToken");
    const response = await RequestHandler<Call>({
      route: props.item ? `api/call/${props.item.id}` : "api/call",
      method: props.item ? "PUT" : "POST",
      data: newCall,
      authorization: token || "",
      fallback: (error: string) => {
        console.error("Failed to create call:", error);
      },
      navigate: navigate,
    });

    if (response) {
      props.onSuccess?.();
      setIsOpen(false);
    }
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
    setIsOpen(true);
  };

  return (
    <>
      <button class="btn btn-sm" onClick={openModal}>
        {props.item ? "Edit" : "Create"}
      </button>

      <Show when={isOpen()}>
        <dialog id={dialogId} class="modal modal-bottom sm:modal-middle" open>
          <div
            class={`modal-box ${
              isClosing() ? "animate-modal-out" : "animate-modal-in"
            }`}
          >
            <h3 class="font-bold text-lg mb-4">
              {props.item ? "Edit" : "Create"} Call
            </h3>
            <form onSubmit={handleSubmit} class="space-y-4">
              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  class="input input-bordered w-full"
                  value={props.item?.name || ""}
                />
              </div>

              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Company</span>
                </label>
                <input
                  type="text"
                  name="company"
                  class="input input-bordered w-full"
                  value={props.item?.company || ""}
                />
              </div>

              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Problem</span>
                </label>
                <textarea
                  name="problem"
                  class="textarea textarea-bordered w-full min-h-[100px]"
                  value={props.item?.problem || ""}
                />
              </div>

              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Solution</span>
                </label>
                <textarea
                  name="solution"
                  class="textarea textarea-bordered w-full min-h-[100px]"
                  value={props.item?.solution || ""}
                />
              </div>

              <div class="modal-action flex justify-between">
                <button type="button" class="btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
          <div
            class={`modal-backdrop
              ${isClosing() ? "animate-backdrop-out" : "animate-backdrop-in"}`}
            onClick={closeModal}
          ></div>
        </dialog>
      </Show>
    </>
  );
};

export default CallModal;
