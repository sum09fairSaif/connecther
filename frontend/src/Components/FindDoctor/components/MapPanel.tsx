import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Props = {
  targetPosition?: [number, number] | null;
  markerLabel?: string;
};

export default function MapPanel({ targetPosition, markerLabel }: Props) {
  const [position, setPosition] = useState<[number, number]>([
    42.3601, -71.0589,
  ]);
  const hasManualSelectionRef = useRef(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!hasManualSelectionRef.current) {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        }
      },
      () => console.log("Location permission denied"),
    );
  }, []);

  useEffect(() => {
    if (!targetPosition) return;

    hasManualSelectionRef.current = true;
    setPosition(targetPosition);
  }, [targetPosition]);

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "500px", borderRadius: "18px" }}
    >
      <RecenterMap position={position} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>{markerLabel || "You are here"}</Popup>
      </Marker>
    </MapContainer>
  );
}

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position);
  }, [map, position]);

  return null;
}
