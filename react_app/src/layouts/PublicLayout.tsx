import { Outlet } from "react-router-dom";
import { PublicHeader } from "components/public/PublicHeader";
import { PublicFooter } from "components/public/PublicFooter";
import { publicSurfaceWidth } from "components/public/publicStyles";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex w-full flex-1 justify-center overflow-x-clip px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <div className={`mx-auto flex w-full flex-col gap-10 sm:gap-12 lg:gap-16 ${publicSurfaceWidth}`}>
          <Outlet />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
