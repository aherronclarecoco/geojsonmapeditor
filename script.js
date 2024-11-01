const allStationNames = ["CARLOW", "MUINE BHEAG - BAGENALSTOWN", "GRAIGNAMANAGH", "TULLOW", "HACKETTSTOWN", "CAVAN", "KILLESHANDRA", "BELTURBET", "BALLYJAMESDUFF", "VIRGINIA", "KINGSCOURT", "COOTEHILL", "BAILEBORO", "BALLYCONNELL", "DOWRA", "NEWBRIDGE", "NAAS", "ATHY", "MAYNOOTH", "MONASTEREVIN", "LEIXLIP", "KILKENNY", "CASTLECOMER", "BUNCLODY", "NEW ROSS", "THOMASTOWN", "WEXFORD", "ENNISCORTHY", "GOREY", "CARNEW", "TINAHELY", "ARKLOW", "RATHDRUM", "BALTINGLASS", "DUNLAVIN", "BLESSINGTON", "GREYSTONES", "BRAY", "FRESHFORD", "URLINGFORD", "DURROW", "ABBEYLEIX", "MOUNTRATH", "PORTLAOISE", "STRADBALLY", "RATHDOWNEY", "MOUNTMELLICK", "PORTARLINGTON", "BIRR", "FERBANE", "ATHLONE", "CLARA", "TULLAMORE", "EDENDERRY", "KILBEGGAN", "MULLINGAR", "TRIM", "DUNSHAUGHLIN", "ASHBOURNE", "BALLYMAHON", "LANESBOROUGH", "LONGFORD", "EDGEWORTHSTOWN", "GRANARD", "CASTLEPOLLARD", "OLDCASTLE", "KELLS", "NOBBER", "NAVAN", "DROGHEDA", "ARDEE", "DUNLEER", "DUNDALK", "CARLINGFORD", "CLONES", "BALLYBAY", "CARRICKMACROSS", "CASTLEBLANEY", "MONAGHAN", "CALLAN", "WICKLOW", "DONNYBROOK", "DOLPHINS BARN", "PHIBSBOROUGH", "NORTH STRAND", "FINGLAS", "KILBARRACK", "TALLAGHT", "RATHFARNHAM", "BLANCHARDSTOWN", "TARA STREET", "DUN LAOGHAIRE", "SWORDS", "BALBRIGGAN", "SKERRIES", "ENNIS", "ENNISTYMON", "SHANNON", "KILLALOE", "SCARIFF", "KILKEE", "KILRUSH", "ANGLESEA STREET", "BALLYVOLANE", "BALLINCOLLIG", "FERMOY", "MITCHELSTOWN", "MALLOW", "KANTURK", "MILLSTREET", "CHARLEVILLE", "MACROOM", "BANDON", "KINSALE", "CARRIGALINE", "CROSSHAVEN", "COBH", "MIDLETON", "YOUGHAL", "CLONAKILTY", "DUNMANWAY", "SCULL", "BANTRY", "CASTLETOWNBERE", "SKIBBEREEN", "CARRICK-ON-SUIR", "CLONMEL", "CAHIR", "TIPPERARY", "CASHEL", "THURLES", "TEMPLEMORE", "NEWPORT", "NENAGH", "CLOUGHJORDAN", "BORRISOKANE", "ROSCREA", "BUNDORAN", "BALLYSHANNON", "DONEGAL", "KILLYBEGS", "GLENCOLMCILLE", "GLENTIES", "STRANORLAR", "LETTERKENNY", "DUNGLOE", "ARRANMORE ISLAND", "GWEEDORE", "FALCARRAGH", "MILFORD", "BUNCRANA", "CARNDONAGH", "MOVILLE", "GORT", "ATHENRY", "GALWAY", "AN CHEATHRU RUA", "CLIFDEN", "INISH MOR", "TUAM", "BALLINROBE", "BALLINASLOE", "PORTUMNA", "LOUGHREA", "MOUNTBELLEW", "WESTPORT", "ACHILL", "BELMULLET", "CROSSMOLINA", "BALLINA", "ENNISCRONE", "CASTLEBAR", "SWINFORD", "CLAREMORRIS", "KILTIMAGH", "BALLYHAUNIS", "CHARLESTOWN", "TOBERCURRY", "SLIGO", "BALLYMOTE", "TRALEE", "KILLARNEY", "KILLORGLIN", "DINGLE", "CAHERCIVEEN", "SNEEM", "KENMARE", "CASTLEISLAND", "LISTOWEL", "BALLYBUNION", "ABBEYFEALE", "NEWCASTLEWEST", "RATHKEALE", "FOYNES", "LIMERICK", "KILMALLOCK", "CAPPAMORE", "CARRICK ON SHANNON", "DRUMSHAMBO", "BALLINAMORE", "MANORHAMILTON", "STROKESTOWN", "ELPHIN", "BOYLE", "BALLAGHADEREEN", "CASTLEREA", "ROSCOMMON", "DUNGARVAN", "CAPPOQUIN", "LISMORE", "TALLOW", "ARDMORE", "KILMACTHOMAS", "WATERFORD", "TRAMORE", "DUNMORE EAST"];

document.addEventListener('DOMContentLoaded', () => {
    const coll = document.getElementsByClassName('collapsible');
    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.display === 'block') {
                content.style.display = 'none';
            } else {
                content.style.display = 'block';
            }
        });
    }

    const stationList = document.getElementById('stationList');
    allStationNames.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        stationList.appendChild(li);
    });
});

function updateGeoJSON() {
    const fileInput = document.getElementById('geojsonFile');
    const stationNames = document.getElementById('stationNames').value.split('\n').map(name => name.trim().toUpperCase());
    const markerColor = document.getElementById('markerColor').value || '#ff0000';
    const markerSize = document.getElementById('markerSize').value || 'medium';
    const markerSymbol = document.getElementById('markerSymbol').value || 'circle';

    if (fileInput.files.length === 0) {
        alert('Please upload a GeoJSON file.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            const geojsonData = JSON.parse(event.target.result);
            const unmatchedNames = [];

            geojsonData.features.forEach(feature => {
                if (feature.properties && feature.properties.Name) {
                    const nameIndex = stationNames.indexOf(feature.properties.Name.toUpperCase());
                    if (nameIndex !== -1) {
                        feature.properties['marker-color'] = markerColor;
                        feature.properties['marker-size'] = markerSize;
                        feature.properties['marker-symbol'] = markerSymbol;
                        stationNames.splice(nameIndex, 1); // Remove matched name
                    }
                }
            });

            if (stationNames.length > 0) {
                displayUnmatchedNames(stationNames);
            } else {
                const updatedGeoJSON = JSON.stringify(geojsonData, null, 2);
                downloadFile(updatedGeoJSON, 'updated_stations.geojson');
            }
        } catch (error) {
            console.error('Error parsing GeoJSON file:', error);
            alert('There was an error processing the GeoJSON file.');
        }
    };

    reader.readAsText(file);
}

function hideUneditedPins() {
    const fileInput = document.getElementById('geojsonFile');
    const stationNames = document.getElementById('stationNames').value.split('\n').map(name => name.trim().toUpperCase());
    const markerColor = document.getElementById('markerColor').value || '#ff0000';
    const markerSize = document.getElementById('markerSize').value || 'medium';
    const markerSymbol = document.getElementById('markerSymbol').value || 'circle';

    if (fileInput.files.length === 0) {
        alert('Please upload a GeoJSON file.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            const geojsonData = JSON.parse(event.target.result);
            const unmatchedNames = [];

            geojsonData.features = geojsonData.features.filter(feature => {
                if (feature.properties && feature.properties.Name) {
                    const nameIndex = stationNames.indexOf(feature.properties.Name.toUpperCase());
                    if (nameIndex !== -1) {
                        feature.properties['marker-color'] = markerColor;
                        feature.properties['marker-size'] = markerSize;
                        feature.properties['marker-symbol'] = markerSymbol;
                        stationNames.splice(nameIndex, 1); // Remove matched name
                        return true;
                    } else {
                        unmatchedNames.push(feature.properties.Name);
                    }
                }
                return false;
            });

            if (unmatchedNames.length > 0) {
                displayUnmatchedNames(unmatchedNames);
            } else {
                const updatedGeoJSON = JSON.stringify(geojsonData, null, 2);
                downloadFile(updatedGeoJSON, 'filtered_stations.geojson');
            }
        } catch (error) {
            console.error('Error parsing GeoJSON file:', error);
            alert('There was an error processing the GeoJSON file.');
        }
    };

    reader.readAsText(file);
}

function downloadFile(content, fileName) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: 'application/json' });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}

function displayUnmatchedNames(unmatchedNames) {
    const table = document.getElementById('errorTable');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = ''; // Clear previous entries

    unmatchedNames.forEach(name => {
        const row = document.createElement('tr');
        const cell1 = document.createElement('td');
        const cell2 = document.createElement('td');
        cell1.textContent = name;
        cell2.textContent = findNearestMatch(name);
        row.appendChild(cell1);
        row.appendChild(cell2);
        tbody.appendChild(row);
    });

    table.style.display = 'table';
    document.getElementById('suggestions').style.display = 'block';
}

function findNearestMatch(name) {
    let nearest = '';
    let minDistance = Infinity;

    const nameParts = name.split(' ');
    if (nameParts.length > 1 && (nameParts[1].toLowerCase() === 'town' || nameParts[1].toLowerCase() === 'city')) {
        const firstWord = nameParts[0];
        if (allStationNames.includes(firstWord)) {
            return firstWord;
        }
    }

    allStationNames.forEach(station => {
        const distance = levenshteinDistance(name, station);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = station;
        }
    });

    return nearest;
}

function levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

function updateTextBox() {
    const table = document.getElementById('errorTable');
    const rows = table.getElementsByTagName('tr');
    const currentText = document.getElementById('stationNames').value.split('\n').map(name => name.trim().toUpperCase());
    const stationNames = [...currentText];

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        if (cells.length > 1) {
            const problemName = cells[0].textContent;
            const suggestedName = cells[1].textContent;
            const problemIndex = stationNames.indexOf(problemName);
            if (problemIndex !== -1) {
                stationNames.splice(problemIndex, 1, suggestedName); // Replace problem name with suggested name
            } else if (!stationNames.includes(suggestedName)) {
                stationNames.push(suggestedName); // Add suggested name if problem name not found
            }
        }
    }

    document.getElementById('stationNames').value = stationNames.join('\n');
    document.getElementById('suggestions').style.display = 'none';
    table.style.display = 'none';
}

function searchStation() {
    const input = document.getElementById('searchStation');
    const filter = input.value.toUpperCase();
    const ul = document.getElementById('stationList');
    const li = ul.getElementsByTagName('li');

    for (let i = 0; i < li.length; i++) {
        const txtValue = li[i].textContent || li[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = '';
        } else {
            li[i].style.display = 'none';
        }
    }
}
