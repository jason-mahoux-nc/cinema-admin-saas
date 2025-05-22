
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Cinémas",
    path: "/theaters",
  },
  {
    name: "Salles",
    path: "/rooms",
  },
  {
    name: "Sièges",
    path: "/seats",
  },
  {
    name: "Projections",
    path: "/movie-sessions",
  },
  {
    name: "Réservations",
    path: "/bookings",
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-cinema-darkGray min-h-screen p-6 flex flex-col">
      <div className="mb-10">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-white">
            Sinema<span className="text-cinema-yellow">*</span>
          </h1>
        </Link>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                  location.pathname.startsWith(item.path)
                    ? "bg-cinema-yellow text-cinema-black"
                    : "text-white hover:bg-cinema-gray"
                )}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto pt-6 border-t border-cinema-gray/30">
        <p className="text-xs text-cinema-gray">Sinema* © 2025</p>
        <p className="text-xs text-cinema-gray">Tous droits réservés.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
