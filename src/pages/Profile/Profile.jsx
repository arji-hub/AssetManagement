import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import ProfileCard from "../../components/panel/ProfileCard";
import useProfileEdit from "../../hooks/userProfileEdit";
import "./Profile.css";

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const profileEdit = useProfileEdit({
    user,
    onSaved: (result) => {
      console.log("Profile updated:", result);
      // If your AuthContext caches user data, refresh/refetch it here
      // e.g. refreshUser() if your context exposes one
    },
  });

  return (
    <MainLayout>
      <div className="profile-page">
        <button className="return-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
          Back
        </button>
        <ProfileCard user={user} {...profileEdit} />
      </div>
    </MainLayout>
  );
}

export default Profile;
