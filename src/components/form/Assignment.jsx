import "./Form.css";
import "./Assignment.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SearchableSelect from "./SearchableSelect";

function Assignment({
  form,
  onChange,
  skippedWarning,
  fulltimeCustodians,
  rooms,
  loadingOptions,
}) {
  const custodianOptions = fulltimeCustodians.map((c) => ({
    id: c.id,
    label: c.fullname,
  }));

  const roomOptions = rooms.map((r) => ({
    id: r.id,
    label: r.name,
  }));

  return (
    <div className="reg-card">
      <p className="reg-card-title">Custody &amp; Location</p>
      <p className="reg-card-subtitle">
        Assign a custodian and room to this asset. You may skip and update this
        later.
      </p>

      {skippedWarning && (
        <div className="reg-skip-warning">
          <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
          This asset will be saved as <strong>unassigned</strong>. You can
          assign it later from the asset detail page.
        </div>
      )}

      <div className="reg-grid">
        <div className="reg-field">
          <label className="reg-label">Primary Custodian</label>
          <SearchableSelect
            options={custodianOptions}
            value={form.primary_custodian}
            loading={loadingOptions}
            placeholder="Select Custodian"
            searchPlaceholder="Search custodians…"
            emptyMessage="No custodians found."
            onSelect={(id) =>
              onChange({ target: { name: "primary_custodian", value: id } })
            }
          />
        </div>

        <div className="reg-field">
          <label className="reg-label">Location</label>
          <SearchableSelect
            options={roomOptions}
            value={form.room_id}
            loading={loadingOptions}
            placeholder="Select Location"
            searchPlaceholder="Search locations…"
            emptyMessage="No locations found."
            onSelect={(id) =>
              onChange({ target: { name: "room_id", value: id } })
            }
          />
        </div>
      </div>
    </div>
  );
}

export default Assignment;
