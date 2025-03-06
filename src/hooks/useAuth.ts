import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { RequestHandler } from "~/shared/RequestHandler";

type LoginResponse = {
  token: string;
};

export function useAuth() {
  const [error, setError] = createSignal("");
  const [successMessage, setSuccessMessage] = createSignal("");
  const navigate = useNavigate();

  const showErrorModal = (errorMessage: string) => {
    setError(errorMessage);
    const modal = document.getElementById("error_modal") as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  const showSuccessModal = (message: string) => {
    setSuccessMessage(message);
    const modal = document.getElementById("success_modal") as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  const login = async (email: string, password: string) => {
    const response = await RequestHandler<LoginResponse>({
      route: "auth/login",
      method: "POST",
      data: { email, password },
      authorization: "",
      fallback: (error: string) => showErrorModal(error),
      navigate: navigate,
    });

    if (response?.token) {
      localStorage.setItem("authToken", response.token);
      navigate("/");
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    role: string
  ) => {
    await RequestHandler({
      route: "auth/register",
      data: { email, username, password, role },
      method: "POST",
      authorization: "",
      fallback: (error: string) => showErrorModal(error),
      success: (message: string) =>
        showSuccessModal("Account created successfully! Please login."),
      navigate: navigate,
    });
  };

  const changePassword = async (newPassword: string) => {
    const result = await RequestHandler({
      route: "auth/password",
      method: "POST",
      data: { password: newPassword },
      authorization: localStorage.getItem("authToken") || "",
      fallback: (error: string) => showErrorModal(error),
      success: (message: string) =>
        showSuccessModal("Password changed successfully!"),
      navigate: navigate,
    });

    if (result !== undefined) {
      return true;
    }

    return false;
  };

  return {
    error,
    successMessage,
    login,
    register,
    changePassword,
  };
}
