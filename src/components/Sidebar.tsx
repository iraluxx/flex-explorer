function Sidebar({ councils, onSelectCouncil, onHoverCouncil, selectedCouncil, hoveredCouncil, activeScoreField }) {
  const uniqueCouncils = Array.from(
    new Map(councils.map(c => [c.authority_code, c])).values()
  );

  return (
    <div className="p-4">
      <h2 className="font-bold text-sm mb-2">Local Authorities</h2>
      {uniqueCouncils.map((council) => {
        const isSelected = selectedCouncil?.authority_name === council.authority_name;
        const isHovered = hoveredCouncil?.authority_name === council.authority_name;

        return (
          <div
            key={council.authority_code}
            onClick={() => onSelectCouncil(council)}
            onMouseEnter={() => onHoverCouncil(council)}
            onMouseLeave={() => onHoverCouncil(null)}
            className={`p-2 cursor-pointer text-sm border mb-1 rounded ${
              isSelected ? 'bg-blue-100' : isHovered ? 'bg-yellow-100' : ''
            }`}
          >
            <div className="font-medium">{council.authority_name}</div>
            
            <div className="text-xs text-gray-600">
  {activeScoreField.replace("_score", "").replace("_", " ")}: {council[activeScoreField]?.toFixed(2)}
</div>


          </div>
        );
      })}
    </div>
  );
}

export default Sidebar;
