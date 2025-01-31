# GIS Map Editor
# 🚨If this application ever stops working, update the API Key and App ID in config.js🚨
   You can get both of these at https://account.traveltime.com/dashboard

# Updating The Map File: 
 If Stations close or reopen, on the webpage, you can input the names of all the stations you want in the updated map file(all active stations), 
 set the size to medium and generate a map as you would do normally. You can check if the map is as you expect in GeoJson.io, 
 & if it is, rename it to “irish_fire_stations.geojson” & delete the file on GitHub with the same name(so that the software stops reading the old 
 file), then drag and drop the new file into GitHub. The map should now be updated successfully. If it doesn’t work, check that you have named the 
 file the exact way I’ve mentioned.

 # Current Link:
 https://aherronclarecoco.github.io/geojsonmapeditor/
## Overview
This project provides tools for editing GeoJSON files and visualizing data on a map. It includes features for managing station data, verifying names, and exporting updated information.

## Features
- **GeoJSON Station Editor**: Upload and edit GeoJSON files, verify station names, and update properties.
- **Travel Time Calculator**: Visualize travel times using the TravelTime API.
- **Dynamic Map Visualization**: Use Leaflet.js to display GeoJSON data on an interactive map.
- **Export Options**: Export updated data to CSV format.

## File Structure
- `index.html`: Main entry point for the GeoJSON Station Editor.
- `traveltime.html`: Interface for calculating travel times.
- `style.css`: Styles for the application.
- `script.js`: GeoJson Station Editor JavaScript functionality.
- `traveltime.js`: Specific functionality for the TravelTime API.
- `config.js`: Configuration settings for API keys and other constants.
- `irish_fire_stations.geojson`: Default GeoJSON file containing fire station data.

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/aherronclarecoco/geojsonmapeditor.git

Open index.html or traveltime.html in a web browser, you can navigate between the two using the buttons at the top of the page.
## Usage
### GeoJSON Station Editor: 
Upload a GeoJSON file, enter station names, and click “Check Station Names” to verify. If there are incorrect station names there will be a box at the bottom of the page that suggests near matches. You can click "Update Text Box" and continue
### Travel Time Calculator:
Input coordinates and travel parameters to visualize isochrones. You can use the "Export to CSV" in GeoJSON Station Editor to generate a file with the coordinates for all stations you name & drop this file into the the csv file upload box to automatically input all the coordinates. Use the buttons & adjustable selectors on the page to create your coverage map once you have input the coordinates.
## Dependencies
Leaflet.js for mapping.
TravelTime API for travel data. (https://traveltime.com/)
## License
This project is licensed under the MIT License.
