let map;
const addFieldButton = document.querySelector("#fieldBut");

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 48.0196, lng: 66.9237 },
    zoom: 6,
    mapTypeId: 'hybrid'
  });



}

window.initMap = initMap;

const fields = new Map();

function addField() {
  let field = new google.maps.Polygon({
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
    draggable: true,
    editable: true,
  });

  field.setMap(map);

  if (document.querySelector('#fieldOptionSelect').value === '1') {

    addFieldButton.disabled = true;

    map.addListener('click', (e) => {
      field.getPath().push(e.latLng);
    });

    map.addListener('contextmenu', (e) => {
      google.maps.event.clearListeners(map, 'click');
      addFieldButton.disabled = false;
      if (field.getPath().getLength() < 3) {
        field.setMap(null);
        HTMLfield.parentNode.remove();
      }
    });

  } else {
    //get screen bounds to place field right on center
    let lat0 = map.getBounds().getNorthEast().lat(),
      lng0 = map.getBounds().getNorthEast().lng(),
      lat1 = map.getBounds().getSouthWest().lat(),
      lng1 = map.getBounds().getSouthWest().lng(),
      lat = (lat0 - lat1) * 0.3,
      lng = (lng0 - lng1) * 0.3;

    lat0 -= lat;
    lng0 -= lng;
    lat1 += lat;
    lng1 += lng;

    const fieldCoords = [
      { lat: lat0, lng: lng0 },
      { lat: lat0, lng: lng1 },
      { lat: lat1, lng: lng1 },
      { lat: lat1, lng: lng0 },
    ];

    //creating field
    field.setPath(fieldCoords);
  }

  let HTMLfield = document.querySelector("#fields").appendChild(document.createElement("div"));
  HTMLfield.classList.add("field");
  HTMLfield.innerHTML = `<h3>Поле #<span contenteditable>${HTMLfield.parentElement.children.length}</span></h3><div class="field-coords"></div>`;
  HTMLfield = HTMLfield.lastChild;
  for (let kek of field.getPath().getArray()) {
    HTMLfield.innerHTML += `<p>${kek.lat().toFixed(4)}, ${kek.lng().toFixed(4)}</p>`;
  }

  //Update coordinates when dragging and editing
  const updateHTMLcoords = () => {
    field.getPath().forEach((path, num) => {
      HTMLfield.children[num].innerHTML = `<p>${path.lat().toFixed(4)}, ${path.lng().toFixed(4)}</p>`;
    });
  }

  google.maps.event.addListener(field.getPath(), "insert_at", () => {
    HTMLfield.appendChild(document.createElement("p"));
    updateHTMLcoords();
  });

  google.maps.event.addListener(field.getPath(), "set_at", () => {
    updateHTMLcoords();
  });

  google.maps.event.addListener(field.getPath(), "remove_at", () => {
    HTMLfield.lastChild.remove();
    updateHTMLcoords();
  });

  //Info window
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div class="info-window">
        <h3>Поле ${1}</h3>
        <button id="removeBtn${1}">remove</button>
      </div>
    `,
  });

  field.addListener('click', (e) => {
    const marker = new google.maps.Marker({
      position: e.latLng,
      map,
      visible: false,
    });

    infoWindow.open({
      anchor: marker,
      map,
      shouldFocus: false,
    });

    google.maps.event.addListener(infoWindow, 'domready', () => {
      document.querySelector(`#removeBtn${1}`).addEventListener("click", () => {
        field.setMap(null);
        HTMLfield.parentNode.remove();
        infoWindow.close();
        marker.setMap(null);
        google.maps.event.clearListeners(map, 'click');
      });

    });

    infoWindow.addListener('closeclick', () => {
      marker.setMap(null);
    });

  });

}

// google.maps.geometry.spherical.computeDistanceBetween ({lat: -34, lng: 151}, {lat: -34, lng: 151});


addFieldButton.addEventListener("click", addField);

document.querySelector("#export").addEventListener("click", () => {
  let data = {
    fields: [],
  };

  for (let kek of document.querySelectorAll(".field")) {
    let field = {
      name: kek.querySelector("h3").innerText,
      coords: [],
    };
    for (let i = 0; i < kek.children[1].children.length; i++) {
      field.coords.push({
        lat: kek.children[1].children[i].innerHTML.split(",")[0],
        lng: kek.children[1].children[i].innerHTML.split(",")[1],
      });
    }
    data.fields.push(field);
  }

  document.querySelector('#exportedjson').value = JSON.stringify(data);
  document.querySelector("#downloadjson").style.display = "inline-block";
});

document.querySelector("#downloadjson").addEventListener("click", () => {
  let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(document.querySelector('#exportedjson').value);
  let downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "data.json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
});