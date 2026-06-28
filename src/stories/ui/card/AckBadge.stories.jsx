// AckBadge.stories.jsx

import React from "react";
import AckBadge from "../../../components/ui/card/AckBadge";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(fas);

export default {
  title: "Cards/AckBadge",
  component: AckBadge,
};

export const Acknowledged = {
  args: {
    label: "Admin",
    ack: {
      acknowledged: true,
      acknowledged_at: { seconds: 1750000000 },
      uid: "nbpeyfOAk9NNpzwn5157DBNoy7x2",
    },
  },
};

export const Pending = {
  args: {
    label: "To",
    ack: {
      acknowledged: false,
      acknowledged_at: null,
      uid: "RkH5jtGKUrSbLbQC4phfmiomKGe2",
    },
  },
};

export const NullAck = {
  args: {
    label: "From",
    ack: {
      acknowledged: false,
      acknowledged_at: null,
      uid: null,
    },
  },
};

export const AllThree = {
  render: () => (
    <div style={{ display: "flex", gap: "12px", padding: "16px" }}>
      <AckBadge
        label="Admin"
        ack={{ acknowledged: true, acknowledged_at: { seconds: 1750000000 } }}
      />
      <AckBadge
        label="From"
        ack={{ acknowledged: false, acknowledged_at: null, uid: null }}
      />
      <AckBadge
        label="To"
        ack={{ acknowledged: false, acknowledged_at: null, uid: "abc123" }}
      />
    </div>
  ),
};