import maplibregl from 'maplibre-gl';
import { useEffect, useRef } from 'react';

function Map({ councils, onSelectCouncil, selectedCouncil, hoveredCouncil }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRefs = useRef({}); // Track markers by name

  useEffect(() => {
    if (!mapRef.current) {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://api.maptiler.com/maps/dataviz/style.json?key=GsW0wdsZ9Lg8DzwTIJOT',
        center: [-0.1, 52],
        zoom: 5,
      });

      mapRef.current = map;

      map.on("load", () => {
          // Force a zoom nudge to trigger paint and show polygons
  map.flyTo({ center: [-0.1, 52], zoom: 5.1, duration: 0 });
        setTimeout(() => map.resize(), 100);


        fetch("/data/council_polygons.geojson")
          .then(res => res.json())
          .then(data => {
            map.addSource("council-polygons", {
              type: "geojson",
              data: data,
            });

            map.addLayer({
              id: "council-fill",
              type: "fill",
              source: "council-polygons",
              paint: {
                "fill-color": [
                  "interpolate",
                  ["linear"],
                  ["get", "total_score"],
                  0, "#f2f0f7",
                  5, "#cbc9e2",
                  10, "#9e9ac8",
                  15, "#756bb1",
                  20, "#54278f"
                ],
                "fill-opacity": 0.5,
              },
            });

            map.addLayer({
              id: "council-outline",
              type: "line",
              source: "council-polygons",
              paint: {
                "line-color": "#444",
                "line-width": 0.5,
              },
            });

            map.addLayer({
  id: "council-selected",
  type: "line",
  source: "council-polygons",
  paint: {
    "line-color": "#ff0000",
    "line-width": 3,
  },
  filter: ["==", "authority_code", ""], // empty initially
});
 

map.on("click", "council-fill", (e) => {
  const feature = e.features?.[0];
  if (!feature) return;

  const props = feature.properties;

  // Construct minimal compatible selectedCouncil
  const selected = {
    authority_name: props.authority_name || props.CTYUA24NM || props.name,
    authority_code: props.authority_code,
    total_score: props.total_score,
    geometry: feature.geometry,
    // optional: lng/lat if you've embedded centroids
    lng: props.lng,
    lat: props.lat,
  };

  onSelectCouncil(selected);
});


            map.on("mousemove", "council-fill", () => {
              map.getCanvas().style.cursor = "pointer";
            });

            map.on("mouseleave", "council-fill", () => {
              map.getCanvas().style.cursor = "";
            });
          });
      });
    }
  }, []);

useEffect(() => {
  if (!mapRef.current?.getLayer("council-selected")) return;

  const code = selectedCouncil?.authority_code || "";
  mapRef.current.setFilter("council-selected", ["==", "authority_code", code]);
}, [selectedCouncil]);


  useEffect(() => {
    if (!mapRef.current || councils.length === 0) return;
    const map = mapRef.current;
    markerRefs.current = {}; // reset

    councils.forEach((council) => {
      if (
        typeof council.lat !== 'number' ||
        typeof council.lng !== 'number' ||
        isNaN(council.lat) || isNaN(council.lng)
      ) return;

      const el = document.createElement('div');
      Object.assign(el.style, {
        width: '32px',
        height: '32px',
        backgroundColor:
          council.total_score >= 7 ? 'green' :
          council.total_score >= 5 ? 'orange' :
          'red',
        borderRadius: '50%',
        border: '2px solid white',
        boxShadow: '0 0 6px rgba(0,0,0,0.4)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      });

      const inner = document.createElement('div');
      inner.innerText = council.total_score;
      Object.assign(inner.style, {
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
        transition: 'transform 0.2s ease',
      });

      el.appendChild(inner);

      el.addEventListener('mouseenter', () => {
        inner.style.transform = 'scale(1.5)';
      });

      el.addEventListener('mouseleave', () => {
        inner.style.transform = 'scale(1)';
      });

      el.addEventListener('click', () => {
        onSelectCouncil(council);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([council.lng, council.lat])
        .setPopup(new maplibregl.Popup().setText(council.authority_name))
        .addTo(map);

      markerRefs.current[council.authority_name] = { marker, el };
    });
  }, [councils, onSelectCouncil]);

  useEffect(() => {
  if (!mapRef.current || !selectedCouncil) return;

  const { lng, lat, geometry } = selectedCouncil;

  // Try lng/lat from markers first
  if (
    typeof lng === 'number' &&
    typeof lat === 'number' &&
    !isNaN(lng) && !isNaN(lat)
  ) {
    mapRef.current.flyTo({ center: [lng, lat], zoom: 9 });
    return;
  }

  // If geometry exists, fit to polygon bounds
  if (geometry?.type === 'Polygon' || geometry?.type === 'MultiPolygon') {
    const bounds = new maplibregl.LngLatBounds();

    const coords =
      geometry.type === 'Polygon'
        ? geometry.coordinates[0]
        : geometry.coordinates[0][0]; // MultiPolygon outer ring

    coords.forEach(([lng, lat]) => bounds.extend([lng, lat]));

    mapRef.current.fitBounds(bounds, { padding: 40, duration: 500 });
  }
}, [selectedCouncil]);


return (
  <div className="relative h-full w-full">
    <div ref={mapContainer} className="h-full w-full" />

    {/* Legend Overlay */}
    <div
      style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'white',
        padding: '6px 10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 999,
      }}
    >
      <div><span style={{ background: '#f2f0f7', display: 'inline-block', width: 12, height: 12, marginRight: 6 }} /> Low</div>
      <div><span style={{ background: '#cbc9e2', display: 'inline-block', width: 12, height: 12, marginRight: 6 }} /> Moderate</div>
      <div><span style={{ background: '#9e9ac8', display: 'inline-block', width: 12, height: 12, marginRight: 6 }} /> Good</div>
      <div><span style={{ background: '#756bb1', display: 'inline-block', width: 12, height: 12, marginRight: 6 }} /> High</div>
      <div><span style={{ background: '#54278f', display: 'inline-block', width: 12, height: 12, marginRight: 6 }} /> Very High</div>
    </div>
  </div>
);

}
export default Map;
