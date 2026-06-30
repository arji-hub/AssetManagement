// TransferLogEntry.stories.jsx

import React from "react";
import TransferLogEntry from "../../../components/ui/card/TransferLogEntry";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(fas);

export default {
  title: "Cards/TransferLogEntry",
  component: TransferLogEntry,
};

export const Created = {
  args: {
    log: {
      action: "created",
      by_name: "Admin User",
      date: { seconds: 1750000000 },
      note: "",
    },
  },
};

export const Approved = {
  args: {
    log: {
      action: "approved",
      by_name: "Admin User",
      date: { seconds: 1750100000 },
      note: "Approved after verification.",
    },
  },
};

export const Denied = {
  args: {
    log: {
      action: "denied",
      by_name: "Admin User",
      date: { seconds: 1750200000 },
      note: "Asset is currently in use.",
    },
  },
};

export const WithoutNote = {
  args: {
    log: {
      action: "completed",
      by_name: "Jasper Adlawan",
      date: { seconds: 1750300000 },
      note: "",
    },
  },
};

export const Timeline = {
  render: () => (
    <div style={{ padding: "16px", maxWidth: "480px" }}>
      {[
        {
          action: "created",
          by_name: "Admin User",
          date: { seconds: 1750000000 },
          note: "",
        },
        {
          action: "approved",
          by_name: "Admin User",
          date: { seconds: 1750100000 },
          note: "Approved after verification.",
        },
        {
          action: "completed",
          by_name: "Jasper Adlawan",
          date: { seconds: 1750200000 },
          note: "",
        },
      ].map((log, i) => (
        <TransferLogEntry key={i} log={log} />
      ))}
    </div>
  ),
};
