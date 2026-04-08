import { publicSurfaceWidth } from "components/public/publicStyles";

export function PublicFooter() {
  return (
    <footer className="mt-auto w-full border-t border-charcoal/10 bg-charcoal text-white/90">
      <div className={`mx-auto w-full ${publicSurfaceWidth} px-4 py-6 sm:px-6 lg:px-8 lg:py-7`}>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-1">
            <span className="block font-medium">&copy; 2026 meowfolio</span>
            <p className="max-w-xl text-sm leading-6 text-white/70">
              Built for focused resume work, playful storytelling, and a calmer public surface.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/65 md:justify-end">
            <span>Public surface</span>
            <span className="hidden h-1 w-1 rounded-full bg-white/35 md:inline-block" />
            <span>Prototype system</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
