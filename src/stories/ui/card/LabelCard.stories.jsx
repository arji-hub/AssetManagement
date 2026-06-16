// LabelCard.stories.jsx
import LabelCard from "../../../components/ui/card/LabelCard";

export default {
  title: "  Cards/LabelCard",
  component: LabelCard,
};

export const Default = {
  args: {
    label: "Current Location",
    value: "SDL I",
  },
};

export const EmptyValue = {
  args: {
    label: "Remarks",
    value: "",
  },
};

export const LongValue = {
  args: {
    label: "Custodian",
    value: "Juan Miguel Dela Cruz Jr.",
  },
};
