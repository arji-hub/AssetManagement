import RoomCard from "../../../components/ui/card/RoomCard";

export default {
  title: "Cards/RoomCard",
  component: RoomCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    name: { control: "text" },
    totalAssets: { control: { type: "number", min: 0 } },
  },
};

export const Default = {
  args: {
    name: "ProgLab1",
    totalAssets: 12,
  },
};

export const EmptyRoom = {
  args: {
    name: "SDL1",
    totalAssets: 0,
  },
};

export const LongName = {
  args: {
    name: "Computer Laboratory Room 101",
    totalAssets: 8,
  },
};

export const HighAssetCount = {
  args: {
    name: "Faculty Room",
    totalAssets: 380,
  },
};
