import { createSignal } from "solid-js";
import ErrorModal from "../../components/ErrorModal";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const { error, login } = useAuth();

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    await login(email(), password());
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <ErrorModal message={error()} />
      <div class="card w-96 bg-base-100 shadow-xl">
        <form onSubmit={handleSubmit} class="card-body">
          <h2 class="card-title justify-center text-2xl font-bold mb-6">
            Login
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
              <span class="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              class="input input-bordered w-full"
              onInput={(e) => setPassword(e.currentTarget.value)}
              required
            />
          </div>

          <div class="card-actions justify-end mt-6">
            <button
              type="submit"
              class="btn btn-primary w-full"
              disabled={!isValidEmail(email()) || !password()}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
