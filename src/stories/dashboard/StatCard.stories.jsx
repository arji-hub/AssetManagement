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
  description: null,
  loading: false,
  error: null,
  variant: "default",
};

export const Alert = Template.bind({});
Alert.args = {
  title: "Open reports",
  value: 12,
  description: null,
  loading: false,
  error: null,
  variant: "alert",
};

export const Loading = Template.bind({});
Loading.args = {
  title: "Total assets",
  value: 0,
  description: null,
  loading: true,
  error: null,
  variant: "default",
};

export const Error = Template.bind({});
Error.args = {
  title: "Total assets",
  value: 0,
  description: null,
  loading: false,
  error: { message: "Failed to fetch data" },
  variant: "default",
};

export const LargeNumber = Template.bind({});
LargeNumber.args = {
  title: "Total custodians",
  value: 9999,
  description: null,
  loading: false,
  error: null,
  variant: "default",
};

export const AlertLargeNumber = Template.bind({});
AlertLargeNumber.args = {
  title: "Pending transfers",
  value: 456,
  description: null,
  loading: false,
  error: null,
  variant: "alert",
};

export const WithDescription = Template.bind({});
WithDescription.args = {
  title: "Total assets",
  value: 1234,
  description: "Across all rooms and custodians",
  loading: false,
  error: null,
  variant: "default",
};

export const AlertWithDescription = Template.bind({});
AlertWithDescription.args = {
  title: "Open reports",
  value: 12,
  description: "Needs admin attention",
  loading: false,
  error: null,
  variant: "alert",
};

export const LoadingWithDescription = Template.bind({});
LoadingWithDescription.args = {
  title: "Total assets",
  value: 0,
  description: "Across all rooms and custodians",
  loading: true,
  error: null,
  variant: "default",
};

export const ErrorWithDescription = Template.bind({});
ErrorWithDescription.args = {
  title: "Total assets",
  value: 0,
  description: "Across all rooms and custodians",
  loading: false,
  error: { message: "Failed to fetch data" },
  variant: "default",
};
