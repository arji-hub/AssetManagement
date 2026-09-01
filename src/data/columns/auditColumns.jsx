import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Status } from "../../components/ui/status/assetStatus";
import AuditStatusBadge from "../../components/ui/status/AuditStatusBadge";
import { formatDate, formatTime } from "../../utils/date";

// ── "Assets in this room" table (AuditRoomOverview) ──
export const auditRoomAssetColumns = [
  {
    key: "desc",
    label: "Description",
    width: "2.5fr",
    priority: "high",
    render: (a) => a.description || "—",
  },
  {
    key: "category",
    label: "Category",
    width: "1fr",
    priority: "medium",
    render: (a) => a.category || "—",
    card: { icon: "fa-solid fa-tag" },
  },
  {
    key: "custodian",
    label: "Custodian",
    width: "1.2fr",
    priority: "medium",
    render: (a) => a.custodian_name || a.name || "—",
    card: { icon: "fa-solid fa-user-shield" },
  },
  {
    key: "status",
    label: "Condition",
    width: "1fr",
    priority: "high",
    render: (a) => <Status status={a.status} />,
  },
];

// ── "Previous audits" table (AuditRoomOverview) ──
export const auditHistoryColumns = [
  {
    key: "audit_no",
    label: "Audit No.",
    width: "1fr",
    priority: "high",
    render: (a) => a.audit_no || "—",
  },
  {
    key: "audited_by",
    label: "Conducted by",
    width: "1.4fr",
    priority: "medium",
    render: (a) => a.audited_by_name || "—",
    card: { icon: "fa-solid fa-user" },
  },
  {
    key: "date",
    label: "Date",
    width: "1fr",
    priority: "high",
    render: (a) => formatDate(a.completed_at ?? a.created_at),
  },
  {
    key: "audited",
    label: "Audited",
    width: "0.8fr",
    priority: "low",
    render: (a) => `${a.audited_count}/${a.total_assets}`,
    card: { icon: "fa-solid fa-clipboard-check" },
  },
  {
    key: "discrepancies",
    label: "Discrepancies",
    width: "1fr",
    priority: "high",
    render: (a) => (
      <span
        className={a.discrepancy_count > 0 ? "audit-history-discrepancy" : ""}
      >
        {a.discrepancy_count ?? 0}
      </span>
    ),
  },
];

// ── "Audit items" table (AuditRoomInfo) — needs live handlers, so it's a factory ──
export function getAuditItemColumns({ verifyingId, isCompleted, onVerify }) {
  return [
    {
      key: "asset_id",
      label: "Asset ID",
      width: "1fr",
      priority: "high",
      render: (i) => i.asset_id ?? i.id,
      card: { role: "title" },
    },
    {
      key: "desc",
      label: "Description",
      width: "2fr",
      priority: "high",
      render: (i) => i.description || "—",
    },
    {
      key: "category",
      label: "Category",
      width: "1fr",
      priority: "medium",
      render: (i) => i.category || "—",
      card: { icon: "fa-solid fa-tag" },
    },
    {
      key: "custodian",
      label: "Custodian",
      width: "1.2fr",
      priority: "medium",
      render: (i) => i.custodian || "Unassigned",
      card: { icon: "fa-solid fa-user" },
    },
    {
      key: "status",
      label: "Status",
      width: "1fr",
      priority: "high",
      render: (i) => {
        const isUnaudited = i.audit_status === "not_audited";

        if (isUnaudited && !isCompleted) {
          const isVerifying = verifyingId === i.id;
          return (
            <button
              type="button"
              className="audit-session-verify-btn audit-session-verify-btn--full-width"
              onClick={(e) => {
                e.stopPropagation();
                onVerify(i.id, i.audit_status);
              }}
              disabled={isVerifying}
              title="Mark as audited"
            >
              {isVerifying ? (
                <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
              ) : (
                <>
                  <FontAwesomeIcon icon="fa-solid fa-check" />
                  Verify
                </>
              )}
            </button>
          );
        }

        return <AuditStatusBadge status={i.audit_status} />;
      },
      card: { role: "badge" },
    },
    {
      key: "audited_at",
      label: "Audited at",
      width: "1fr",
      priority: "low",
      render: (i) => (i.audited_at ? formatTime(i.audited_at) : "—"),
      card: { role: "date" },
    },
  ];
}

// ── "Discrepancies" table (AuditRoomInfo) — static, no handlers needed ──
export const discrepancyItemColumns = [
  {
    key: "asset_id",
    label: "Asset ID",
    width: "1fr",
    priority: "high",
    render: (i) => i.asset_id ?? i.id,
    card: { role: "title" },
  },
  {
    key: "desc",
    label: "Description",
    width: "2fr",
    priority: "high",
    render: (i) => i.description || "—",
  },
  {
    key: "category",
    label: "Category",
    width: "1fr",
    priority: "medium",
    render: (i) => i.category || "—",
    card: { icon: "fa-solid fa-tag" },
  },
  {
    key: "status",
    label: "Status",
    width: "1fr",
    priority: "high",
    render: (i) => <AuditStatusBadge status={i.audit_status} />,
    card: { role: "badge" },
  },
  {
    key: "flagged_at",
    label: "Flagged at",
    width: "1fr",
    priority: "low",
    render: (i) => (i.audited_at ? formatTime(i.audited_at) : "—"),
    card: { role: "date" },
  },
];
