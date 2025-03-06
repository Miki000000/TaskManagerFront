import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import ErrorModal from "../../components/ErrorModal";
import SuccessModal from "../../components/SuccessModal";
import { useAuth } from "../../hooks/useAuth";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = createSignal("");
  const [repeatNewPassword, setRepeatNewPassword] = createSignal("");
  const { error, successMessage, changePassword } = useAuth();

  const isValidForm = () => {
    return newPassword().length >= 8 && newPassword() === repeatNewPassword();
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    const success = await changePassword(newPassword());
    if (success) {
      setNewPassword("");
      setRepeatNewPassword("");
      navigate("/");
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <ErrorModal message={error()} />
      <SuccessModal message={successMessage()} />
      <div class="card w-96 bg-base-100 shadow-xl">
        <form onSubmit={handleSubmit} class="card-body">
          <h2 class="card-title justify-center text-2xl font-bold mb-6">
            Change Password
          </h2>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">New Password</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              class="input input-bordered w-full"
              onInput={(e) => setNewPassword(e.currentTarget.value)}
              required
              minLength={6}
            />
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Confirm New Password</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              class="input input-bordered w-full"
              onInput={(e) => setRepeatNewPassword(e.currentTarget.value)}
              required
              minLength={6}
            />
          </div>

          <div class="card-actions mt-6 gap-2 flex justify-between items-center">
            <button
              type="button"
              class="btn btn-ghost w-1/3"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary w-1/3"
              disabled={!isValidForm()}
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
