import pandas as pd
import geopandas as gpd

# Load scored council data
scores = pd.read_json("public/data/councils.json")

# Load clean polygon file
polygons = gpd.read_file("public/data/Counties_and_Unitary_Authorities_2024.geojson")

# Merge using proper authority code
# Merge and reproject
merged = polygons.merge(scores, left_on="CTYUA24CD", right_on="authority_code", how="left")
merged = merged.to_crs(epsg=4326)  # Convert to WGS84 lat/lon — required by MapLibre
merged["lng"] = merged.geometry.centroid.x
merged["lat"] = merged.geometry.centroid.y


# Save to correct location
merged.to_file("public/data/council_polygons.geojson", driver="GeoJSON")

print("✅ Saved reprojected council_polygons.geojson with WGS84 coordinates.")
