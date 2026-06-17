// HistoryCard.stories.jsx
import HistoryCard from "../../../components/ui/card/HistoryCard";

export default {
  title: "Cards/HistoryCard",
  component: HistoryCard,
};

export const Default = {
  args: {
    assetId: "cict-1001",
  },
};

export const NoEvents = {
  args: {
    assetId: "cict-9999",
  },
  // override MOCK_HISTORY by testing the empty state
  // swap MOCK_HISTORY to [] in HistoryCard temporarily to preview this
};
