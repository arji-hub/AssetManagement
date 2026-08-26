import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import ProfileCard from "../../components/ui/card/ProfileCard";
import LinkedAccountsCard from "../../components/ui/card/LinkedAccountsCard";
import { useProfile } from "../../hooks/profile/useProfile";
import "./Profile.css";
import BackButton from "../../components/ui/button/BackButton";

function Profile() {
  const { user } = useAuth();

  const linkedAccounts = useProfile();

  return (
    <MainLayout>
      <div className="profile-page">
        <div className="back-button">
          <BackButton />
        </div>

        <ProfileCard user={user} />
        <LinkedAccountsCard {...linkedAccounts} />
      </div>
    </MainLayout>
  );
}

export default Profile;
