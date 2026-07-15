import AuditCard from "../../../components/ui/card/AuditCard";

export default {
  title: "Cards/AuditCard",
  component: AuditCard,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["secondary", "primary", "neutral"],
    },
    value: { control: "text" },
  },
};

export const Secondary = {
  args: {
    variant: "secondary",
    label: "Total audits",
    value: 124,
    hint: "Academic year 2023-2024",
  },
};

export const Primary = {
  args: {
    variant: "primary",
    label: "Rooms pending",
    value: 12,
    hint: "Due by end of semester",
  },
};

export const Neutral = {
  args: {
    variant: "neutral",
    label: "Avg. discrepancy rate",
    value: "4.2%",
    hint: "Across all audited spaces",
  },
};

export const NoHint = {
  args: {
    variant: "neutral",
    label: "Rooms audited",
    value: 38,
  },
};

export const LongLabelAndValue = {
  args: {
    variant: "primary",
    label: "Average time to resolve a discrepancy",
    value: "3.5 days",
    hint: "Based on completed audits this semester",
  },
};

// Renders all three cards together the way they appear in the
// Audit Room stats row, for a quick visual sanity check.
export const StatsRow = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "24px",
        maxWidth: "900px",
      }}
    >
      <AuditCard
        variant="secondary"
        label="Total audits"
        value={124}
        hint="Academic year 2023-2024"
      />
      <AuditCard
        variant="primary"
        label="Rooms pending"
        value={12}
        hint="Due by end of semester"
      />
      <AuditCard
        variant="neutral"
        label="Avg. discrepancy rate"
        value="4.2%"
        hint="Across all audited spaces"
      />
    </div>
  ),
};
