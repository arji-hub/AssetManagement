// LinkedAccountsCard.stories.jsx

import React from "react";
import LinkedAccountsCard from "../../../components/panel/LinkedAccountsCard";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(fas);

export default {
  title: "Cards/LinkedAccountsCard",
  component: LinkedAccountsCard,
};

// Helper to build mock linked-provider state
function buildProps({ linked = [], pending = null, error = "" } = {}) {
  return {
    isLinked: (providerId) => linked.some((p) => p.providerId === providerId),
    getLinkedEmail: (providerId) =>
      linked.find((p) => p.providerId === providerId)?.email ?? null,
    pending,
    error,
    handleLinkGoogle: () => console.log("handleLinkGoogle called"),
    handleLinkMicrosoft: () => console.log("handleLinkMicrosoft called"),
    handleUnlink: (providerId) => console.log("handleUnlink called", providerId),
  };
}

export const NoneConnected = {
  render: () => <LinkedAccountsCard {...buildProps()} />,
};

export const GoogleConnected = {
  render: () => (
    <LinkedAccountsCard
      {...buildProps({
        linked: [{ providerId: "google.com", email: "juan.delacruz@gmail.com" }],
      })}
    />
  ),
};

export const MicrosoftConnected = {
  render: () => (
    <LinkedAccountsCard
      {...buildProps({
        linked: [
          { providerId: "microsoft.com", email: "2023100375@ms.bulsu.edu.ph" },
        ],
      })}
    />
  ),
};

export const BothConnected = {
  render: () => (
    <LinkedAccountsCard
      {...buildProps({
        linked: [
          { providerId: "google.com", email: "juan.delacruz@gmail.com" },
          { providerId: "microsoft.com", email: "2023100375@ms.bulsu.edu.ph" },
        ],
      })}
    />
  ),
};

export const ConnectingMicrosoft = {
  render: () => (
    <LinkedAccountsCard
      {...buildProps({
        linked: [{ providerId: "google.com", email: "juan.delacruz@gmail.com" }],
        pending: "microsoft",
      })}
    />
  ),
};

export const DisconnectingGoogle = {
  render: () => (
    <LinkedAccountsCard
      {...buildProps({
        linked: [
          { providerId: "google.com", email: "juan.delacruz@gmail.com" },
          { providerId: "microsoft.com", email: "2023100375@ms.bulsu.edu.ph" },
        ],
        pending: "google",
      })}
    />
  ),
};

export const WithError = {
  render: () => (
    <LinkedAccountsCard
      {...buildProps({
        linked: [{ providerId: "google.com", email: "juan.delacruz@gmail.com" }],
        error: "This account is already linked to a different user.",
      })}
    />
  ),
};

export const AllStates = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px" }}>
      <LinkedAccountsCard {...buildProps()} />
      <LinkedAccountsCard
        {...buildProps({
          linked: [{ providerId: "google.com", email: "juan.delacruz@gmail.com" }],
        })}
      />
      <LinkedAccountsCard
        {...buildProps({
          linked: [
            { providerId: "google.com", email: "juan.delacruz@gmail.com" },
            { providerId: "microsoft.com", email: "2023100375@ms.bulsu.edu.ph" },
          ],
        })}
      />
      <LinkedAccountsCard
        {...buildProps({
          linked: [{ providerId: "google.com", email: "juan.delacruz@gmail.com" }],
          error: "This account is already linked to a different user.",
        })}
      />
    </div>
  ),
};