import { Component } from "solid-js";

interface SuccessModalProps {
  message: string;
}

const SuccessModal: Component<SuccessModalProps> = (props: {
  message: string;
}) => {
  return (
    <dialog id="success_modal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold">Success</h3>
        <p class="py-4">{props.message}</p>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-primary">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default SuccessModal;
