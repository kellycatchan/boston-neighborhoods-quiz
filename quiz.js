// 1. Initialize the map
const map = L.map('map', {
  center: [42.3601, -71.0589],
  zoom: 12,
  zoomControl: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
  dragging: false,
});

const esriWorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});

esriWorldGrayCanvas.addTo(map);


// 2. Game state
let neighborhoodData;
let currentTarget;
let layerMap = {}; // key: neighborhood name, value: layer

// 3. Load GeoJSON (hosted or local)
fetch("boston_neighborhoods.geojson")
  .then((res) => res.json())
  .then((data) => {
    neighborhoodData = data;
    L.geoJSON(neighborhoodData, {
      style: {
        color: "#555",
        weight: 1,
        fillColor: "#ccc",
        fillOpacity: 1,
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.Name || feature.properties.name;
        layerMap[name] = layer;

        layer.on("click", () => {
          if (name === currentTarget) {
            layer.setStyle({ fillColor: "green" });
            nextQuestion();
          } else {
            layer.setStyle({ fillColor: "red" });
          }
        });
      },
    }).addTo(map);

    nextQuestion();
  });

// 4. Pick and display a new neighborhood to guess
function nextQuestion() {
  const names = Object.keys(layerMap);
  currentTarget = names[Math.floor(Math.random() * names.length)];
  document.getElementById("target-name").textContent = currentTarget;
}



