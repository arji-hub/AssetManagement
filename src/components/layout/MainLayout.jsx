import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "./Navbar";

function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Navbar
      title="ASSET MANAGEMENT SYSTEM"
      userName={`${user?.firstname} ${user?.lastname}`}
      userEmail={user?.email}
      userRole={user?.role}
      activePath={location.pathname}
      onNavigate={(path) => navigate(path)}
      onLogout={handleLogout}
    >
      {children}
    </Navbar>
  );
}

export default MainLayout;
