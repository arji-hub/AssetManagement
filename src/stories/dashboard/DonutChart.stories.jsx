import DonutChart from "../../components/dashboard/DonutChart";

export default {
  title: "Dashboard/DonutChart",
  component: DonutChart,
  decorators: [
    (Story) => (
      <div style={{ width: "500px" }}>
        <Story />
      </div>
    ),
  ],
};

const mockStatusBreakdown = {
  Working: 85,
  "For Repair": 12,
  Damaged: 5,
  Missing: 3,
  Condemned: 2,
};

const mockStatusBreakdownUneven = {
  Working: 200,
  "For Repair": 30,
  Damaged: 15,
  Missing: 8,
  Condemned: 2,
};

const mockStatusBreakdownSingle = {
  Working: 100,
  "For Repair": 0,
  Damaged: 0,
  Missing: 0,
  Condemned: 0,
};

const Template = (args) => <DonutChart {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: "Asset status breakdown",
  statusBreakdown: mockStatusBreakdown,
  loading: false,
  error: null,
};

export const CustomTitle = Template.bind({});
CustomTitle.args = {
  title: "My asset status",
  statusBreakdown: mockStatusBreakdown,
  loading: false,
  error: null,
};

export const UnbalancedDistribution = Template.bind({});
UnbalancedDistribution.args = {
  title: "Asset status breakdown",
  statusBreakdown: mockStatusBreakdownUneven,
  loading: false,
  error: null,
};

export const SingleStatus = Template.bind({});
SingleStatus.args = {
  title: "Asset status breakdown",
  statusBreakdown: mockStatusBreakdownSingle,
  loading: false,
  error: null,
};

export const Loading = Template.bind({});
Loading.args = {
  title: "Asset status breakdown",
  statusBreakdown: {},
  loading: true,
  error: null,
};

export const Error = Template.bind({});
Error.args = {
  title: "Asset status breakdown",
  statusBreakdown: {},
  loading: false,
  error: { message: "Failed to fetch data" },
};

export const NoAssets = Template.bind({});
NoAssets.args = {
  title: "Asset status breakdown",
  statusBreakdown: {
    Working: 0,
    "For Repair": 0,
    Damaged: 0,
    Missing: 0,
    Condemned: 0,
  },
  loading: false,
  error: null,
};

export const EvenDistribution = Template.bind({});
EvenDistribution.args = {
  title: "Asset status breakdown",
  statusBreakdown: {
    Working: 20,
    "For Repair": 20,
    Damaged: 20,
    Missing: 20,
    Condemned: 20,
  },
  loading: false,
  error: null,
};
