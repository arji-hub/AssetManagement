import { useState } from "react";
import ReportActionModal from "../../../components/ui/modal/ReportActionModal";
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

const mockReport = {
  id: "report_001",
  report_no: "RPT-0001",
  description: "Epson Printer L120",
  location: "SDL1",
  status: "damaged",
  status_log: [
    {
      status: "damaged",
      date: "2026-06-20T08:30:00Z",
      note: "Printer not feeding paper correctly, jams frequently.",
      img: null,
    },
  ],
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
  title: "Modal/ReportActionModal",
  component: ReportActionModal,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withAuth],
  argTypes: {
    onClose: { action: "closed" },
    onSuccess: { action: "success" },
  },
};

export const EndorseForRepair = {
  render: () => (
    <ReportActionModal
      report={mockReport}
      newStatus="for_repair"
      onClose={() => console.log("closed")}
      onSuccess={() => console.log("success")}
    />
  ),
};

export const MarkAsFound = {
  render: () => (
    <ReportActionModal
      report={{ ...mockReport, status: "missing" }}
      newStatus="found"
      onClose={() => console.log("closed")}
      onSuccess={() => console.log("success")}
    />
  ),
};

export const MarkAsWorking = {
  render: () => (
    <ReportActionModal
      report={{ ...mockReport, status: "for_repair" }}
      newStatus="working"
      onClose={() => console.log("closed")}
      onSuccess={() => console.log("success")}
    />
  ),
};

export const Condemn = {
  render: () => (
    <ReportActionModal
      report={mockReport}
      newStatus="condemned"
      onClose={() => console.log("closed")}
      onSuccess={() => console.log("success")}
    />
  ),
};
