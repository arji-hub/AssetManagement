import StatCard from "../../components/dashboard/StatCard";

export default {
  title: "Dashboard/StatCard",
  component: StatCard,
  decorators: [
    (Story) => (
      <div style={{ width: "250px" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "alert"],
    },
  },
};

const Template = (args) => <StatCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: "Total assets",
  value: 1234,
  loading: false,
  error: null,
  variant: "default",
};

export const Alert = Template.bind({});
Alert.args = {
  title: "Open reports",
  value: 12,
  loading: false,
  error: null,
  variant: "alert",
};

export const Loading = Template.bind({});
Loading.args = {
  title: "Total assets",
  value: 0,
  loading: true,
  error: null,
  variant: "default",
};

export const Error = Template.bind({});
Error.args = {
  title: "Total assets",
  value: 0,
  loading: false,
  error: { message: "Failed to fetch data" },
  variant: "default",
};

export const LargeNumber = Template.bind({});
LargeNumber.args = {
  title: "Total custodians",
  value: 9999,
  loading: false,
  error: null,
  variant: "default",
};

export const AlertLargeNumber = Template.bind({});
AlertLargeNumber.args = {
  title: "Pending transfers",
  value: 456,
  loading: false,
  error: null,
  variant: "alert",
};
