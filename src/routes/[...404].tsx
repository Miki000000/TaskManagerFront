import { A } from "@solidjs/router";

export default function NotFound() {
  return (
    <main class="min-h-screen hero bg-base-200">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-6xl font-bold text-primary mb-8">404</h1>
          <h2 class="text-3xl font-semibold mb-4">Página não encontrada</h2>
          <p class="mb-8">
            Desculpe, a página que você está procurando não existe ou foi
            movida.
          </p>
          <div class="flex justify-center gap-4">
            <A href="/" class="btn btn-primary">
              Voltar ao Início
            </A>
          </div>

          <div class="mt-8">
            <img
              src="/logo-celta.png"
              alt="Celta Sistemas Logo"
              class="max-w-[200px] mx-auto opacity-50"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
