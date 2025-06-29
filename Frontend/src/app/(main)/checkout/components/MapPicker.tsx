'use client';

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.375rem', // Tương đương rounded-md
};

// Vị trí mặc định (ví dụ: trung tâm TP.HCM)
const defaultCenter = {
  lat: 10.7769,
  lng: 106.7009
};

interface MapPickerProps {
    onLocationSelect: (location: { lat: number; lng: number }) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ onLocationSelect }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "" // Rất quan trọng!
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    // Lấy vị trí hiện tại của người dùng nếu họ cho phép
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMarkerPosition(newPos);
          mapInstance.setCenter(newPos);
          mapInstance.setZoom(15);
          onLocationSelect(newPos); // Gửi vị trí ban đầu
        },
        () => {
          // Lỗi hoặc người dùng không cho phép, giữ nguyên vị trí mặc định
          console.warn("Geolocation failed or was not permitted.");
        }
      );
    }
    setMap(mapInstance);
  }, [onLocationSelect]);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPos = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setMarkerPosition(newPos);
      onLocationSelect(newPos); // Gửi tọa độ mới về component cha
    }
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      <MarkerF position={markerPosition} />
    </GoogleMap>
  ) : <div className="w-full h-full bg-gray-200 flex items-center justify-center">Đang tải bản đồ...</div>;
};

export default React.memo(MapPicker);