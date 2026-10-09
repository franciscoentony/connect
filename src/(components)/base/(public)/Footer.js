// Rodapé do site público.
export default function Footer() {
  return (
    <footer className="mt-auto w-full bg-black py-10 text-center text-base font-semibold text-white">
      © {new Date().getFullYear()} — Por Connect
    </footer>
  );
}
