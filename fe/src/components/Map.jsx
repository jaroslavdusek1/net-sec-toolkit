import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import L from 'leaflet';

const customIcon = L.icon({
  iconUrl: '/gotcha.png',  
  iconSize: [140, 140],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

export default function Map({ latitude, longitude }) {
  const [position, setPosition] = useState([latitude, longitude]);

  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy;'
      />
      <Marker position={position} icon={customIcon}>
        <Popup>so unless you are hidden behind a vpn you are roughly here</Popup>
      </Marker>
    </MapContainer>
  );
}
