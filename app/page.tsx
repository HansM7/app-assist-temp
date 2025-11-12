"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const latitudBase = -12.069189999999999;
  const longitudBase = -76.96795260112887;

  const [geolocation, setGeolocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  function calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;
    return distancia;
  }

  async function firmar() {
    try {
      const isFirma = window.localStorage.getItem("firma");
      if (isFirma === "1") {
        alert("Ya estás firmando");
        return;
      }

      if (geolocation.latitude === 0 && geolocation.longitude === 0) {
        alert("No se pudo obtener tu ubicación. Por favor, intenta de nuevo.");
        return;
      }

      const distancia = calcularDistancia(
        latitudBase,
        longitudBase,
        geolocation.latitude,
        geolocation.longitude
      );

      if (distancia > 2) {
        alert(
          `Estás muy lejos. La distancia es de ${distancia.toFixed(
            2
          )} metros. Debes estar a menos de 2 metros de la ubicación base para firmar.`
        );
        return;
      }

      console.log(geolocation);
      console.log(`Distancia: ${distancia.toFixed(2)} metros`);

      window.localStorage.setItem("firma", "1");
    } catch (error) {
      console.error("Error al firmar:", error);
    }
  }

  useEffect(() => {
    console.log("Entrando al effect!");

    const r = navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setGeolocation({
          latitude: latitude,
          longitude: longitude,
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Firmar ahora
            </h1>
            <p className="text-gray-600">
              Por favor, de clic en el botón para firmar ahora
            </p>
          </div>

          <div className="space-y-6">
            <div
              className="border-2  border-gray-300 rounded-xl p-8 relative hover:border-blue-400 transition-colors cursor-pointer"
              onClick={firmar}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <p className="text-sm text-gray-500">Haz clic para comenzar</p>
              </div>
            </div>
          </div>
          <hr />
          <div>{JSON.stringify(geolocation)}</div>
        </div>
      </div>
    </div>
  );
}
