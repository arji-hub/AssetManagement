import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import ProfileCard from "../../components/panel/ProfileCard";
import LinkedAccountsCard from "../../components/panel/LinkedAccountsCard";
import useProfileEdit from "../../hooks/profile/userProfileEdit";
import { useProfile } from "../../hooks/profile/useProfile";
import "./Profile.css";
import BackButton from "../../components/ui/button/BackButton";

function Profile() {
  const { user } = useAuth();

  const profileEdit = useProfileEdit({
    user,
    onSaved: (result) => {
      console.log("Profile updated:", result);
    },
  });

  const linkedAccounts = useProfile();

  return (
    <MainLayout>
      <div className="profile-page">
        <div className="back-button">
          <BackButton />
        </div>

        <ProfileCard user={user} {...profileEdit} />
        <LinkedAccountsCard {...linkedAccounts} />
      </div>
    </MainLayout>
  );
}

export default Profile;
