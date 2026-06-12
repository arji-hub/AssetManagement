// src/stories/form/BasicInfo.stories.jsx
import { useState } from "react";
import BasicInfo from "../../components/form/BasicInfo";

// ─── Stateful wrapper ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  serial_number: "",
  category_id: "",
  description: "",
  date_acquired: "",
  unit_value: "",
  qty: "1",
  remarks: "",
};

function BasicInfoWrapper({ initialForm = EMPTY_FORM }) {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return <BasicInfo form={form} onChange={handleChange} />;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────
export default {
  title: "Form/BasicInfo",
  component: BasicInfo,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

// Blank form — initial state when user lands on Step 1
export const Default = {
  name: "Empty form",
  render: () => <BasicInfoWrapper />,
};

// Required fields filled — Next button would be enabled
export const FilledRequired = {
  name: "Required fields filled",
  render: () => (
    <BasicInfoWrapper
      initialForm={{
        ...EMPTY_FORM,
        category_id: "Equipment",
        description: "Dell OptiPlex 7090 Desktop Computer with Intel Core i7",
        date_acquired: "2024-01-15",
        unit_value: "45000",
        qty: "1",
      }}
    />
  ),
};

// All fields filled including optional ones
export const FullyFilled = {
  name: "All fields filled",
  render: () => (
    <BasicInfoWrapper
      initialForm={{
        serial_number: "SN-99823-X",
        category_id: "Equipment",
        description: "Dell OptiPlex 7090 Desktop Computer with Intel Core i7",
        date_acquired: "2024-01-15",
        unit_value: "45000",
        qty: "3",
        remarks:
          "Purchased under CICT equipment budget FY2024. Under warranty until 2027.",
      }}
    />
  ),
};

// Multiple quantity — confirms qty field renders correctly above 1
export const MultipleUnits = {
  name: "Multiple units",
  render: () => (
    <BasicInfoWrapper
      initialForm={{
        ...EMPTY_FORM,
        serial_number: "SN-BATCH-2024",
        category_id: "Furniture",
        description: "Monobloc chairs, white, standard size",
        date_acquired: "2024-03-01",
        unit_value: "350",
        qty: "40",
      }}
    />
  ),
};
