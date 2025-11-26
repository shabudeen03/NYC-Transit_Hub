import "../App.css";

import ServiceDashboard from "../components/ServiceDashboard";
import StationsMap from "../components/StationsMap";

export default function HomePage() {
  return (
    <>
      <div>
        <h1>NYC Transit Hub</h1>
        <div className="main-container">
            <div className="dashboard-container">
                <ServiceDashboard />
            </div>
            <StationsMap />
        </div>
      </div>
    </>
  );
}
