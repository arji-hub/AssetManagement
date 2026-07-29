import PARICSTreemap from "../../components/dashboard/PARICSTreemap";

export default {
  title: "Dashboard/PARICSTreemap",
  component: PARICSTreemap,
  decorators: [
    (Story) => (
      <div style={{ width: "500px" }}>
        <Story />
      </div>
    ),
  ],
};

const Template = (args) => <PARICSTreemap {...args} />;

export const Balanced = Template.bind({});
Balanced.args = {
  par: { count: 40, value: 500000 },
  ics: { count: 40, value: 500000 },
  totalCount: 80,
  totalValue: 1000000,
  loading: false,
  error: null,
};

export const PARHeavy = Template.bind({});
PARHeavy.args = {
  par: { count: 70, value: 850000 },
  ics: { count: 10, value: 150000 },
  totalCount: 80,
  totalValue: 1000000,
  loading: false,
  error: null,
};

export const ICSHeavy = Template.bind({});
ICSHeavy.args = {
  par: { count: 5, value: 100000 },
  ics: { count: 95, value: 900000 },
  totalCount: 100,
  totalValue: 1000000,
  loading: false,
  error: null,
};

export const ParOnly = Template.bind({});
ParOnly.args = {
  par: { count: 25, value: 250000 },
  ics: { count: 0, value: 0 },
  totalCount: 25,
  totalValue: 250000,
  loading: false,
  error: null,
};

export const SingleItemEach = Template.bind({});
SingleItemEach.args = {
  par: { count: 1, value: 12000 },
  ics: { count: 1, value: 8000 },
  totalCount: 2,
  totalValue: 20000,
  loading: false,
  error: null,
};

export const Empty = Template.bind({});
Empty.args = {
  par: { count: 0, value: 0 },
  ics: { count: 0, value: 0 },
  totalCount: 0,
  totalValue: 0,
  loading: false,
  error: null,
};

export const Loading = Template.bind({});
Loading.args = {
  par: { count: 0, value: 0 },
  ics: { count: 0, value: 0 },
  totalCount: 0,
  totalValue: 0,
  loading: true,
  error: null,
};

export const Error = Template.bind({});
Error.args = {
  par: { count: 0, value: 0 },
  ics: { count: 0, value: 0 },
  totalCount: 0,
  totalValue: 0,
  loading: false,
  error: { message: "Failed to fetch data" },
};