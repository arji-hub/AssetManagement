// components/ui/dropdown/ManageAsset.jsx

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TransferModal from "../modal/TransferModal";
import ReportModal from "../modal/ReportModal";
import TransferMR from "../modal/TransferMR";
import useManageAsset from "../../../hooks/useManageAsset";
import "./ManageAsset.css";

function ManageAsset({ asset }) {
  const {
    isOpen,
    isMounted,
    activeModal,
    wrapperRef,
    toggleMenu,
    openModal,
    closeModal,
    permissions,
  } = useManageAsset(asset);

  const { canReport, canTransfer, canLocalMR } = permissions;
  const assetID = asset?.id;

  // nothing this user can do — don't render the button at all
  if (!canReport && !canTransfer && !canLocalMR) return null;

  return (
    <div className="manage-asset" ref={wrapperRef}>
      <button
        type="button"
        className={`manage-asset-btn${isOpen ? " is-open" : ""}`}
        onClick={toggleMenu}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <FontAwesomeIcon icon="fa-solid fa-gear" />
        Manage
        <FontAwesomeIcon
          icon="fa-solid fa-chevron-down"
          className="manage-asset-chevron"
        />
      </button>

      {isMounted && (
        <ul
          className={`manage-asset-menu${isOpen ? " is-open" : ""}`}
          role="menu"
        >
          {canTransfer && (
            <li role="menuitem">
              <button
                type="button"
                className="manage-asset-menu-item"
                onClick={() => openModal("transfer")}
              >
                <FontAwesomeIcon icon="fa-solid fa-right-left" />
                Transfer
              </button>
            </li>
          )}
          {canLocalMR && (
            <li role="menuitem">
              <button
                type="button"
                className="manage-asset-menu-item"
                onClick={() => openModal("mr")}
              >
                <FontAwesomeIcon icon="fa-solid fa-user-plus" />
                Local MR
              </button>
            </li>
          )}
          {canReport && (
            <li role="menuitem">
              <button
                type="button"
                className="manage-asset-menu-item manage-asset-menu-item--danger"
                onClick={() => openModal("report")}
              >
                <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
                Report
              </button>
            </li>
          )}
        </ul>
      )}

      {activeModal === "transfer" && canTransfer && (
        <TransferModal assetID={assetID} onClose={closeModal} />
      )}
      {activeModal === "mr" && canLocalMR && (
        <TransferMR assetID={assetID} onClose={closeModal} />
      )}
      {activeModal === "report" && canReport && (
        <ReportModal assetID={assetID} onClose={closeModal} />
      )}
    </div>
  );
}

export default ManageAsset;