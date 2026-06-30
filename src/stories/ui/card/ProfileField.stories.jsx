// ProfileField.stories.jsx

import React from "react";
import ProfileField from "../../../components/ui/card/ProfileField";

export default {
  title: "Cards/ProfileField",
  component: ProfileField,
};

export const WithValue = {
  args: {
    label: "Full Name",
    value: "Juan dela Cruz",
  },
};

export const WithEmail = {
  args: {
    label: "Email",
    value: "juan@bsu.edu.ph",
  },
};

export const WithRole = {
  args: {
    label: "Role",
    value: "Property Custodian",
  },
};

export const EmptyValue = {
  args: {
    label: "Department",
    value: "",
  },
};

export const UndefinedValue = {
  args: {
    label: "Contact Number",
  },
};