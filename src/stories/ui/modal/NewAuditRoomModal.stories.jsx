import { MemoryRouter } from "react-router-dom";
import { within, userEvent, waitFor, sb } from "storybook/test";
import NewAuditRoomModal from "../../../components/ui/modal/NewAuditRoomModal";

sb.mock(import("../../../services/room"), () => {
  const mockAllRooms = [
    {
      id: "room_101",
      name: "Room 101 - Faculty Center",
      assetCount: 12,
      last_audited_at: "2023-09-10",
    },
    {
      id: "room_302",
      name: "Room 302 - Computer Lab",
      assetCount: 30,
      last_audited_at: "2023-06-15",
    },
    {
      id: "room_multimedia_1",
      name: "Multimedia Room 1",
      assetCount: 8,
      last_audited_at: null,
    },
  ];

  return {
    fetchRooms: async () => mockAllRooms,

    fetchRoom: async (id) => {
      const needle = id.toLowerCase();
      const match = mockAllRooms.find((r) =>
        r.name.toLowerCase().includes(needle),
      );
      if (!match) throw new Error("Room not found.");
      return match;
    },

    fetchRoomsByLastAudited: async (newestFirst, count) => {
      const sorted = [...mockAllRooms].sort((a, b) => {
        if (a.last_audited_at === null && b.last_audited_at === null) return 0;
        if (a.last_audited_at === null) return 1;
        if (b.last_audited_at === null) return -1;
        const aTime = new Date(a.last_audited_at).getTime();
        const bTime = new Date(b.last_audited_at).getTime();
        return newestFirst ? bTime - aTime : aTime - bTime;
      });
      return sorted.slice(0, count);
    },
  };
});

export default {
  title: "Modal/NewAuditRoomModal",
  component: NewAuditRoomModal,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Default = {};

export const Opened = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /new audit/i }));
  },
};

export const RoomFound = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /new audit/i }));

    const input = await canvas.findByLabelText(/search room by name/i);
    await userEvent.type(input, "Computer Lab");

    const findButton = canvas.getByRole("button", { name: /find room/i });
    await userEvent.click(findButton);

    await waitFor(() => canvas.getByText(/room 302 - computer lab/i));
  },
};

export const RoomNotFound = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /new audit/i }));

    const input = await canvas.findByLabelText(/search room by name/i);
    await userEvent.type(input, "Nonexistent Room 999");

    const findButton = canvas.getByRole("button", { name: /find room/i });
    await userEvent.click(findButton);

    await waitFor(() =>
      canvas.getByText(/no rooms found matching that name or number/i),
    );
  },
};
