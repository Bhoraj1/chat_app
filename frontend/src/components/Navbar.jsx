import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
  const { authUser } = useAuthStore();
  return (
    <div>
      <div>This is an navbar</div>
    </div>
  );
};

export default Navbar;
