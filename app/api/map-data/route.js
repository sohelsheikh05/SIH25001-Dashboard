import { NextResponse } from "next/server"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get("state")
  const disease = searchParams.get("disease")

  try {
    // This would typically fetch from your ML model's prediction API
    // For now, returning mock geographic data
    const mockMapData = {
      center: [26.2006, 92.9376], // Northeast India center
      zoom: 7,
      markers: [
        {
          id: 1,
          position: [26.1445, 91.7362],
          district: "Kamrup",
          cases: 45,
          riskLevel: "medium",
        },
        {
          id: 2,
          position: [27.4728, 94.912],
          district: "Dibrugarh",
          cases: 32,
          riskLevel: "medium",
        },
        {
          id: 3,
          position: [25.5788, 91.8933],
          district: "Shillong",
          cases: 78,
          riskLevel: "high",
        },
      ],
    }

    return NextResponse.json(mockMapData)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
