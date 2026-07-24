// pages/reportLog/ReportLogInfo.jsx
import { useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";

function ReportLogInfo() {
  const { logID } = useParams();

  return (
    <MainLayout>
      <div className="report-log-info-page">Report Log Info: {logID}</div>
    </MainLayout>
  );
}

export default ReportLogInfo;
