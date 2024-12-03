let earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson";

// Fetch the earthquake data
d3.json(earthquakeURL).then(function (data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function to determine the color based on earthquake depth
  function getColor(depth) {
    if (depth > 90) return '#9B1C31'; // Deep red for deep earthquakes
    if (depth > 70) return '#F26C4F'; // Soft red-orange
    if (depth > 50) return '#F4A261'; // Soft orange
    if (depth > 30) return '#2D6A4F'; // Dark green
    if (depth > 10) return '#4C9F70'; // Lush green
    return '#A8DADC'; // Light blue for shallow earthquakes
  }

  // Function to create markers for each earthquake
  function pointToLayer(feature, latlng) {
    let depth = feature.geometry.coordinates[2]; // Depth of earthquake
    return L.circleMarker(latlng, {
      radius: feature.properties.mag * 3, // Size of marker based on magnitude
      fillColor: getColor(depth), // Fill color based on depth
      color: "#000", // Border color of marker
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });
  }

  // Function to add popup with earthquake details
  function onEachFeature(feature, layer) {
    layer.bindPopup(`
      <h3>${feature.properties.place}</h3>
      <hr>
      <p>${new Date(feature.properties.time)}</p>
    `);
  }

  // Create a GeoJSON layer for the earthquakes
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,  // Attach popup to each feature
    pointToLayer: pointToLayer     // Create custom markers
  });

  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Base layers (Tile layers)
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  let satellite = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; <a href="http://www.esri.com/">Esri</a> i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  // Base map layers to toggle
  let baseMaps = {
    "Grey Scale": street,
    "Outdoors": topo,
    "Satellite": satellite
  };

  // Overlay layer (Earthquakes)
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create the map object centered on the US and initial zoom level of 5
  let myMap = L.map("map", {
    center: [39.8283, -98.5795], // US latitude/longitude
    zoom: 5,
    layers: [street, earthquakes] // Set default base layer and overlay
  });

  // Add layer control to toggle between layers
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create the legend for earthquake depth ranges
  let legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'info legend');
    
    // Define depth ranges and corresponding colors
    let limits = [-10, 10, 30, 50, 70, 90, 110];
    let colors = ['#A8DADC', '#4C9F70', '#2D6A4F', '#F4A261', '#F26C4F', '#9B1C31'];

    // Create the legend labels
    for (let i = 0; i < limits.length - 1; i++) {
      let label = i === limits.length - 2 ? `${limits[i]}+` : `${limits[i]}-${limits[i + 1]}`;
      div.innerHTML += `
        <div style="display: flex; align-items: center;">
          <div style="background-color: ${colors[i]}; width: 20px; height: 20px; margin-right: 8px;"></div>
          <span>${label}</span>
        </div>
      `;
    }
    
    return div;
  };

  legend.addTo(myMap);
}
