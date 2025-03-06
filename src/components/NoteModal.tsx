import { createSignal, type Component, Show } from "solid-js";
import type { Note } from "../types";
import { RequestHandler } from "../shared/RequestHandler";
import { useNavigate } from "@solidjs/router";

type Props = {
  item?: Note;
  onSuccess?: () => void;
};

const NoteModal: Component<Props> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [isClosing, setIsClosing] = createSignal(false);
  const dialogId = `note_modal_${props.item?.id || "new"}`;
  const navigate = useNavigate();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const newNote: Note = {
      title: formData.get("title") as string,
      company: formData.get("company") as string,
      contact: formData.get("contact") as string,
      situation: formData.get("situation") as string,
    };

    const token = localStorage.getItem("authToken");
    const response = await RequestHandler<Note>({
      route: "api/note",
      method: props.item ? "PUT" : "POST",
      data: newNote,
      authorization: token || "",
      fallback: (error: string) => {
        console.error("Failed to create note:", error);
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
    }, 200);
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
            <h3 class="font-bold text-lg mb-4">Edit Note</h3>
            <form onSubmit={handleSubmit} class="space-y-4">
              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  class="input input-bordered w-full"
                  value={props.item?.title}
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
                  value={props.item?.company}
                />
              </div>

              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Contact</span>
                </label>
                <input
                  type="text"
                  name="contact"
                  class="input input-bordered w-full"
                  value={props.item?.contact}
                />
              </div>

              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Situation</span>
                </label>
                <textarea
                  name="situation"
                  class="textarea textarea-bordered w-full min-h-[100px]"
                  value={props.item?.situation}
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
            class={`modal-backdrop  ${
              isClosing() ? "animate-backdrop-out" : "animate-backdrop-in"
            }`}
            onClick={closeModal}
          ></div>
        </dialog>
      </Show>
    </>
  );
};

export default NoteModal;
