import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import ErrorModal from "../../components/ErrorModal";
import SuccessModal from "../../components/SuccessModal";
import { useAuth } from "../../hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [repeatPassword, setRepeatPassword] = createSignal("");
  const [role, setRole] = createSignal("");
  const { error, successMessage, register } = useAuth();

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidForm = () => {
    return (
      isValidEmail(email()) &&
      username().length >= 3 &&
      password().length >= 8 &&
      password() === repeatPassword() &&
      role()
    );
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    await register(email(), username(), password(), role());
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <ErrorModal message={error()} />
      <SuccessModal message={successMessage()} />
      <div class="card w-96 bg-base-100 shadow-xl">
        <form onSubmit={handleSubmit} class="card-body">
          <h2 class="card-title justify-center text-2xl font-bold mb-6">
            Register Account
          </h2>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              class="input input-bordered w-full"
              onInput={(e) => setEmail(e.currentTarget.value)}
              required
            />
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Username</span>
            </label>
            <input
              type="text"
              placeholder="johndoe"
              class="input input-bordered w-full"
              onInput={(e) => setUsername(e.currentTarget.value)}
              required
              minLength={3}
            />
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              class="input input-bordered w-full"
              onInput={(e) => setPassword(e.currentTarget.value)}
              required
              minLength={6}
            />
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Repeat Password</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              class="input input-bordered w-full"
              onInput={(e) => setRepeatPassword(e.currentTarget.value)}
              required
              minLength={6}
            />
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Role</span>
            </label>
            <select
              class="select select-bordered w-full"
              onChange={(e) => setRole(e.currentTarget.value)}
              required
            >
              <option value="" disabled selected>
                Select a role
              </option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </div>

          <div class="card-actions mt-6 gap-2 flex justify-between items-center">
            <button
              type="button"
              class="btn btn-ghost w-1/3"
              onClick={() => navigate("/")}
            >
              Home
            </button>
            <button
              type="submit"
              class="btn btn-primary w-1/3"
              disabled={!isValidForm()}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
