// TransferPanel.stories.jsx

import React from "react";
import { MemoryRouter } from "react-router-dom";
import TransferPanel from "../../components/panel/TransferPanel";
import { MOCK_TRANSFERS, MOCK_ROOM_LOGS } from "../../data/transfer";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { AuthContext } from "../../context/AuthContext";

library.add(fas, far);

const mockUser = {
  uid: "mock-uid-001",
  displayName: "Admin User",
  email: "admin@bsu.edu.ph",
};

export default {
  title: "Panel/TransferPanel",
  component: TransferPanel,
  decorators: [
    (Story) => (
      <AuthContext.Provider value={{ user: mockUser, role: "admin" }}>
        <MemoryRouter>
          <div style={{ padding: "24px" }}>
            <Story />
          </div>
        </MemoryRouter>
      </AuthContext.Provider>
    ),
  ],
};

// Action tab — pending transfers requiring action
export const Action = {
  args: {
    group: "action",
    items: MOCK_TRANSFERS,
    loading: false,
    error: null,
  },
};

// Requested tab — transfers the user submitted
export const Requested = {
  args: {
    group: "requested",
    items: MOCK_TRANSFERS,
    loading: false,
    error: null,
  },
};

// Logs tab — completed/denied history
export const Logs = {
  args: {
    group: "logs",
    items: MOCK_TRANSFERS,
    loading: false,
    error: null,
  },
};

// Room logs tab — asset room movement history
export const RoomLogs = {
  args: {
    group: "room_logs",
    items: MOCK_ROOM_LOGS,
    loading: false,
    error: null,
  },
};

// Loading state
export const Loading = {
  args: {
    group: "action",
    items: [],
    loading: true,
    error: null,
  },
};

// Error state
export const ErrorState = {
  args: {
    group: "action",
    items: [],
    loading: false,
    error: "Failed to fetch transfers.",
  },
};

// Empty state
export const Empty = {
  args: {
    group: "action",
    items: [],
    loading: false,
    error: null,
  },
};
