import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "./Navbar";

function MainLayout({ children }) {
  const { userInfo, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Navbar
      title="ASSET MANAGEMENT SYSTEM"
      userName={`${userInfo?.firstname} ${userInfo?.lastname}`}
      userEmail={userInfo?.email}
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
