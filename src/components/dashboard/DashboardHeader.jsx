import "./DashboardHeader.css";
import { displayDate } from "../../utils/date";

function DashboardHeader({
  user,
  openReportsCount = 0,
  pendingTransfersCount = 0,
  ongoingAuditsCount = 0,
  loading = false,
}) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const alerts = [
    openReportsCount > 0 && {
      key: "reports",
      label: `${openReportsCount} open report${openReportsCount === 1 ? "" : "s"}`,
      tone: "alert",
    },
    pendingTransfersCount > 0 && {
      key: "transfers",
      label: `${pendingTransfersCount} pending transfer${pendingTransfersCount === 1 ? "" : "s"}`,
      tone: "warning",
    },
    ongoingAuditsCount > 0 && {
      key: "audits",
      label: `${ongoingAuditsCount} audit${ongoingAuditsCount === 1 ? "" : "s"} in progress`,
      tone: "info",
    },
  ].filter(Boolean);

  return (
    <div className="dashboard-header">
      <div className="dashboard-header__top">
        <div className="dashboard-header__intro">
          <p className="dashboard-header__eyebrow">{displayDate}</p>
          <h1 className="dashboard-header__title">
            {greeting}
            {user?.firstname ? (
              <>
                ,{" "}
                <span className="dashboard-header__name">{user.firstname}</span>
              </>
            ) : (
              ""
            )}
          </h1>
        </div>
      </div>

      {!loading && alerts.length > 0 && (
        <div className="dashboard-header__alerts">
          {alerts.map((alert) => (
            <span
              key={alert.key}
              className={`dashboard-header__pill dashboard-header__pill--${alert.tone}`}
            >
              {alert.label}
            </span>
          ))}
        </div>
      )}

      {!loading && alerts.length === 0 && (
        <div className="dashboard-header__alerts">
          <span className="dashboard-header__pill dashboard-header__pill--clear">
            All caught up — nothing needs attention
          </span>
        </div>
      )}
    </div>
  );
}

export default DashboardHeader;
