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
	maxZoom: 32
});

esriWorldGrayCanvas.addTo(map);


// 2. Game state
let neighborhoodData;
let currentTarget;
let layerMap = {}; // key: neighborhood name, value: layer
let guessedNeighborhoods = new Set();
let missedCount = 0;

// 3. Load GeoJSON (hosted or local)
fetch("boston_neighborhoods.geojson")
  .then((res) => res.json())
  .then((data) => {
    neighborhoodData = data;
    const geojsonLayer = L.geoJSON(neighborhoodData, {
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
		if (guessedNeighborhoods.has(name)) return;
  		if (name === currentTarget) {
    		layer.setStyle({ fillColor: "green" });
   		 guessedNeighborhoods.add(name);
   		 nextQuestion();
  		} else {
   		 layer.setStyle({ fillColor: "red" });
		  missedCount++;
		  updateScoreTracker();
			setTimeout(() => {
              layer.setStyle({ fillColor: "#ccc" });
            }, 500);
  		}
		});
   	   },
    }).addTo(map);

	map.fitBounds(geojsonLayer.getBounds());

    // Fix for WordPress lazy loading / hidden containers
    setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(geojsonLayer.getBounds());
    }, 200);

    // Recenter on window resize (desktop + mobile)
    window.addEventListener("resize", () => {
      map.invalidateSize();
      map.fitBounds(geojsonLayer.getBounds());
    });
	  
	updateScoreTracker();
    nextQuestion();
  });

// 4. Pick and display a new neighborhood to guess
function nextQuestion() {
  // Get all neighborhood names
  const allNames = Object.keys(layerMap);

  // Filter out guessed neighborhoods
  const remaining = allNames.filter(name => !guessedNeighborhoods.has(name));

  if (remaining.length === 0) {
    document.getElementById("target-name").textContent = "All done!";
    // Optionally, disable further clicks or reset the game here
    return;
  }

  currentTarget = remaining[Math.floor(Math.random() * remaining.length)];
  document.getElementById("target-name").textContent = currentTarget;
}

//score tracker
function updateScoreTracker() {
	document.getElementById("score-tracker").textContent = `Missed: ${missedCount}`;
}

