import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../services/authService";
import Navbar from "./Navbar";

function MainLayout({ children }) {
  const { userInfo, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Navbar
      title="ASSET MANAGEMENT SYSTEM"
      userName={`${userInfo?.first_name} ${userInfo?.last_name}`}
      userRole={role}
      activePath={location.pathname}
      onNavigate={(path) => navigate(path)}
      onLogout={handleLogout}
    >
      {children}
    </Navbar>
  );
}

export default MainLayout;
