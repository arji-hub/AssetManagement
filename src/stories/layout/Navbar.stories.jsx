import Navbar from "../../components/layout/Navbar";

export default {
  title: "Layout/Navbar",
  component: Navbar,
  parameters: {
    layout: "fullscreen",
  },
};

//base args shared by all stories
const baseArgs = {
  title: "ASSET MANAGEMENT SYSTEM",
  userName: "Juan Dela Cruz",
  userRole: "admin",
  activePath: "/dashboard",
  onNavigate: (path) => console.log("navigate to:", path),
  onLogout: () => console.log("logout clicked"),
  children: (
    <div style={{ padding: "20px" }}>
      <h2>Page Content</h2>
      <p>This is where your page content renders.</p>
    </div>
  ),
};


export const Preview = {
  args: {
    ...baseArgs,
  },
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
  },
};