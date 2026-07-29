import CategoryBarList from "../../components/dashboard/CategoryBarList";

export default {
  title: "Dashboard/CategoryBarList",
  component: CategoryBarList,
  decorators: [
    (Story) => (
      <div style={{ width: "500px" }}>
        <Story />
      </div>
    ),
  ],
};

const mockCategories = [
  {
    id: "1",
    name: "Furniture",
    assetCount: 45,
  },
  {
    id: "2",
    name: "Electronics",
    assetCount: 128,
  },
  {
    id: "3",
    name: "Laboratory Equipment",
    assetCount: 67,
  },
  {
    id: "4",
    name: "Office Supplies",
    assetCount: 23,
  },
  {
    id: "5",
    name: "Books & Media",
    assetCount: 234,
  },
];

const Template = (args) => <CategoryBarList {...args} />;

export const WithCategories = Template.bind({});
WithCategories.args = {
  categories: mockCategories,
  loading: false,
  error: null,
  title: "Assets by category",
};

export const CustomTitle = Template.bind({});
CustomTitle.args = {
  categories: mockCategories,
  loading: false,
  error: null,
  title: "My categories",
};

export const NoCategories = Template.bind({});
NoCategories.args = {
  categories: [],
  loading: false,
  error: null,
  title: "Assets by category",
};

export const Loading = Template.bind({});
Loading.args = {
  categories: [],
  loading: true,
  error: null,
  title: "Assets by category",
};

export const Error = Template.bind({});
Error.args = {
  categories: [],
  loading: false,
  error: { message: "Failed to fetch data" },
  title: "Assets by category",
};

export const FewCategories = Template.bind({});
FewCategories.args = {
  categories: [
    {
      id: "1",
      name: "Computers",
      assetCount: 15,
    },
    {
      id: "2",
      name: "Printers",
      assetCount: 8,
    },
  ],
  loading: false,
  error: null,
  title: "Equipment",
};

export const SingleCategory = Template.bind({});
SingleCategory.args = {
  categories: [
    {
      id: "1",
      name: "Projectors",
      assetCount: 12,
    },
  ],
  loading: false,
  error: null,
  title: "Available Items",
};
