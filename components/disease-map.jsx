"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Activity } from "lucide-react"
const apiUrl = process.env.NEXT_PUBLIC_URL
const NORTHEAST_COORDINATES = {
  assam: {
    Kamrup: { lat: 26.1445, lng: 91.7362 },
    Dibrugarh: { lat: 27.4728, lng: 94.912 },
    Guwahati: { lat: 26.1445, lng: 91.7362 },
    Silchar: { lat: 24.8333, lng: 92.7789 },
    Tezpur: { lat: 26.6333, lng: 92.8 },
    Jorhat: { lat: 26.7509, lng: 94.2037 },
    Nagaon: { lat: 26.3484, lng: 92.6855 },
    Tinsukia: { lat: 27.4898, lng: 95.3613 },
  },
  "arunachal-pradesh": {
    Itanagar: { lat: 27.0844, lng: 93.6053 },
    Tawang: { lat: 27.5856, lng: 91.8697 },
    Bomdila: { lat: 27.2615, lng: 92.4065 },
    Pasighat: { lat: 28.0669, lng: 95.3261 },
    Ziro: { lat: 27.546, lng: 93.8299 },
    Tezu: { lat: 27.9167, lng: 96.1667 },
  },
  manipur: {
    "Imphal East": { lat: 24.817, lng: 93.9368 },
    "Imphal West": { lat: 24.817, lng: 93.9368 },
    "Thoubal": { lat: 24.6333, lng: 94.0167 },
    "Bishnupur": { lat: 24.6167, lng: 93.7833 },
    "Senapati": { lat: 25.2667, lng: 94.0167 },
  },
  meghalaya: {
    "East Khasi Hills": { lat: 25.5788, lng: 91.8933 },
    "West Garo Hills": { lat: 25.5138, lng: 90.2022 },
    "Jaintia Hills": { lat: 25.45, lng: 92.2 },
    "Ri Bhoi": { lat: 25.9, lng: 91.8833 },
    "Baghmara": { lat: 25.2167, lng: 90.6333 },
  },
  mizoram: {
    Aizawl: { lat: 23.7367, lng: 92.7173 },
    Lunglei: { lat: 22.8833, lng: 92.7333 },
    Champhai: { lat: 23.45, lng: 93.3167 },
    Serchhip: { lat: 23.3, lng: 92.8333 },
    Kolasib: { lat: 24.2167, lng: 92.6833 },
  },
  nagaland: {
    Kohima: { lat: 25.6751, lng: 94.1086 },
    Dimapur: { lat: 25.9167, lng: 93.7333 },
    Mokokchung: { lat: 26.3167, lng: 94.5167 },
    Tuensang: { lat: 26.2667, lng: 94.8167 },
    Wokha: { lat: 26.0833, lng: 94.2667 },
  },
  sikkim: {
    "East Sikkim": { lat: 27.3389, lng: 88.6065 },
    "West Sikkim": { lat: 27.1667, lng: 88.3667 },
    "North Sikkim": { lat: 27.5167, lng: 88.5333 },
    "South Sikkim": { lat: 27.2833, lng: 88.2667 },
  },
  tripura: {
    "West Tripura": { lat: 23.8315, lng: 91.2868 },
    "South Tripura": { lat: 24.3667, lng: 92.1667 },
    "North Tripura": { lat: 24.3333, lng: 92.0 },
    Dhalai: { lat: 23.9333, lng: 91.85 },
  },
}

export function DiseaseMap({ state, disease, diseaseData }) {
  const [mapData, setMapData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== "undefined" && !window.L) {
        // Load Leaflet CSS
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)

        // Load Leaflet JS
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = () => {
          initializeMap()
        }
        document.head.appendChild(script)
      } else if (window.L) {
        initializeMap()
      }
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (state && disease && diseaseData && mapInstanceRef.current) {
      loadMapData()
    }
  }, [state, disease, diseaseData])

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return

    const L = window.L

    // Initialize map centered on Northeast India
    const map = L.map(mapRef.current, {
      center: [26.2006, 92.9376], // Center of Northeast India
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: true,
    })

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map)

    mapInstanceRef.current = map

    if (state && disease && diseaseData) {
      loadMapData()
    }
  }

  const loadMapData = async ( disease,district) => {

  const res = await fetch(`${apiUrl}/predict_state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        "state": state,
        "target": "diarrhea_cases",
        "date": "2023-12-12"   // e.g., "diarrhea_cases"
      }),
  });
  const data = await res.json();
 
  if (!data.error) {
    setMapData(data.districts);
    
    addMarkersToMap(data.predictions);
  } else {
    console.error(data.error);
  }
};


  const addMarkersToMap = (data) => {
    if (!mapInstanceRef.current) return

    const L = window.L
    const map = mapInstanceRef.current

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    // Add new markers
    // Suppose "data" is the API response
    
   
data.forEach((district) => {
  

  const color = getMarkerColor(district.cases)
  const size = getMarkerSize(district.cases)

  // Create custom marker icon based on risk level
  const markerIcon = L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative">
        <div class="w-6 h-6 ${color} rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs font-medium whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm border">
          ${district.district}
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
    
  const marker = L.marker([district.coords[0], district.coords[1]], { icon: markerIcon })
    .addTo(map)
    .bindPopup(`
      <div class="p-2">
        <h4 class="font-semibold text-sm">${district.district}</h4>
        <div class="mt-2 space-y-1 text-xs">
          <div class="flex justify-between">
            <span>Predicted Cases:</span>
            <span class="font-bold">${district.cases.toFixed(2)}</span>
          </div>
          <div class="flex justify-between">
            <span>CI Lower:</span>
            <span>${district.mean_ci_lower.toFixed(2)}</span>
          </div>
          <div class="flex justify-between">
            <span>CI Upper:</span>
            <span>${district.mean_ci_upper.toFixed(2)}</span>
          </div>
          <div class="mt-1">
            <span class="inline-block px-2 py-1 rounded text-white ${color}">
              ${getRiskLevel(district.cases)}
            </span>
          </div>
          <div class="mt-1">
            <span>Date:</span> ${district.date}
          </div>
        </div>
      </div>
    `)

  marker.on("click", () => {
    setSelectedDistrict(selectedDistrict === district.district ? null : district.district)
  })
})


    // Fit map to show all markers
    if (data.length > 0) {
      const group = new L.featureGroup(map._layers)
      if (Object.keys(group._layers).length > 0) {
        map.fitBounds(group.getBounds().pad(0.1))
      }
    }
  }

  const getMarkerColor = (cases) => {
    if (cases >= 70) return "bg-red-500"
    if (cases >= 30) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getMarkerSize = (cases) => {
    if (cases >= 70) return "h-6 w-6"
    if (cases >= 30) return "h-5 w-5"
    return "h-4 w-4"
  }

  const getRiskLevel = (cases) => {
    if (cases >= 70) return "High Risk"
    if (cases >= 30) return "Medium Risk"
    return "Low Risk"
  }

  if (loading) {
    return (
      <div className="h-96 bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative h-96 bg-card rounded-lg border overflow-hidden">
        <div ref={mapRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />

        {/* Legend overlay */}
        <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
          <h4 className="text-sm font-semibold mb-2">Risk Levels</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 bg-red-500 rounded-full"></div>
              <span>High Risk (70+ cases)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
              <span>Medium Risk (30-69 cases)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <span>Low Risk (&lt;30 cases)</span>
            </div>
          </div>
        </div>
      </div>

      {/* District Summary */}
    
    </div>
  )
}
