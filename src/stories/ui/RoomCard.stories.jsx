import RoomCard from "../../components/ui/RoomCard";

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
    name: "Room 101",
    totalAssets: 12,
  },
};
