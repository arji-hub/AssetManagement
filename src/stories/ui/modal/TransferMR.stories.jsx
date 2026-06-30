import { useState } from "react";
import TransferMR from "../../../components/ui/modal/TransferMR";
import { AuthContext } from "../../../context/AuthContext";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

library.add(fas, far);

const mockAdmin = {
  uid: "uid_admin_001",
  firstname: "Admin",
  lastname: "User",
  email: "admin@cict.edu",
  role: "admin",
  username: "admin",
};

const mockCustodian = {
  uid: "uid_custodian_001",
  firstname: "Carlo",
  lastname: "Reyes",
  email: "carlo.reyes@cict.edu",
  role: "staff",
  username: "creyes",
};

const mockLocalMR = {
  uid: "uid_localmr_001",
  firstname: "Mika",
  lastname: "Santos",
  email: "mika.santos@cict.edu",
  role: "staff",
  username: "msantos",
};

const mockUnrelatedUser = {
  uid: "uid_unrelated_001",
  firstname: "Jasper",
  lastname: "Adlawan",
  email: "jasper.adlawan@cict.edu",
  role: "staff",
  username: "jadlawan",
};

const withAuthAs = (mockUser) => (Story) => (
  <AuthContext.Provider
    value={{
      currentUser: mockUser,
      user: mockUser,
      role: mockUser.role,
      loading: false,
      logout: () => {},
    }}
  >
    <Story />
  </AuthContext.Provider>
);

export default {
  title: "Modal/TransferMR",
  component: TransferMR,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withAuthAs(mockCustodian)],
  argTypes: {
    onClose: { action: "closed" },
  },
};

// ── Default: empty form, viewed as the property custodian ──
// The custodian can both assign and remove a local MR.
export const Default = {
  render: () => <TransferMR onClose={() => console.log("closed")} />,
};

// ── Pre-filled: asset ID passed in (skips manual asset lookup) ──
export const WithAssetID = {
  render: () => (
    <TransferMR onClose={() => console.log("closed")} assetID="cict-1002" />
  ),
};

// ── Viewed as admin ──
// Admin can act on any asset's local MR, but never auto-acknowledges
// as the acting party — their acknowledgment stays pending like a normal approver.
export const AsAdmin = {
  decorators: [withAuthAs(mockAdmin)],
  render: () => (
    <TransferMR onClose={() => console.log("closed")} assetID="cict-1002" />
  ),
};

// ── Viewed as the current local MR ──
// A local MR can only remove their own assignment — the Assign tab
// should be blocked by the permission check once an asset is loaded.
export const AsCurrentLocalMR = {
  decorators: [withAuthAs(mockLocalMR)],
  render: () => (
    <TransferMR onClose={() => console.log("closed")} assetID="cict-1002" />
  ),
};

// ── Viewed as an unrelated user ──
// Neither the custodian nor the local MR — asset lookup should
// resolve into a permission error rather than a usable form.
export const AsUnrelatedUser = {
  decorators: [withAuthAs(mockUnrelatedUser)],
  render: () => (
    <TransferMR onClose={() => console.log("closed")} assetID="cict-1002" />
  ),
};