export default function PublicFooter() {
  return (
    <footer className="w-full text-center py-10 text-gray-400 text-sm border-t border-white/10 bg-black/40 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4">
        &copy; {new Date().getFullYear()} EloX. Todos os direitos reservados.
      </div>
    </footer>
  );
}
