import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg ">
      <div className="container max-auto px-4 h-16">
        <div className="flex justify-between items-center h-full">
          <div>
            <Link to="/" className="">
              <h1 className="text-xl font-bold font-serif">हल्का रमाईलो</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {authUser && (
              <>
                <Link
                  to="/profile"
                  className="btn btn-sm gap-2 transaction-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="w-5 h-5 hover:text-red-500" />
                  <span className="hidden sm:inline hover:text-red-500">
                    Logout
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
