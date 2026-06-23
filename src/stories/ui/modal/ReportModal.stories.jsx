import { useState } from "react";
import ReportModal from "../../../components/ui/modal/ReportModal";
import { AuthContext } from "../../../context/AuthContext";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

library.add(fas, far);

const mockUser = {
  uid: "uid_admin_001",
  firstname: "Admin",
  lastname: "User",
  email: "admin@cict.edu",
  role: "admin",
  username: "admin",
};

const withAuth = (Story) => (
  <AuthContext.Provider
    value={{
      currentUser: mockUser,
      user: mockUser,
      role: "admin",
      loading: false,
      logout: () => {},
    }}
  >
    <Story />
  </AuthContext.Provider>
);

export default {
  title: "Modal/ReportModal",
  component: ReportModal,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withAuth],
  argTypes: {
    onClose: { action: "closed" },
  },
};

// ── Default: empty form ──
export const Default = {
  render: () => <ReportModal onClose={() => console.log("closed")} />,
};
