"use client";
import { useEffect, useState } from "react";
import { MapPin, CheckCircle, Loader2, User } from "lucide-react";
import axios from "axios";

export default function AsistenciaApp() {
  const latitudBase = -12.069496;
  const longitudBase = -76.96734;
  const DISTANCIA_MAXIMA = 100; // metros

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

  const [marcado, setMarcado] = useState(false);

  async function validateDiferenceHour() {
    return true;
  }

  // Verificar si ya marcó (solo en esta sesión)
  useEffect(() => {
    async function init() {
      const yaMarco = window.localStorage.getItem("asistencia_marcada");
      const res = await validateDiferenceHour();
      if (yaMarco === "1" && res) {
        setMarcado(true);
        setLoading(false);
      } else {
        capturarUbicacion();
      }
    }
    init();
  }, []);

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

  function capturarUbicacion() {
    setLoading(true);

    if (!navigator.geolocation) {
      alert("Geolocalización no soportada en este dispositivo.");
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
        let mensaje = "No se pudo obtener tu ubicación.";
        if (error.code === 1) mensaje = "Permiso de ubicación denegado.";
        if (error.code === 2)
          mensaje = "Ubicación no disponible. Prueba en exterior.";
        if (error.code === 3) mensaje = "Tiempo agotado. Intenta de nuevo.";
        alert(mensaje);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  async function marcarAsistencia() {
    if (geolocation.latitude === 0) {
      alert("Espera a que se cargue tu ubicación.");
      return;
    }

    const distancia = calcularDistancia(
      latitudBase,
      longitudBase,
      geolocation.latitude,
      geolocation.longitude
    );

    if (distancia > DISTANCIA_MAXIMA) {
      alert(
        `Estás a ${distancia.toFixed(1)}m del punto de asistencia.\n` +
          `Debes estar a menos de ${DISTANCIA_MAXIMA} metros.`
      );
      return;
    } else {
      await axios.post("/api/assist", {});
      window.localStorage.setItem("asistencia_marcada", "1");
      setMarcado(true);
    }

    // Marcar en localStorage

    // Recargar después de 2 segundos para forzar nueva lectura
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Tarjeta principal con colores pastel */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-purple-100">
            {/* Header con ícono de usuario */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-purple-700" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-purple-800 mb-2">
              Marcar Asistencia
            </h1>
            <p className="text-center text-purple-600 text-sm mb-8">
              Instructores y Técnicos
            </p>

            {/* Estado de carga */}
            {loading ? (
              <div className="flex flex-col items-center space-y-4 py-8">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                <p className="text-purple-600 font-medium">
                  Obteniendo ubicación...
                </p>
              </div>
            ) : marcado ? (
              <div className="flex flex-col items-center space-y-4 py-8">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <p className="text-green-600 font-bold text-lg">
                  ¡Asistencia marcada!
                </p>
                <p className="text-sm text-gray-500">
                  Recargando para nueva marcación...
                </p>
              </div>
            ) : (
              <>
                {/* Botón de marcar */}
                <button
                  onClick={marcarAsistencia}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 rounded-2xl 
                           hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 
                           active:scale-95 shadow-lg flex items-center justify-center space-x-2"
                >
                  <MapPin className="w-5 h-5" />
                  <span>Marcar Asistencia</span>
                </button>

                {/* Info de ubicación */}
                <div className="mt-8 p-4 bg-purple-50 rounded-2xl space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-700 font-medium">
                      Punto base:
                    </span>
                    <span className="text-purple-900">
                      {latitudBase}, {longitudBase}
                    </span>
                  </div>

                  {geolocation.latitude !== 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-purple-700 font-medium">
                          Tu ubicación:
                        </span>
                        <span className="text-purple-900">
                          {geolocation.latitude.toFixed(6)},{" "}
                          {geolocation.longitude.toFixed(6)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-purple-700 font-medium">
                          Distancia:
                        </span>
                        <span
                          className={`font-bold ${
                            calcularDistancia(
                              latitudBase,
                              longitudBase,
                              geolocation.latitude,
                              geolocation.longitude
                            ) <= DISTANCIA_MAXIMA
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {calcularDistancia(
                            latitudBase,
                            longitudBase,
                            geolocation.latitude,
                            geolocation.longitude
                          ).toFixed(1)}{" "}
                          m
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-purple-700 font-medium">
                          Precisión GPS:
                        </span>
                        <span className="text-purple-900">
                          ±{geolocation.accuracy.toFixed(0)} m
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Indicador visual de rango */}
                {geolocation.latitude !== 0 && (
                  <div className="mt-4 flex justify-center">
                    <div
                      className={`px-4 py-2 rounded-full text-xs font-bold ${
                        calcularDistancia(
                          latitudBase,
                          longitudBase,
                          geolocation.latitude,
                          geolocation.longitude
                        ) <= DISTANCIA_MAXIMA
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {calcularDistancia(
                        latitudBase,
                        longitudBase,
                        geolocation.latitude,
                        geolocation.longitude
                      ) <= DISTANCIA_MAXIMA
                        ? "Dentro del rango"
                        : "Fuera del rango"}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Botón de rehacer (solo en desarrollo) */}
          {process.env.NODE_ENV === "development" && (
            <button
              onClick={() => {
                window.localStorage.removeItem("asistencia_marcada");
                window.location.reload();
              }}
              className="mt-6 w-full text-xs text-purple-500 underline"
            >
              Rehacer marcación (dev)
            </button>
          )}
        </div>
      </div>
    </>
  );
}
