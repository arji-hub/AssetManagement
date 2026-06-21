import ReportCard from "../../../components/ui/card/ReportCard";

const MOCK_REPORT = {
  id: "rpt-001",
  asset_id: "cict-I001",
  description: "Epson printer Dot Matrix not printing properly.",
  room_id: "SDL1",
  reported_by_name: "Ralph Jasper Ortiz",
  date_reported: "2023-10-15",
  status: "pending",
};

export default {
  title: "Cards/ReportCard",
  component: ReportCard,
  // ReportCard returns a <tr>, so it needs a table/tbody ancestor
  // to render and look correct in the canvas.
  decorators: [
    (Story) => (
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <Story />
        </tbody>
      </table>
    ),
  ],
  argTypes: {
    onClick: { action: "row clicked" },
  },
};

export const Pending = {
  args: {
    report: MOCK_REPORT,
  },
};

export const ForRepair = {
  args: {
    report: { ...MOCK_REPORT, id: "rpt-002", status: "for_repair" },
  },
};

export const Found = {
  args: {
    report: { ...MOCK_REPORT, id: "rpt-003", status: "found" },
  },
};

export const Condemned = {
  args: {
    report: {
      ...MOCK_REPORT,
      id: "rpt-004",
      description: "Unit assessed as beyond repair, motherboard fried.",
      status: "condemned",
    },
  },
};

export const LongDescription = {
  args: {
    report: {
      ...MOCK_REPORT,
      id: "rpt-005",
      description:
        "Unit is making a loud grinding noise on startup and the screen intermittently shows visual artifacts before crashing entirely.",
    },
  },
};

export const MissingFields = {
  args: {
    report: {
      id: "rpt-006",
      asset_id: null,
      description: null,
      room_id: null,
      reported_by_name: null,
      date_reported: null,
      status: null,
    },
  },
};

export const MultipleRows = {
  decorators: [
    (Story) => (
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <ReportCard report={MOCK_REPORT} />
          <ReportCard
            report={{ ...MOCK_REPORT, id: "rpt-002", status: "for_repair" }}
          />
          <ReportCard
            report={{ ...MOCK_REPORT, id: "rpt-003", status: "condemned" }}
          />
        </tbody>
      </table>
    ),
  ],
  render: () => null,
};