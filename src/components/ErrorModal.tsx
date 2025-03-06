import { Component } from "solid-js";

interface ErrorModalProps {
  message: string;
}

const ErrorModal: Component<ErrorModalProps> = (props: { message: string }) => {
  return (
    <dialog id="error_modal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold">Error</h3>
        <p class="py-4">{props.message}</p>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default ErrorModal;
