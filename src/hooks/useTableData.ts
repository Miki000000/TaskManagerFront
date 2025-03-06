import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { RequestHandler } from "~/shared/RequestHandler";

export function useTableData<T>(initialEndpoint: string) {
  const navigate = useNavigate();
  const [data, setData] = createSignal<T[]>([]);
  const [errorMessage, setErrorMessage] = createSignal("");
  const [endpoint, setEndpoint] = createSignal(initialEndpoint);

  const fetchData = async () => {
    const token = localStorage.getItem("authToken");

    const response = await RequestHandler<T[]>({
      route: endpoint(),
      data: null,
      method: "GET",
      authorization: token ?? "",
      fallback: (error) => setErrorMessage(error),
      navigate: navigate,
    });

    if (response) {
      setData(response);
    }
  };

  return {
    data,
    errorMessage,
    fetchData,
    setEndpoint,
  };
}
