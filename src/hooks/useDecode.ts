import { jwtDecode } from "jwt-decode";

type Claims = {
  info: {
    role: string;
  };
  iss: string;
  sub: string;
  exp: number;
};

export function useDecode() {
  const decode = (token: string): Claims => {
    try {
      return jwtDecode<Claims>(token);
    } catch (error) {
      console.error("Failed to decode token:", error);
      throw new Error("Invalid token");
    }
  };

  const getUsername = (token: string): string => {
    try {
      const decoded: Claims = jwtDecode<Claims>(token);
      return decoded.sub || "";
    } catch (error) {
      console.error("Failed to extract username from token:", error);
      return "";
    }
  };

  return [decode, getUsername] as const;
}
