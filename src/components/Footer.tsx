export default function Footer() {
  return (
    <>
      <footer class="footer sm:footer-horizontal items-center p-4 flex justify-between fixed bottom-0 w-full bg-base-300 text-base-content">
        <aside class="flex justify-between">
          <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
        </aside>
        <p>Made by: Vitor Hugo</p>
      </footer>
    </>
  );
}
