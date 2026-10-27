import MainLayout from "../../../components/layout/MainLayout";
import Settings from "../Settings";
import Category from "./Category";
import HeaderFooter from "./HeaderFooter";
import "./Config.css";

function Config() {
  return (
    <MainLayout>
      <Settings>
        <div className="config-sections">
          <HeaderFooter />
          <Category />
        </div>
      </Settings>
    </MainLayout>
  );
}

export default Config;
