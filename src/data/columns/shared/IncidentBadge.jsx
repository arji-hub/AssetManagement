import { getReportType } from "../../../utils/report";
import { toTitleCase } from "../../../utils/TextCasing";

export const IncidentBadge = ({ report }) => {
  const type = getReportType(report);
  return (
    <span className={`report-card-incident-type ${type}`}>
      {toTitleCase(type)}
    </span>
  );
};
