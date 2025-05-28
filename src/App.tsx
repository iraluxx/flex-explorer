import { useEffect, useState } from 'react';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import CouncilDetail from './components/CouncilDetail';
import ScoreHelpPanel from './components/ScoreHelpPanel';

function App() {
  const [councils, setCouncils] = useState([]);
  const [selectedCouncil, setSelectedCouncil] = useState(null);
  const [hoveredCouncil, setHoveredCouncil] = useState(null);
  const [activeScoreField, setActiveScoreField] = useState("total_score");
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [polygonData, setPolygonData] = useState(null);
  
  

  useEffect(() => {
    fetch("/data/council_polygons.min.geojson")
      .then((res) => res.json())
      .then(setCouncils);
  }, []);

  useEffect(() => {
    fetch('/data/council_polygons.min.geojson')
      .then((res) => res.json())
      .then(setPolygonData);
  }, []);

  const filteredCouncils = councils.filter((council) => {
    const value = council[activeScoreField];
    return typeof value === "number" && value >= minScoreFilter;
  });


  console.table(
  councils.map((c) => ({
    name: c.name,
    ev: c.ev_score,
    solar: c.solar_score,
    poverty: c.fuel_poverty_score,
    grants: c.grants_score,
    total: c.total_score
  }))
);
 
  const enrichedCouncils = filteredCouncils.map((c) => {
    const match = polygonData?.features.find(
      (f) => f.properties?.authority_code === c.authority_code
    );
    return {
      ...c,
      geometry: match?.geometry || null,
    };
  });

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      {/* Top header */}
      <div className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold">UK Local Flexibility Explorer</h1>
        <p className="text-sm text-gray-600 mt-1">
          This tool compares UK local authorities on demand-side flexibility potential - based on EV uptake, solar installations, energy poverty, and retrofit grant funding. Use it to identify where distributed energy resources can support grid decarbonisation.</p>
          <p className="text-sm text-gray-600 mt-1">
          Compare UK local authorities on their demand-side flexibility potential — 
          based on EV infrastructure, solar adoption, retrofit grants, and energy poverty.
        </p>
          <p className="text-sm text-gray-600 mt-1">Click a region to view its profile.</p>
        
      </div>

      {/* Filter Controls */}
      <div className="flex p-2 bg-gray-100 border-b flex-wrap gap-4">
        <div>
          <label className="mr-2 font-medium">Score Type:</label>
          {["total_score", "ev_score", "solar_score", "fuel_poverty_score", "grants_score"].map((field) => (
            <button
              key={field}
              className={`px-2 py-1 mx-1 rounded capitalize ${
                activeScoreField === field
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600 border"
              }`}
              onClick={() => setActiveScoreField(field)}
            >
              {field.replace("_score", "").replace("_", " ")}
            </button>
          ))}
        </div>

        <div>
          <label className="mr-2 font-medium">Min Score:</label>
          {[0, 3, 5, 7].map((score) => (
            <button
              key={score}
              className={`px-2 py-1 mx-1 rounded ${
                minScoreFilter === score
                  ? "bg-blue-500 text-white"
                  : "bg-white text-blue-500 border"
              }`}
              onClick={() => setMinScoreFilter(score)}
            >
              ≥ {score}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-row flex-grow overflow-hidden">
        {/* Sidebar */}
        <div className="h-full w-1/4 overflow-y-auto border-r bg-gray-50">
          <Sidebar
            councils={enrichedCouncils}
            selectedCouncil={selectedCouncil}
            hoveredCouncil={hoveredCouncil}
            onSelectCouncil={setSelectedCouncil}
            onHoverCouncil={setHoveredCouncil}
            activeScoreField={activeScoreField}
          />
        </div>

        {/* Map */}
        <div className="h-full w-1/2">
          {polygonData ? (
            <Map
              councils={enrichedCouncils}
              onSelectCouncil={setSelectedCouncil}
              selectedCouncil={selectedCouncil}
              hoveredCouncil={hoveredCouncil}
              activeScoreField={activeScoreField}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Loading map...
            </div>
          )}
        </div>

        {/* Council Detail */}
        <div className="h-full w-1/4 overflow-y-auto border-l bg-gray-50">
          <CouncilDetail council={selectedCouncil} />
        </div>
      </div>
    </div>
  );
}

export default App;
