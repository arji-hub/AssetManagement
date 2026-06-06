import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import "./Custodian.css";
import CustodianCard from "../../components/ui/CustodianCard";

function Custodian() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="custodian-page">
        <div className="custodian-top">
          <div className="custodian-header">
            <h1>Custodian Page</h1>
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
            <button className="settings-button">Add Custodian</button>
          </div>
        </div>
        <div className="custodian-cards">
          <CustodianCard
            name="John Doe"
            classification={"parttime"}
            totalAssets={888}
          />
          <CustodianCard
            name="Jane Smith"
            classification={"fulltime"}
            totalAssets={10}
          />
          <CustodianCard
            name="Emily Davis"
            classification={"contractual"}
            totalAssets={3}
          />
          <CustodianCard
            name="Michael Brown"
            classification={"parttime"}
            totalAssets={8}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export default Custodian;
