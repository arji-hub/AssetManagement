import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../utils/date";
import { PDFPreviewModal } from "../../components/modal/PDFPreviewModal";
import { CustodianInventoryPDF } from "../../pdf/templates/CustodianInventoryPDF";
import { useCustodianAssets } from "../../hooks/custodian/useCustodianAssets";

function CustodianAuditFormCell({ audit }) {
  const { assets, fullname } = useCustodianAssets(audit.username);

  return (
    <PDFPreviewModal
      title="Custody Form"
      fileName={`custodian-inventory-${audit.username}.pdf`}
      document={
        <CustodianInventoryPDF custodianName={fullname} assets={assets} />
      }
      triggerLabel={
        <>
          <FontAwesomeIcon icon="fa-solid fa-file-pdf" />
          View
        </>
      }
    />
  );
}

export const custodianAuditColumns = [
  {
    key: "custodian",
    label: "Custodian",
    width: "1.2fr",
    priority: "high",
    card: { role: "title" },
    render: (audit) => (
      <span className="custodian-audit-row-name">
        <FontAwesomeIcon icon="fa-solid fa-user" />
        <span className="custodian-audit-row-name-text">{audit.fullname}</span>
      </span>
    ),
  },
  {
    key: "role",
    label: "Type",
    width: "0.5fr",
    priority: "low",
    render: (audit) => (
      <span className="custodian-audit-row-role">
        {audit.role === "fulltime" ? "Full-time" : "Part-time"}
      </span>
    ),
  },
  {
    key: "email",
    label: "Email",
    width: "1.5fr",
    priority: "medium",
    render: (audit) => (
      <span className="custodian-audit-row-email">{audit.email}</span>
    ),
  },
  {
    key: "assets",
    label: "Total Assets",
    width: "140px",
    priority: "high",
    card: { role: "assets" },
    render: (audit) => (
      <span className="custodian-audit-row-assets-count">
        <FontAwesomeIcon icon="fa-solid fa-box-archive" />
        {audit.asset_count ?? 0}
      </span>
    ),
  },
  {
    key: "form",
    label: "Form",
    width: "180px",
    priority: "high",
    card: { role: "action" },
    render: (audit) => <CustodianAuditFormCell audit={audit} />,
  },
];
