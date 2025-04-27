import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import axios from 'axios';
import useSound from 'use-sound';
import Confetti from 'react-confetti';
import { destinations } from './data/destinations';
import { Route } from './types/Location';
import 'leaflet/dist/leaflet.css';

function App() {
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const destination = destinations[0];
  
  // Play romantic song when celebration starts
  const [play] = useSound('/romantic-song.mp3');

  // Custom icon for destination
  const customIcon = new Icon({
    iconUrl: destination.foto,
    iconSize: [40, 40],
  });

  useEffect(() => {
    // Get current position
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition([latitude, longitude]);

        // Check if user is close to destination
        if (currentPosition) {
          const distance = new LatLng(latitude, longitude)
            .distanceTo(new LatLng(destination.x, destination.y));
          
          if (distance < 50 && !showCelebration) {
            setShowCelebration(true);
            play();
          }
        }
      },
      (error) => console.error(error),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    // Get route when position is available
    if (currentPosition) {
      const fetchRoute = async () => {
        try {
          const response = await axios.get(
            `https://router.project-osrm.org/route/v1/driving/${currentPosition[1]},${currentPosition[0]};${destination.y},${destination.x}?overview=full&geometries=geojson`
          );
          
          setRoute({
            coordinates: response.data.routes[0].geometry.coordinates.map(
              (coord: number[]) => [coord[1], coord[0]]
            ),
          });
        } catch (error) {
          console.error('Error fetching route:', error);
        }
      };

      fetchRoute();
    }
  }, [currentPosition]);

  if (!currentPosition) {
    return <div>Carregando sua localização...</div>;
  }

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {showCelebration && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
        />
      )}
      
      <MapContainer
        center={currentPosition}
        zoom={17}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Replace the current position Marker with LocationMarker */}
        <LocationMarker position={currentPosition} />

        {/* Rest of the markers and polyline remain the same */}
        <Marker position={[destination.x, destination.y]} icon={customIcon}>
          <Popup>
            <h3>{destination.titulo}</h3>
            <p>{destination.descricao}</p>
            <img src="https://cdn-icons-png.flaticon.com/128/325/325532.png" />
          </Popup>
        </Marker>

        {route && (
          <Polyline
            positions={route.coordinates}
            color="#ff69b4"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default App;


// Add this new component before the App component
// Add this near the other custom icon at the top of the App component
const currentLocationIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/128/18951/18951533.png', // cute girl icon
  iconSize: [45, 45],
  iconAnchor: [22, 44],
  popupAnchor: [0, -40],
});

// Update the LocationMarker component
function LocationMarker({ position }: { position: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(position);
  }, [position]);

  return (
    <Marker position={position} icon={currentLocationIcon}>
      <Popup>Você está aqui!</Popup>
    </Marker>
  );
}
