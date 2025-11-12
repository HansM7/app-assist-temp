"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const latitudBase = -12.069496;
  const longitudBase = -76.96734;

  const [loading, setLoading] = useState(true);
  const [geolocation, setGeolocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  }>({
    latitude: 0,
    longitude: 0,
    accuracy: 0,
  });

  function calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async function firmar() {
    try {
      const isFirma = window.localStorage.getItem("firma");
      if (isFirma === "1") {
        alert("Ya firmaste.");
        return;
      }

      if (geolocation.latitude === 0 || geolocation.accuracy === 0) {
        alert("Espera a que se cargue tu ubicación con precisión.");
        return;
      }

      // Usar la precisión del GPS como tolerancia máxima
      const distancia = calcularDistancia(
        latitudBase,
        longitudBase,
        geolocation.latitude,
        geolocation.longitude
      );

      // Validación considerando la precisión del GPS
      if (distancia > geolocation.accuracy + 2) {
        // Agregar 2m de tolerancia extra
        alert(
          `Estás a ${distancia.toFixed(1)}m del punto. ` +
            `Precisión GPS: ±${geolocation.accuracy.toFixed(0)}m. ` +
            `Acércate más o mejora la señal GPS.`
        );
        return;
      }

      window.localStorage.setItem("firma", "1");
      alert("¡Firma registrada con éxito!");
    } catch (error) {
      console.error("Error al firmar:", error);
      alert("Error inesperado.");
    }
  }

  function capturarUbicacion() {
    setLoading(true);

    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (error) => {
        console.error("Error GPS:", error);
        let mensaje = "Error al obtener ubicación.";
        if (error.code === 1) mensaje = "Permiso de ubicación denegado.";
        if (error.code === 2) mensaje = "Ubicación no disponible.";
        if (error.code === 3) mensaje = "Tiempo agotado.";
        alert(mensaje);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  useEffect(() => {
    capturarUbicacion();
    const interval = setInterval(capturarUbicacion, 10000);
    return () => clearInterval(interval);
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
              Debes estar cerca del punto base para firmar.
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={firmar}
              disabled={loading || geolocation.accuracy === 0}
              className={`w-full py-4 rounded-xl font-medium transition-all ${
                loading || geolocation.accuracy === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              }`}
            >
              {loading ? "Obteniendo ubicación..." : "Firmar ahora"}
            </button>
          </div>

          <hr className="my-6" />

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Ubicación:</strong> {geolocation.latitude.toFixed(6)},{" "}
              {geolocation.longitude.toFixed(6)}
            </p>
            <p>
              <strong>Precisión GPS:</strong> ±{geolocation.accuracy.toFixed(0)}{" "}
              metros
            </p>
            {geolocation.accuracy > 0 && (
              <p
                className={`font-medium ${
                  geolocation.accuracy > 10 ? "text-red-600" : "text-green-600"
                }`}
              >
                {geolocation.accuracy <= 10 ? "Buena señal" : "Señal débil"}
              </p>
            )}
          </div>
        </div>
      </div>
      <button onClick={() => window.localStorage.removeItem("firma")}>
        Rehacer (dev)
      </button>
    </div>
  );
}
