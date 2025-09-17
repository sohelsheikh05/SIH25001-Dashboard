"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DiseaseTable } from "@/components/disease-table"
import { DiseaseMap } from "@/components/disease-map"
import { Activity, MapPin, TrendingUp, AlertTriangle } from "lucide-react"

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

export default function DiseaseDashboard() {
  const [diseaseData, setDiseaseData] = useState<DiseaseData | null>(null)
  const [selectedState, setSelectedState] = useState<string>("")
  const [selectedDisease, setSelectedDisease] = useState<string>("cholera")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDiseaseData()
  }, [])

  const fetchDiseaseData = async () => {
    try {
      const response = await fetch("/api/diseases")
      const data = await response.json()
      setDiseaseData(data)
      setSelectedState(data.states[0]?.id || "")
    } catch (error) {
      console.error("Error fetching disease data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalCases = () => {
    if (!diseaseData) return 0
    return diseaseData.states.reduce((total, state) => {
      return (
        total +
        state.districts.reduce((stateTotal, district) => {
          return stateTotal + ((district[selectedDisease as keyof typeof district] as number) || 0)
        }, 0)
      )
    }, 0)
  }

  const getHighRiskDistricts = () => {
    if (!diseaseData) return 0
    let highRiskCount = 0
    diseaseData.states.forEach((state) => {
      state.districts.forEach((district) => {
        const cases = (district[selectedDisease as keyof typeof district] as number) || 0
        if (cases > 50) highRiskCount++
      })
    })
    return highRiskCount
  }

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
                <Activity className="h-6 w-6 text-primary" />
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
                {diseaseData?.states.map((state) => (
                  <SelectItem key={state.id} value={state.id}>
                    {state.name}
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
                    {diseaseData.diseaseNames[disease]}
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
              <div className="text-2xl font-bold text-primary">{getTotalCases().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {diseaseData?.diseaseNames[selectedDisease]} across all states
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Districts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{getHighRiskDistricts()}</div>
              <p className="text-xs text-muted-foreground">Districts with &gt;50 predicted cases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">States Monitored</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{diseaseData?.states.length || 0}</div>
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
              </CardTitle>
              <CardDescription>
                Color-coded visualization of {diseaseData?.diseaseNames[selectedDisease]} cases by district
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
              <DiseaseTable state={selectedState} disease={selectedDisease} diseaseData={diseaseData} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
