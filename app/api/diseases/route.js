import { NextResponse } from "next/server"

// Mock data for Northeast India states and districts with water-borne disease predictions
const diseaseData = {
  states: [
    {
      id: "assam",
      name: "Assam",
      districts: [
        { name: "Kamrup", cholera: 45, typhoid: 23, hepatitisA: 67, diarrhea: 89 },
        { name: "Dibrugarh", cholera: 32, typhoid: 18, hepatitisA: 54, diarrhea: 76 },
        { name: "Guwahati", cholera: 78, typhoid: 41, hepatitisA: 92, diarrhea: 134 },
        { name: "Silchar", cholera: 29, typhoid: 15, hepatitisA: 43, diarrhea: 61 },
        { name: "Tezpur", cholera: 21, typhoid: 12, hepatitisA: 38, diarrhea: 52 },
      ],
    },
    {
      id: "arunachal-pradesh",
      name: "Arunachal Pradesh",
      districts: [
        { name: "Itanagar", cholera: 18, typhoid: 9, hepatitisA: 27, diarrhea: 41 },
        { name: "Tawang", cholera: 12, typhoid: 6, hepatitisA: 19, diarrhea: 28 },
        { name: "Bomdila", cholera: 15, typhoid: 8, hepatitisA: 23, diarrhea: 34 },
        { name: "Pasighat", cholera: 22, typhoid: 11, hepatitisA: 31, diarrhea: 47 },
      ],
    },
    {
      id: "manipur",
      name: "Manipur",
      districts: [
        { name: "Imphal East", cholera: 34, typhoid: 19, hepatitisA: 48, diarrhea: 71 },
        { name: "Imphal West", cholera: 41, typhoid: 23, hepatitisA: 56, diarrhea: 83 },
        { name: "Thoubal", cholera: 26, typhoid: 14, hepatitisA: 37, diarrhea: 54 },
        { name: "Bishnupur", cholera: 19, typhoid: 10, hepatitisA: 28, diarrhea: 42 },
      ],
    },
    {
      id: "meghalaya",
      name: "Meghalaya",
      districts: [
        { name: "East Khasi Hills", cholera: 38, typhoid: 21, hepatitisA: 52, diarrhea: 77 },
        { name: "West Garo Hills", cholera: 25, typhoid: 13, hepatitisA: 36, diarrhea: 53 },
        { name: "Jaintia Hills", cholera: 17, typhoid: 9, hepatitisA: 25, diarrhea: 37 },
        { name: "Ri Bhoi", cholera: 31, typhoid: 17, hepatitisA: 44, diarrhea: 65 },
      ],
    },
    {
      id: "mizoram",
      name: "Mizoram",
      districts: [
        { name: "Aizawl", cholera: 43, typhoid: 24, hepatitisA: 59, diarrhea: 87 },
        { name: "Lunglei", cholera: 28, typhoid: 15, hepatitisA: 39, diarrhea: 58 },
        { name: "Champhai", cholera: 21, typhoid: 11, hepatitisA: 30, diarrhea: 44 },
        { name: "Kolasib", cholera: 16, typhoid: 8, hepatitisA: 23, diarrhea: 34 },
      ],
    },
    {
      id: "nagaland",
      name: "Nagaland",
      districts: [
        { name: "Kohima", cholera: 35, typhoid: 19, hepatitisA: 49, diarrhea: 72 },
        { name: "Dimapur", cholera: 52, typhoid: 29, hepatitisA: 71, diarrhea: 105 },
        { name: "Mokokchung", cholera: 24, typhoid: 13, hepatitisA: 34, diarrhea: 50 },
        { name: "Tuensang", cholera: 18, typhoid: 10, hepatitisA: 26, diarrhea: 38 },
      ],
    },
    {
      id: "sikkim",
      name: "Sikkim",
      districts: [
        { name: "East Sikkim", cholera: 27, typhoid: 15, hepatitisA: 38, diarrhea: 56 },
        { name: "West Sikkim", cholera: 19, typhoid: 10, hepatitisA: 27, diarrhea: 40 },
        { name: "North Sikkim", cholera: 12, typhoid: 6, hepatitisA: 17, diarrhea: 25 },
        { name: "South Sikkim", cholera: 23, typhoid: 12, hepatitisA: 32, diarrhea: 47 },
      ],
    },
    {
      id: "tripura",
      name: "Tripura",
      districts: [
        { name: "West Tripura", cholera: 56, typhoid: 31, hepatitisA: 77, diarrhea: 114 },
        { name: "South Tripura", cholera: 39, typhoid: 21, hepatitisA: 54, diarrhea: 80 },
        { name: "North Tripura", cholera: 28, typhoid: 15, hepatitisA: 39, diarrhea: 58 },
        { name: "Dhalai", cholera: 22, typhoid: 12, hepatitisA: 31, diarrhea: 46 },
      ],
    },
  ],
  diseases: ["cholera", "typhoid", "hepatitisA", "diarrhea"],
  diseaseNames: {
    cholera: "Cholera",
    typhoid: "Typhoid",
    hepatitisA: "Hepatitis A",
    diarrhea: "Diarrhea",
  },
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get("state")
  const disease = searchParams.get("disease")

  try {
    if (state && disease) {
      // Return specific state and disease data
      const stateData = diseaseData.states.find((s) => s.id === state)
      if (!stateData) {
        return NextResponse.json({ error: "State not found" }, { status: 404 })
      }

      const districtData = stateData.districts.map((district) => ({
        district: district.name,
        cases: district[disease] || 0,
      }))

      return NextResponse.json({
        state: stateData.name,
        disease: diseaseData.diseaseNames[disease],
        data: districtData,
      })
    }

    if (state) {
      // Return all diseases for a specific state
      const stateData = diseaseData.states.find((s) => s.id === state)
      if (!stateData) {
        return NextResponse.json({ error: "State not found" }, { status: 404 })
      }
      return NextResponse.json(stateData)
    }

    if (disease) {
      // Return specific disease data for all states
      const allStatesData = diseaseData.states.map((state) => ({
        state: state.name,
        stateId: state.id,
        districts: state.districts.map((district) => ({
          district: district.name,
          cases: district[disease] || 0,
        })),
      }))

      return NextResponse.json({
        disease: diseaseData.diseaseNames[disease],
        data: allStatesData,
      })
    }

    // Return all data
    return NextResponse.json(diseaseData)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
