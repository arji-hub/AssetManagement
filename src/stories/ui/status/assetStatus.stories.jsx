// assetStatus.stories.jsx

import React from "react";
import { Status } from "../../../components/ui/status/assetStatus";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(fas);

export default {
  title: "Status/AssetStatus",
  component: Status,
};

export const Working = {
  args: { status: "Working" },
};

export const ForRepair = {
  args: { status: "For Repair" },
};

export const Condemned = {
  args: { status: "Condemned" },
};

export const Missing = {
  args: { status: "Missing" },
};

export const Pending = {
  args: { status: "pending" },
};

export const ForApproval = {
  args: { status: "for_approval" },
};

export const Completed = {
  args: { status: "completed" },
};

export const Denied = {
  args: { status: "denied" },
};

export const Unknown = {
  args: { status: "unknown_status" },
};

export const AllStatuses = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {[
        "Working",
        "For Repair",
        "Condemned",
        "Missing",
        "pending",
        "for_approval",
        "completed",
        "denied",
        "unknown_status",
      ].map((s) => (
        <Status key={s} status={s} />
      ))}
    </div>
  ),
};
