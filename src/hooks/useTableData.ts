import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { RequestHandler } from "~/shared/RequestHandler";

export function useTableData<T extends { id?: number }>(
  initialEndpoint: string
) {
  const navigate = useNavigate();
  const [data, setData] = createSignal<T[]>([]);
  const [errorMessage, setErrorMessage] = createSignal("");
  const [endpoint, setEndpoint] = createSignal(initialEndpoint);

  const sortById = (items: T[]) => {
    return [...items].sort((a, b) => {
      if (!a.id || !b.id) return 0;
      return b.id - a.id; // Sort in descending order (newest first)
    });
  };

  const fetchData = async () => {
    const token = localStorage.getItem("authToken");

    const response = await RequestHandler<T[]>({
      route: endpoint(),
      method: "GET",
      authorization: token ?? "",
      fallback: (error) => setErrorMessage(error),
      navigate: navigate,
    });

    if (response) {
      setData(sortById(response));
    }
  };

  return {
    data,
    errorMessage,
    fetchData,
    setEndpoint,
  };
}
