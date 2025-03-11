const apiUrl = process.env.API_URL || "http://localhost:8080/";

type ErrorResponse = {
  timestamp: string;
  status: number;
  error: string;
  path: string;
  message: string;
  success?: boolean;
};

/**
 * Handle API requests with standardized error handling
 */
export const RequestHandler = async <T,>({
  route,
  data,
  method,
  authorization,
  fallback,
  success,
  navigate,
}: {
  route: string;
  data?: unknown;
  method: "POST" | "PUT" | "DELETE" | "GET" | "PATCH";
  authorization?: string;
  fallback: (error: string) => void;
  success?: (message: string) => void;
  navigate: (path: string) => void;
}): Promise<T> => {
  try {
    // Make the request with appropriate data and headers
    const requestOptions = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization ? `Bearer ${authorization}` : "",
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    };

    const response = await fetch(`${apiUrl}${route}`, requestOptions);

    if (response.status === 403) navigate("/auth/login");

    const contentLength = response.headers.get("content-length");
    const isEmpty = contentLength === "0" || response.status === 204;

    if (isEmpty && response.status >= 200 && response.status < 300) {
      if (success) success("Operation completed successfully");
      return {} as T;
    }

    const body = await response.json();

    if (response.status >= 200 && response.status < 300) {
      if (success) success("Operation completed successfully");
      return body as T;
    }

    const errorResponse = body as ErrorResponse;
    throw new Error(
      errorResponse.message || errorResponse.error || "Unknown error occurred"
    );
  } catch (error: any) {
    const errorMessage = error.message || "An unexpected error occurred";
    fallback(errorMessage);
    return {} as T;
  }
};
