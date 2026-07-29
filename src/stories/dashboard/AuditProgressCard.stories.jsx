import AuditProgressCard from "../../components/dashboard/AuditProgressCard";

export default {
  title: "Dashboard/AuditProgressCard",
  component: AuditProgressCard,
  decorators: [
    (Story) => (
      <div style={{ width: "500px" }}>
        <Story />
      </div>
    ),
  ],
};

const mockAudits = [
  {
    id: "1",
    audit_no: "AUD-001",
    total_assets: 100,
    audited_count: 75,
    discrepancy_count: 3,
  },
  {
    id: "2",
    audit_no: "AUD-002",
    total_assets: 50,
    audited_count: 50,
    discrepancy_count: 0,
  },
  {
    id: "3",
    audit_no: "AUD-003",
    total_assets: 200,
    audited_count: 45,
    discrepancy_count: 8,
  },
];

const Template = (args) => <AuditProgressCard {...args} />;

export const WithAudits = Template.bind({});
WithAudits.args = {
  audits: mockAudits,
  loading: false,
  error: null,
  onStartAudit: () => alert("Start audit clicked"),
};

export const NoAudits = Template.bind({});
NoAudits.args = {
  audits: [],
  loading: false,
  error: null,
  onStartAudit: () => alert("Start audit clicked"),
};

export const Loading = Template.bind({});
Loading.args = {
  audits: [],
  loading: true,
  error: null,
  onStartAudit: () => alert("Start audit clicked"),
};

export const Error = Template.bind({});
Error.args = {
  audits: [],
  loading: false,
  error: { message: "Failed to fetch data" },
  onStartAudit: () => alert("Start audit clicked"),
};

export const SingleAudit = Template.bind({});
SingleAudit.args = {
  audits: [mockAudits[0]],
  loading: false,
  error: null,
  onStartAudit: () => alert("Start audit clicked"),
};

export const CompletedAudit = Template.bind({});
CompletedAudit.args = {
  audits: [
    {
      id: "4",
      audit_no: "AUD-004",
      total_assets: 80,
      audited_count: 80,
      discrepancy_count: 1,
    },
  ],
  loading: false,
  error: null,
  onStartAudit: () => alert("Start audit clicked"),
};
