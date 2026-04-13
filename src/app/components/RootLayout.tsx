import { Outlet } from "react-router";
import { BottomNav } from "./BottomNav";

export function RootLayout() {
  return (
    <div className="relative flex flex-col min-h-screen max-w-md mx-auto bg-white overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
