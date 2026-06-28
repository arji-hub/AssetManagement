// TransferRoomCard.stories.jsx

import React from "react";
import { MemoryRouter } from "react-router-dom";
import TransferRoomCard from "../../../components/ui/card/TransferRoomCard";
import { MOCK_ROOM_LOGS } from "../../../data/transfer";

export default {
  title: "Cards/TransferRoomCard",
  component: TransferRoomCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const WithRoomFrom = {
  args: {
    request: MOCK_ROOM_LOGS[0],
  },
};

export const NoRoomFrom = {
  args: {
    request: MOCK_ROOM_LOGS[1],
  },
};

export const Custom = {
  args: {
    request: {
      id: "room-003",
      asset_id: "cict-1003",
      asset_name: "Epson Projector, 3LCD, WXGA",
      room_from: "AVR",
      move_to: "Room 301",
      created_at: { seconds: 1750200000 },
    },
  },
};
