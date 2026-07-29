import DashboardHeader from "../../components/dashboard/DashboardHeader";

export default {
  title: "Dashboard/DashboardHeader",
  component: DashboardHeader,
  decorators: [
    (Story) => (
      <div style={{ width: "700px" }}>
        <Story />
      </div>
    ),
  ],
};

const Template = (args) => <DashboardHeader {...args} />;

export const AllCaughtUp = Template.bind({});
AllCaughtUp.args = {
  user: { firstname: "Arji", role: "admin" },
  openReportsCount: 0,
  pendingTransfersCount: 0,
  ongoingAuditsCount: 0,
  loading: false,
};

export const WithAlerts = Template.bind({});
WithAlerts.args = {
  user: { firstname: "Arji", role: "admin" },
  openReportsCount: 3,
  pendingTransfersCount: 2,
  ongoingAuditsCount: 1,
  loading: false,
};

export const SingleAlertEach = Template.bind({});
SingleAlertEach.args = {
  user: { firstname: "Maria", role: "fulltime" },
  openReportsCount: 1,
  pendingTransfersCount: 1,
  ongoingAuditsCount: 1,
  loading: false,
};

export const ReportsOnly = Template.bind({});
ReportsOnly.args = {
  user: { firstname: "Juan", role: "parttime" },
  openReportsCount: 5,
  pendingTransfersCount: 0,
  ongoingAuditsCount: 0,
  loading: false,
};

export const NoRole = Template.bind({});
NoRole.args = {
  user: { firstname: "Jamie" },
  openReportsCount: 0,
  pendingTransfersCount: 0,
  ongoingAuditsCount: 0,
  loading: false,
};

export const NoUser = Template.bind({});
NoUser.args = {
  user: null,
  openReportsCount: 0,
  pendingTransfersCount: 0,
  ongoingAuditsCount: 0,
  loading: false,
};

export const Loading = Template.bind({});
Loading.args = {
  user: { firstname: "Arji", role: "admin" },
  openReportsCount: 3,
  pendingTransfersCount: 2,
  ongoingAuditsCount: 1,
  loading: true,
};
