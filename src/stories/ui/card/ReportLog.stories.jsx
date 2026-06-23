// ReportLog.stories.jsx

import React from "react";
import { MemoryRouter } from "react-router-dom";
import ReportLog from "../../../components/ui/card/ReportLog";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

library.add(fas, far);

export default {
  title: "Cards/ReportLog",
  component: ReportLog,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ padding: "24px", maxWidth: "700px" }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

const SAMPLE_LOGS = [
  {
    status: "damaged",
    date: "2026-06-20T08:30:00Z",
    img: null,
    note: "Initial report submitted.",
  },
  {
    status: "for_repair",
    date: "2026-06-21T09:00:00Z",
    img: null,
    note: "Endorsed to IT for diagnosis.",
  },
  {
    status: "working",
    date: "2026-06-22T14:00:00Z",
    img: null,
    note: "Repaired and returned to workstation.",
  },
];

// Single log item
export const SingleLog = {
  render: () => (
    <div className="report-log-card">
      <span className="report-info-section-label">STATUS HISTORY</span>
      <div className="report-info-log">
        <ReportLog log={SAMPLE_LOGS[0]} />
      </div>
    </div>
  ),
};

// Multiple log items
export const MultipleLog = {
  render: () => (
    <div className="report-log-card">
      <span className="report-info-section-label">STATUS HISTORY</span>
      <div className="report-info-log">
        {SAMPLE_LOGS.map((log, index) => (
          <ReportLog key={index} log={log} />
        ))}
      </div>
    </div>
  ),
};

// Missing report flow
export const MissingFlow = {
  render: () => (
    <div className="report-log-card">
      <span className="report-info-section-label">STATUS HISTORY</span>
      <div className="report-info-log">
        {[
          {
            status: "missing",
            date: "2026-06-20T13:00:00Z",
            img: null,
            note: "Initial report submitted.",
          },
          {
            status: "found",
            date: "2026-06-21T08:00:00Z",
            img: null,
            note: "Found in SDL2, mistakenly moved during room transfer.",
          },
          {
            status: "working",
            date: "2026-06-22T10:00:00Z",
            img: null,
            note: "Returned to assigned workstation, verified functional.",
          },
        ].map((log, index) => (
          <ReportLog key={index} log={log} />
        ))}
      </div>
    </div>
  ),
};

// With image evidence
export const WithEvidence = {
  render: () => (
    <div className="report-log-card">
      <span className="report-info-section-label">STATUS HISTORY</span>
      <div className="report-info-log">
        <ReportLog
          log={{
            status: "damaged",
            date: "2026-06-20T08:30:00Z",
            img: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=400&fit=crop",
            note: "Printer not feeding paper correctly, jams frequently.",
          }}
        />
      </div>
    </div>
  ),
};

// Multiple logs with evidence
export const MultipleLogWithEvidence = {
  render: () => (
    <div className="report-log-card">
      <span className="report-info-section-label">STATUS HISTORY</span>
      <div className="report-info-log">
        {[
          {
            status: "damaged",
            date: "2026-06-20T08:30:00Z",
            img: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=400&fit=crop",
            note: "Printer not feeding paper correctly, jams frequently.",
          },
          {
            status: "for_repair",
            date: "2026-06-21T09:00:00Z",
            img: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=400&fit=crop",
            note: "Endorsed to IT for diagnosis. Unit opened for inspection.",
          },
          {
            status: "working",
            date: "2026-06-22T14:00:00Z",
            img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
            note: "Repaired and returned to workstation, verified functional.",
          },
        ].map((log, index) => (
          <ReportLog key={index} log={log} />
        ))}
      </div>
    </div>
  ),
};
