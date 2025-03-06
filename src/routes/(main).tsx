import Nav from "~/components/Nav";
import Footer from "~/components/Footer";
import { onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";

export default function MainLayout(props: { children: any }) {
  const navigate = useNavigate();
  onMount(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/auth/login");
    }
  });
  return (
    <div class="min-h-screen flex flex-col bg-background text-foreground">
      <Nav />
      <main class="flex-1">{props.children}</main>
      <Footer />
    </div>
  );
}
