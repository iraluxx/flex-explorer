function CouncilDetail({ council }) {
  if (!council) {
    return <div className="p-4 text-gray-500">Select a council to see details.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{council.name}</h2>
      <ul className="mt-4 space-y-2 text-gray-700">
        <li>EV Score: {council.ev_score}</li>
        <li>Solar Score: {council.solar_score}</li>
        <li>Fuel Poverty Score: {council.fuel_poverty_score}</li>
        <li>Grants Score: {council.grants_score}</li>
      </ul>
      <div className="mt-4 text-lg font-bold">
        Total Flex Potential Score: {council.total_score}
      </div>
    </div>
  );
}

export default CouncilDetail;
