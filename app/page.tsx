"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DiseaseTable } from "@/components/disease-table"
import { DiseaseMap } from "@/components/disease-map"
import { Activity, MapPin, TrendingUp, AlertTriangle } from "lucide-react"

const diseasePrettyName: { [key: string]: string } = {
  diarrhea_cases: "Diarrhea",
  enteric_fever_cases: "Enteric Fever",
  je_cases: "Japanese Encephalitis",
};

interface DiseaseData {
  states: Array<{
    id: string
    name: string
    districts: Array<{
      name: string
      cholera: number
      typhoid: number
      hepatitisA: number
      diarrhea: number
    }>
  }>
  diseases: string[]
  diseaseNames: Record<string, string>
}
 const apiUrl = process.env.NEXT_PUBLIC_URL

export default function DiseaseDashboard() {
  const [diseaseData, setDiseaseData] = useState<DiseaseData | null>(null)
  const [selectedState, setSelectedState] = useState<string>("Meghalaya")
  const [selectedDisease, setSelectedDisease] = useState<string>("diarrhea_cases")
  const [loading, setLoading] = useState(true)
  const diseaseStates= {
    "Arunachal Pradesh": [
        "Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey",
        "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang",
        "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley",
        "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap",
        "Longding"
    ],
    "Assam": [
        "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo",
        "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara",
        "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan",
        "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli",
        "Morigaon", "Nagaon", "Nalbari", "Dima Hasao", "Sivasagar", "Sonitpur",
        "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"
    ],
    "Manipur": [
        "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West",
        "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl",
        "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"
    ],
    "Meghalaya": [
        "East Garo Hills", "West Garo Hills", "North Garo Hills", "South Garo Hills",
        "South West Garo Hills", "East Khasi Hills", "West Khasi Hills",
        "South West Khasi Hills", "Ri Bhoi", "West Jaintia Hills", "East Jaintia Hills"
    ],
    "Mizoram": [
        "Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei",
        "Mamit", "Saiha", "Serchhip", "Hnahthial", "Khawzawl", "Saitual"
    ],
    "Nagaland": [
        "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung",
        "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto",
        "Chümoukedima", "Niuland", "Tseminyu", "Shamator"
    ],
    "Sikkim": [
        "East Sikkim", "West Sikkim", "North Sikkim", "South Sikkim",
        "Pakyong", "Soreng"
    ],
    "Tripura": [
        "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala",
        "South Tripura", "Unakoti", "West Tripura"
    ]
}


  useEffect(() => {
    fetchDiseaseData()
    
  }, [])

  const fetchDiseaseData = async () => {
    try {
     
     console.log("Fetching disease data...", apiUrl)
     const response = await fetch( `${apiUrl}/diseases`);
      const data = await response.json()
      
      
      setDiseaseData(data)
      setSelectedState(data.states?.id || "")
    } catch (error) {
      console.error("Error fetching disease data:", error)
    } finally {
      setLoading(false)
    }
  }
 
  const [totalCases, setTotalCases] = useState<number>(0)
useEffect(() => {
  getTotalCases(selectedState, selectedDisease)
},[selectedState, selectedDisease])
const getTotalCases = async (state: string, selectedDisease: string) => {
  if (!state || !selectedDisease) return
  
  try {
    const response = await fetch(`${apiUrl}/total_cases_by_state`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        state,
        disease: selectedDisease,
      }),
    })

    const data = await response.json()
    
    if (data.total_cases !== undefined) {
      setTotalCases(parseInt(data.total_cases, 10))
    } else {
      setTotalCases(0) // fallback if error
      console.error("Error fetching cases:", data.error)
    }
    
  } catch (error) {
    console.error("API error:", error)
    setTotalCases(0)
  }
}
const prettyDiseaseName = (name: string | undefined) => {
  if (!name) return ""
  return name
    .replace("_cases", "")       // remove suffix
    .replace(/_/g, " ")          // underscores → spaces
    .replace(/\b\w/g, c => c.toUpperCase()) // capitalize
}

// const getHighRiskDistricts = (threshold = 50) => {
//   if (!diseaseData || !selectedDisease) return 0;

//   return diseaseData.states.reduce((count, state) => {
//     const riskyDistricts = state.districts.filter((district: any) => {
//       const cases = Number(district[selectedDisease]) || 0;
//       return cases > threshold;
//     });
//     return count + riskyDistricts.length;
//   }, 0);
// };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading disease prediction data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-6 w-6 text-primary" />165
              </div>
              <div>
                <h1 className="text-2xl font-bold text-balance">Water-borne Disease Prediction Dashboard</h1>
                <p className="text-muted-foreground">Northeast India Health Monitoring System</p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <MapPin className="h-3 w-3 mr-1" />8 States Monitored
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Select State</label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a state" />
              </SelectTrigger>
              <SelectContent>
                 {
                 Object.keys(diseaseStates).map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Select Disease</label>
            <Select value={selectedDisease} onValueChange={setSelectedDisease}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a disease" />
              </SelectTrigger>
              <SelectContent>
                {diseaseData?.diseases.map((disease) => (
  <SelectItem key={disease} value={disease}>
    {diseasePrettyName[disease as keyof typeof diseasePrettyName]}
  </SelectItem>
))}


              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Predicted Cases</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalCases}</div>
              <p className="text-xs text-muted-foreground">
                <p>{prettyDiseaseName(selectedDisease)}</p> across all states
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Districts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {/* <div className="text-2xl font-bold text-destructive">{getHighRiskDistricts()}</div> */}
              <p className="text-xs text-muted-foreground">Districts with &gt;50 predicted cases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">States Monitored</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {/* <div className="text-2xl font-bold text-primary">{diseaseData?diseaseData.length || 0}</div> */}
              <p className="text-xs text-muted-foreground">Northeast India coverage</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Disease Map */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Disease Distribution Map
              </CardTitle>                                  {/* {diseaseData?.diseaseNames[selectedDisease]} */ }
              <CardDescription>
                Color-coded visualization of  cases by district
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DiseaseMap state={selectedState} disease={selectedDisease} diseaseData={diseaseData} />
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                District-wise Data
              </CardTitle>
              <CardDescription>Detailed breakdown of predicted cases by district</CardDescription>
            </CardHeader>
            <CardContent>
              <DiseaseTable selectedState={selectedState} selectedDisease={selectedDisease} diseaseData={diseaseData} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
