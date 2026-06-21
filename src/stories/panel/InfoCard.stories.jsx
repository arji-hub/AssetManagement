// InfoCard.stories.jsx
import InfoCard from "../../components/panel/InfoCard";
import { formatCurrency } from "../../utils/formatCurrency";

export default {
  title: "Panel/InfoCard",
  component: InfoCard,
};

const MOCK_ASSET = {
  id: "cict-1001",
  serial_number: "Q7C4J26764",
  category_id: "Office Equipment",
  description: "Epson Printer Dot Matrix LX 310",
  unit_value: 17000,
  qty: 1,
  status: "Working",
  remarks: "n/a",
  asset_image_url: null,
  property_custodian_name: "Ralph Jasper",
  local_mr_name: "Lance Reyes",
  room_id: "SDL I",
};

export const Default = {
  args: {
    asset: MOCK_ASSET,
    formatCurrency,
  },
};

export const NoImage = {
  args: {
    asset: { ...MOCK_ASSET, asset_image_url: null },
    formatCurrency,
  },
};

export const WithImage = {
  args: {
    asset: {
      ...MOCK_ASSET,
      asset_image_url: "https://placehold.co/300x300?text=Asset",
    },
    formatCurrency,
  },
};

export const DamagedStatus = {
  args: {
    asset: { ...MOCK_ASSET, status: "Damaged" },
    formatCurrency,
  },
};

export const MissingStatus = {
  args: {
    asset: { ...MOCK_ASSET, status: "Missing" },
    formatCurrency,
  },
};

export const NoOptionalFields = {
  args: {
    asset: {
      ...MOCK_ASSET,
      serial_number: null,
      remarks: null,
      room_id: null,
      property_custodian_name: null,
      local_mr_name: null,
    },
    formatCurrency,
  },
};
