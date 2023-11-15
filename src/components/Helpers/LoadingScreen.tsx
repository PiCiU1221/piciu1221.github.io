import React from "react";
import "../../../styles/LoadingScreen.css";

interface LoadingScreenProps {
  isLoading: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  return (
    <div className={`loading-screen ${isLoading ? "active" : ""}`}>
      <div className="loader"></div>
    </div>
  );
};

export default LoadingScreen;
