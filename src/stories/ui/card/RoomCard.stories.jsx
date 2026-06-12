import { MemoryRouter } from "react-router-dom";
import RoomCard from "../../../components/ui/card/RoomCard";

export default {
  title: "Cards/RoomCard",
  component: RoomCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    roomName: { control: "text" },
    totalAssets: { control: { type: "number", min: 0 } },
  },
};

export const Default = {
  args: {
    roomName: "ProgLab1",
    totalAssets: 12,
  },
};

export const EmptyRoom = {
  args: {
    roomName: "SDL1",
    totalAssets: 0,
  },
};

export const LongName = {
  args: {
    roomName: "Computer Laboratory Room 101",
    totalAssets: 8,
  },
};

export const HighAssetCount = {
  args: {
    roomName: "Faculty Room",
    totalAssets: 380,
  },
};
