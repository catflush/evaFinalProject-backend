import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icon in react-leaflet
const icon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const MapSection = () => {
  // Sample locations - you can replace these with your actual event locations
  const locations = [
    { position: [51.505, -0.09], title: "London Event", description: "Join us for an amazing event in London!" },
    { position: [48.8566, 2.3522], title: "Paris Event", description: "Experience the magic of Paris with us!" },
    { position: [40.7128, -74.0060], title: "New York Event", description: "Don't miss out on this exciting New York event!" }
  ];

  useEffect(() => {
    // Fix for map container not rendering properly
    const mapContainer = document.querySelector('.leaflet-container');
    if (mapContainer) {
      mapContainer.style.height = '500px';
      mapContainer.style.width = '100%';
    }
  }, []);

  return (
    <section className="py-16 bg-base-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Find Events Near You</h2>
          <p className="text-lg text-base-content/80">
            Discover exciting events happening around the world
          </p>
        </div>
        
        <div className="rounded-lg overflow-hidden shadow-xl">
          <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            style={{ height: '500px', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((location, index) => (
              <Marker
                key={index}
                position={location.position}
                icon={icon}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg">{location.title}</h3>
                    <p className="text-sm">{location.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </section>
  );
};

export default MapSection; 