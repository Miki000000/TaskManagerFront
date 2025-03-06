import { A, useLocation } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import { useDecode } from "~/hooks/useDecode";
import { LinkList } from "~/shared/Links";

export default function Nav() {
  const [decoder] = useDecode();
  const [isAdmin, setAdmin] = createSignal(false);
  onMount(() => {
    const loggedIn = localStorage.getItem("authToken");
    if (loggedIn) {
      decoder(loggedIn).info.role == "ADMIN" ? setAdmin(true) : setAdmin(false);
    }
  });
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname
      ? "border-sky-600"
      : "border-transparent hover:border-sky-600";
  return (
    <nav class="navbar flex justify-between bg-base-100 bow-sm z-10">
      <div>
        <a class="btn btn-ghost text-[1.5rem] bg-transparent border-none hover:border-none hover:bg-transparent hover:shadow-none">
          Celta Tasks
        </a>
      </div>
      <div class="flex-none pr-[5rem]">
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
        </ul>
      </div>
      <div class="flex justify-around items-center gap-4">
        {isAdmin() && (
          <A href="/auth/register" class="btn">
            Register Account
          </A>
        )}
        <A href="/auth/login" class="btn">
          Logout
        </A>
      </div>
    </nav>
  );
}
