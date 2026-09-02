// src/pages/Audit/custodian/AuditCustodian.jsx
import MainLayout from "../../../components/layout/MainLayout";
import AuditCard from "../../../components/ui/card/audit/AuditCard";
import BackButton from "../../../components/ui/button/BackButton";
import useCustodianLogs from "../../../hooks/audit/custodian/useCustodianLogs";
import { CustodianListPDF } from "../../../pdf/templates/CustodianListPDF";
import { PDFPreviewModal } from "../../../components/modal/PDFPreviewModal";
import { custodianAuditColumns } from "../../../data/columns";
import Table from "../../../components/panel/Table";
import AuditCustodianCard from "../../../components/ui/card/audit/AuditCustodianCard";
import SearchBar from "../../../components/ui/searchBar/SearchBar";
import "./AuditCustodian.css";

function AuditCustodian() {
  const {
    custodians,
    custodiansLoading,
    custodiansError,
    search,
    setSearch,
    handleCustodianClick,
    totalAssetsInCustody,
    avgAssetsPerCustodian,
  } = useCustodianLogs();

  return (
    <MainLayout>
      <div className="audit-custodian-page">
        <div className="audit-custodian-header">
          <div className="audit-custodian-header-left">
            <BackButton nav="/audit" />
            <div>
              <h2 className="audit-custodian-title">Audit Custodian Logs</h2>
              <p className="audit-custodian-subtitle">
                View asset custody records and accountability by custodian.
              </p>
            </div>
          </div>
        </div>

        <div className="audit-custodian-stats">
          <AuditCard
            variant="secondary"
            label="Total custodians"
            value={custodians.length}
          />
          <AuditCard
            variant="primary"
            label="Assets in custody"
            value={totalAssetsInCustody}
          />
          <AuditCard
            variant="neutral"
            label="Avg. assets / custodian"
            value={avgAssetsPerCustodian}
          />
        </div>

        <div className="audit-custodian-filter">
          <div className="audit-custodian-search">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search custodian"
            />
          </div>
          <PDFPreviewModal
            title="Custodian List"
            fileName="custodian-list.pdf"
            document={<CustodianListPDF custodians={custodians} />}
            triggerLabel="Custodian List"
          />
        </div>

        <div className="custodian-audit">
          <Table
            columns={custodianAuditColumns}
            items={custodians}
            loading={custodiansLoading}
            error={custodiansError}
            itemLabel="custodians"
            emptyMessage="No custodians found."
            renderItem={(custodian) => (
              <AuditCustodianCard
                key={custodian.id}
                custodian={custodian}
                columns={custodianAuditColumns}
                onClick={() => handleCustodianClick(custodian.username)}
              />
            )}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export default AuditCustodian;
