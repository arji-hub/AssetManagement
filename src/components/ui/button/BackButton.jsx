import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./BackButton.css";

function BackButton({ nav = "" }) {
  const navigate = useNavigate();

  function handleClick() {
    if (nav) {
      navigate(nav);
      return;
    }

    const canGoBack = window.history.state?.idx > 0;
    navigate(canGoBack ? -1 : "/dashboard");
  }

  return (
    <button className="return-button" type="button" onClick={handleClick}>
      <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
      Back
    </button>
  );
}

export default BackButton;