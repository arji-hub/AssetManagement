import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./BackButton.css";

function BackButton() {
  const navigate = useNavigate();

  function handleClick() {
    const canGoBack = window.history.state?.idx > 0;

    if (canGoBack) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  }

  return (
    <button className="return-button" type="button" onClick={handleClick}>
      <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
      Back
    </button>
  );
}

export default BackButton;