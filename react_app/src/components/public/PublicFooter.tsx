export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-charcoal/10 bg-charcoal text-white/90">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-4 py-4 text-sm sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <span className="font-medium">&copy; 2026 meowfolio</span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/70">
          <span>Built for focused resume work.</span>
          <span className="hidden h-1 w-1 rounded-full bg-white/35 md:inline-block" />
          <span>Public surface</span>
        </div>
      </div>
    </footer>
  );
}
