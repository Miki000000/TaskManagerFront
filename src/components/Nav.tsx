import { A, useLocation } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import { useDecode } from "~/hooks/useDecode";
import { LinkList } from "~/shared/Links";

const getStoredTheme = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("theme") || "light";
  }
  return "light";
};

export default function Nav() {
  const [decoder] = useDecode();
  const [isAdmin, setAdmin] = createSignal(false);
  const [theme, setTheme] = createSignal(getStoredTheme());

  onMount(() => {
    const loggedIn = localStorage.getItem("authToken");
    if (loggedIn) {
      decoder(loggedIn).info.role == "ADMIN" ? setAdmin(true) : setAdmin(false);
    }
  });

  const changeTheme = (newTheme: string) => {
    if (typeof window !== "undefined") {
      setTheme(newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    }
  };

  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname
      ? "border-primary"
      : "border-transparent hover:border-primary";

  return (
    <nav class="navbar bg-base-100 bow-sm z-10">
      <div class="flex-1">
        <a class="btn btn-ghost text-[1.5rem] bg-transparent border-none hover:border-none hover:bg-transparent hover:shadow-none">
          Celta Tasks
        </a>
      </div>
      <div class="flex-1 flex justify-center">
        <ul class="menu menu-horizontal px-1">
          <li>
            <A target="_blank" href="https://www.celtasistemas.com.br/">
              Celta
            </A>
          </li>
          <li>
            <details>
              <summary>Links</summary>
              <ul class="rounded-t-none p-2 w-[6rem]">
                {LinkList.map((link) => (
                  <li>
                    <a target="_blank" href={link.url}>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </li>
          <li>
            <details>
              <summary>Theme</summary>
              <ul class="rounded-t-none p-2 bg-base-100">
                <li>
                  <a onClick={() => changeTheme("light")}>Light</a>
                </li>
                <li>
                  <a onClick={() => changeTheme("dark")}>Dark</a>
                </li>
                <li>
                  <a onClick={() => changeTheme("cupcake")}>Cupcake</a>
                </li>
                <li>
                  <a onClick={() => changeTheme("luxury")}>Luxury</a>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
      <div class="flex-1 flex justify-end gap-4">
        {isAdmin() && (
          <A href="/auth/register" class="btn">
            Register Account
          </A>
        )}
        <A href="/auth/login" class="btn">
          Logout
        </A>
        <A href="/auth/password" class="btn">
          Change Password
        </A>
      </div>
    </nav>
  );
}
