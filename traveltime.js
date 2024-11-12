
const map = L.map('map').setView([53.521288, -7.348414], 8); // Default view

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '�� OpenStreetMap'
}).addTo(map);

let allGeoJsonFeatures = []; // Store all GeoJSON features for merging
let pinMarkers = []; // Store pin markers
let pinCount = 0; // Counter for total pins added

document.getElementById('isochroneForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const locationsInput = document.getElementById('locations').value.trim();
    const locations = locationsInput.split('\n').map(line => {
        const coords = line.split(',').map(coord => parseFloat(coord.trim()));
        return {
            lat: coords[0], // Latitude first
            lng: coords[1]  // Longitude second
        };
    });

    const arrivalTime = document.getElementById('arrival_time').value;
const travelTime = parseInt(document.getElementById('travel_time').value) * 60; // Convert minutes to seconds
const travelMode = document.getElementById('travel_mode').value;
const opacity = parseFloat(document.getElementById('opacity').value);

const batchSize = 10; // Limit to 10 locations at a time
let index = 0;
let attemptedCoordinates = []; // Store attempted coordinates
let successfulCoordinates = []; // Store successful coordinates

const processBatch = () => {
    const batch = locations.slice(index, index + batchSize);
    if (batch.length === 0) {
        // All batches processed, check for failures
        checkForFailures();
        return; // No more locations to process
    }

    attemptedCoordinates.push(...batch); // Add attempted coordinates to the list

    const arrivalSearches = batch.map((coords, batchIndex) => ({
        id: `isochrone-${index + batchIndex}`,
        coords: coords,
        arrival_time: arrivalTime,
        travel_time: travelTime,
        transportation: {
            type: travelMode,
            walking_time: 900, // Default walking time
            cycling_time_to_station: 100, // Default cycling time
            parking_time: 0,
            boarding_time: 0,
            driving_time_to_station: 1800, // Default driving time
            pt_change_delay: 0,
            disable_border_crossing: false
        },
        level_of_detail: {
            scale_type: "simple",
            level: "medium"
        },
        no_holes: false,
        polygons_filter: {
            limit: 100
        },
        snapping: {
            penalty: "enabled",
            accept_roads: "both_drivable_and_walkable"
        },
        render_mode: "approximate_time_filter",
        remove_water_bodies: true,
        range: {
            enabled: false,
            width: 3600
        }
    }));

    const requestBody = {
        arrival_searches: arrivalSearches // This is an array
    };

    fetch('https://api.traveltimeapp.com/v4/time-map', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Application-Id': config.appId,
            'X-Api-Key': config.apiKey
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        const geoJsonFeatures = {
            type: "FeatureCollection",
            features: data.results.map(result => ({
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: result.shapes.map(shape =>
                        shape.shell.map(coord => [coord.lng, coord.lat]) // Convert to [lng, lat]
                    )
                },
                properties: result.properties
            }))
        };

        // Store features for merging later
        allGeoJsonFeatures.push(...geoJsonFeatures.features);

        // Track successful coordinates based on the original input
        successfulCoordinates.push(...batch.map(coords => `${coords.lat}, ${coords.lng}`));

        // Add GeoJSON to the map with specified opacity
        if (geoJsonFeatures.features.length > 0) {
            L.geoJSON(geoJsonFeatures, {
                style: function(feature) {
                    return { color: 'blue', weight: 2, fillOpacity: opacity };
                }
            }).addTo(map);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    })
    .finally(() => {
        index += batchSize; // Move to the next batch
        processBatch(); // Process the next batch
    });
};

// Function to check for failed coordinates after all batches are processed
function checkForFailures() {
    const attemptedCoordsFormatted = attemptedCoordinates.map(coords => `${coords.lat}, ${coords.lng}`);
    const failedCoordinates = attemptedCoordsFormatted.filter(coords => 
        !successfulCoordinates.includes(coords) // Check against successful coordinates
    );

    // Display failed coordinates if any
    if (failedCoordinates.length > 0) {
        displayFailedCoordinates(failedCoordinates);
    } else {
        // Hide the error message if all coordinates were successful
        document.getElementById('errorMessage').style.display = "none";
        document.getElementById('failedCoordinates').style.display = "none";
    }
}

// Function to display failed coordinates
function displayFailedCoordinates(failedCoords) {
    const failedList = document.getElementById('failedList');
    failedList.innerHTML = ''; // Clear previous entries
    failedCoords.forEach(coords => {
        const listItem = document.createElement('li');
        listItem.textContent = coords; // Display in the format "lat, lng"
        failedList.appendChild(listItem);
    });
    document.getElementById('errorMessage').textContent = "Some coordinates failed to generate coverage.";
    document.getElementById('errorMessage').style.display = "block";
    document.getElementById('failedCoordinates').style.display = "block";
}

// Start processing the first batch
processBatch();
});

document.getElementById('mergeMaps').addEventListener('click', function() {
    if (allGeoJsonFeatures.length > 0) {
        // Clear existing isochrones from the map
        map.eachLayer(layer => {
            // Check if the layer is an isochrone or specific type you want to remove
            if (layer instanceof L.GeoJSON) {
                map.removeLayer(layer);
            }
        });

        const mergedGeoJson = {
            type: "FeatureCollection",
            features: allGeoJsonFeatures
        };

        // Create a merged polygon
        L.geoJSON(mergedGeoJson, {
            style: function(feature) {
                return { color: 'red', weight: 2, fillOpacity: parseFloat(document.getElementById('opacity').value) }; // Use uniform opacity
            }
        }).addTo(map);
    } else {
        alert('No maps to merge!');
    }
});


document.getElementById('clearMaps').addEventListener('click', function() {
    // Clear all GeoJSON features and pin markers from the map
    allGeoJsonFeatures = [];
    pinMarkers.forEach(marker => map.removeLayer(marker));
    pinMarkers = [];
    map.eachLayer(layer => {
        if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
        }
    });
});

document.getElementById('exportGeoJSON').addEventListener('click', function() {
    if (allGeoJsonFeatures.length > 0) {
        const geoJsonData = {
            type: "FeatureCollection",
            features: allGeoJsonFeatures
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geoJsonData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "merged_isochrones.geojson");
        document.body.appendChild(downloadAnchorNode); // Required for Firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    } else {
        alert('No GeoJSON data to export!');
    }
});
//CSV Drop-Area Code
const dropArea = document.getElementById('dropArea'); // Use the existing dropArea

dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.style.backgroundColor = '#e9ecef'; // Highlight the drop area
});

dropArea.addEventListener('dragleave', () => {
    dropArea.style.backgroundColor = ''; // Reset background color
});

dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dropArea.style.backgroundColor = ''; // Reset background color

    const file = event.dataTransfer.files[0];
    console.log(file.type); // Log the file type for debugging
    if (file && file.type === 'text/csv') {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const lines = text.split('\n')
                .filter(line => line.trim() !== '') // Filter out empty lines
                .slice(1) // Skip the first line (header)
                .map(line => {
                    // Directly return the entire content of column B
                    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split by comma but ignore commas within quotes
                    return values[1] ? values[1].replace(/"/g, '').trim() : ''; // Access column B
                })
                .filter(value => value); // Filter out any empty values

            document.getElementById('locations').value = lines.join('\n'); // Populate the coordinates textarea
        };
        reader.onerror = function(e) {
            console.error('Error reading file:', e);
            alert('There was an error reading the file.');
        };
        reader.readAsText(file);
    } else {
        alert('Please drop a valid CSV file.');
    }
});
    
