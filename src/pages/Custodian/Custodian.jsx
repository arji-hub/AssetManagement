import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import "./Custodian.css";
import CustodianCard from "../../components/ui/card/CustodianCard";
import CustodianModal from "../../components/ui/modal/CustodianModal";

function Custodian() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleAddCustodian = (formData) => {
    console.log("New custodian:", formData);
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
            {/*Filters */}
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
            {showModal && (
              <CustodianModal
                onClose={() => setShowModal(false)}
                onSubmit={handleAddCustodian}
              />
            )}
          </div>
        </div>
        <div className="custodian-cards">
          <CustodianCard
            name="Ralph Gomez M. Gatmaitan"
            classification={"parttime"}
            totalAssets={888}
          />
          <CustodianCard
            name="Jasper C. Ortega"
            classification={"fulltime"}
            totalAssets={10}
          />
          <CustodianCard
            name="Jonathan D. Santos"
            classification={"contractual"}
            totalAssets={3}
          />
          <CustodianCard
            name="Michael B. Tomacruz"
            classification={"parttime"}
            totalAssets={8}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export default Custodian;
