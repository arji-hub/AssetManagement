// src/pages/Acquisition/Acquisition.jsx  (route: /assets/acquisition, admin only)
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import SearchBar from "../../components/ui/searchBar/SearchBar";
import Table from "../../components/panel/Table";
import AcquisitionCard from "../../components/ui/card/asset/AcquisitionCard";
import { useAcquisitions } from "../../hooks/asset/useAcquisitions";
import { acquisitionColumns } from "../../data/columns/acquisitionColumns";
import { displayDate } from "../../utils/date";
import BackButton from "../../components/ui/button/BackButton";
import "./Asset.css";
import "./Acquisition.css";

function Acquisition() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const { filteredAcquisitions, loading, error, search, setSearch } =
    useAcquisitions(role);

  return (
    <MainLayout>
      <div className="asset-page">
        <div className="asset-header">
          <div className="acq-header-main">
            <BackButton />
            <div className="asset-header-left">
              <h1 className="title">Acquisitions</h1>
              <p className="date">{displayDate}</p>
            </div>
          </div>

          <div className="asset-header-right">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search acquisitions..."
              className="asset-search-wrap"
            />
          </div>
        </div>

        <Table
          columns={acquisitionColumns}
          items={filteredAcquisitions}
          loading={loading}
          error={error}
          itemLabel="acquisitions"
          emptyMessage="No acquisitions found."
          emptyIcon="fa-solid fa-box-open"
          desktopPageSize={20}
          mobilePageSize={10}
          renderItem={(acquisition) => (
            <AcquisitionCard
              key={acquisition.id}
              acquisition={acquisition}
              columns={acquisitionColumns}
            />
          )}
        />
      </div>
    </MainLayout>
  );
}

export default Acquisition;
