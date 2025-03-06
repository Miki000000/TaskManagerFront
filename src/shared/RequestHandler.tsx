const apiUrl = process.env.API_URL || "http://localhost:8080/";

type errorResponse =
  | {
      timestamp: string;
      status: number;
      error: string;
      path: string;
      message: string;
    } & { success: boolean; error: string };

export const RequestHandler = async <T,>({
  route,
  data,
  method,
  authorization,
  fallback,
  navigate,
}: {
  route: string;
  data: unknown | null;
  method: "POST" | "PUT" | "DELETE" | "GET";
  authorization?: string;
  fallback: (error: string) => void;
  navigate: (path: string) => void;
}) => {
  try {
    const response = data
      ? await fetch(`${apiUrl}${route}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: authorization ? `Bearer ${authorization}` : "",
          },
          body: JSON.stringify(data),
        })
      : await fetch(`${apiUrl}${route}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: authorization ? `Bearer ${authorization}` : "",
          },
        });

    const body = await response.json();
    if (response.status >= 200 && response.status < 300) {
      return body ? (body as T) : fallback("Success");
    }
    if (response.status === 403) navigate("/auth/login");
    const errorResponse = body as errorResponse;
    throw new Error(
      `Request failed with status ${response.status} and message ${
        errorResponse.message || errorResponse.error
      }`
    );
  } catch (error: any) {
    fallback(`Request failed, message: ${error.message}`);
  }
};
