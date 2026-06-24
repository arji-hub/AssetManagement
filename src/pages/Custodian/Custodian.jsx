import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import "./Custodian.css";
import CustodianCard from "../../components/ui/card/CustodianCard";
import CustodianModal from "../../components/ui/modal/CustodianModal";
import AddingStatusModal from "../../components/ui/status/AddingStatusModal";
import { addCustodian, fetchCustodians } from "../../services/user";

function Custodian() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Custodians list ───────────────────────────────────────────────────────
  const [custodians, setCustodians] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchCustodians()
      .then((data) => {
        console.log("custodians:", data);
        setCustodians(data);
      })
      .catch((err) => console.error("Failed to fetch custodians:", err))
      .finally(() => setIsFetching(false));
  }, []);

  // ── Status modal ──────────────────────────────────────────────────────────
  // "idle" | "loading" | "success" | "error"
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState(null);

  const handleAddCustodian = async (formData) => {
    setIsSubmitting(true);
    setShowModal(false);
    setStatus("loading");
    setSubmitError(null);

    try {
      await addCustodian(formData);
      // Re-fetch so the new custodian appears in the list
      const updated = await fetchCustodians();
      setCustodians(updated);
      setStatus("success");
    } catch (error) {
      console.error("Failed to add custodian:", error);
      setSubmitError(
        error.message || "Something went wrong. Please try again.",
      );
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusClose = () => {
    setStatus("idle");
    setSubmitError(null);
  };

  return (
    <MainLayout>
      <div className="custodian-page">
        <div className="custodian-top">
          <div className="custodian-header">
            <h1>Custodian</h1>
            <p>Welcome, {user.username}! This is the custodian page.</p>
          </div>
          <div className="custodian-settings">
            {/* Filters */}
            <div className="filters">
              <label htmlFor="classification-filter">Classification:</label>
              <select id="classification-filter" name="classification">
                <option value="">All</option>
                <option value="fulltime">Full Time</option>
                <option value="parttime">Part Time</option>
              </select>
            </div>
            <button
              className="settings-button"
              onClick={() => setShowModal(true)}
            >
              Add Custodian
            </button>
          </div>
        </div>

        {/* ── Custodian Cards ── */}
        <div className="custodian-cards">
          {isFetching ? (
            <p className="custodian-loading">Loading custodians...</p>
          ) : custodians.length === 0 ? (
            <p className="custodian-empty">No custodians found.</p>
          ) : (
            custodians.map((c) => {
              return (
                <CustodianCard
                  key={c.id}
                  name={c.fullname}
                  username={c.username}
                  classification={c.role}
                  totalAssets={c.asset_count ?? 0}
                />
              );
            })
          )}
        </div>
      </div>

      {/* ── CustodianModal ── */}
      {showModal && (
        <CustodianModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddCustodian}
          isSubmitting={isSubmitting}
        />
      )}

      {/* ── Status Modal ── */}
      {status !== "idle" && (
        <AddingStatusModal
          title="Custodian"
          status={status}
          errorMessage={submitError}
          onClose={handleStatusClose}
        />
      )}
    </MainLayout>
  );
}

export default Custodian;
