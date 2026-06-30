// TransferCard.stories.jsx

import React from "react";
import { MemoryRouter } from "react-router-dom";
import TransferCard from "../../../components/ui/card/TransferCard";
import { MOCK_TRANSFERS } from "../../../data/transfer";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(fas);

export default {
  title: "Cards/TransferCard",
  component: TransferCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Pending = {
  args: {
    request: MOCK_TRANSFERS[0],
    onClick: (item) => console.log("clicked", item),
  },
};

export const ForApproval = {
  args: {
    request: MOCK_TRANSFERS[1],
    onClick: (item) => console.log("clicked", item),
  },
};

export const Completed = {
  args: {
    request: MOCK_TRANSFERS[2],
    onClick: (item) => console.log("clicked", item),
  },
};
