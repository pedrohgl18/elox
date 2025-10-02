export default function PublicFooter() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white/80 backdrop-blur text-sm text-slate-600">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 sm:flex-row sm:justify-between">
        <span>&copy; {new Date().getFullYear()} EloX. Todos os direitos reservados.</span>
        <span className="text-xs text-slate-400">Construído para criadores de clipes.</span>
      </div>
    </footer>
  );
}
