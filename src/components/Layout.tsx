import { Outlet } from "react-router-dom";
import Particles from "./ui/Particles";

const Layout = () => {
  return (
    <div className="relative min-h-screen">
      <Particles />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
