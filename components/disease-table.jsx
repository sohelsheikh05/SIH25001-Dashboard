"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, TrendingDown, Minus } from "lucide-react"
const apiUrl = "https://water-bourne-disease-prediction-3.onrender.com";
export function DiseaseTable({ selectedDisease, selectedState,diseaseData }) {
  const [tableData, setTableData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedState && selectedDisease) {
      loadTableData()
    }
  }, [selectedState, selectedDisease])

  useEffect(() => {
    // Filter data based on search term
  const filtered = tableData.filter((item) =>
  item.district?.toLowerCase().includes(searchTerm.toLowerCase())
)

setFilteredData(filtered)

    setFilteredData(filtered)
    
  }, [tableData, searchTerm])

 const loadTableData = async () => {
  setLoading(true)
  try {
   
    const res = await fetch(`${apiUrl}/predict_state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "state": selectedState,
        "target": selectedDisease,
        "date": "2023-12-12"   // e.g., "diarrhea_cases"
      }),
    })
   
    if (!res.ok) throw new Error("Failed to fetch data")
    const data = await res.json()
    
    if (data.error) {
      console.error("API error:", data.error)
      setTableData([])
      return
    }

    // Map forecast into table data
    const districtData = data.predictions.map((f) => ({
      district: f.district,
      cases: f.cases,
    }))

    setTableData(districtData.sort((a, b) => b.cases - a.cases))
  } catch (error) {
    console.error("Error loading table data:", error)
  } finally {
    setLoading(false)
  }
}


  const getRiskLevel = (cases) => {
    if (cases >= 70) return { level: "High", color: "destructive", icon: TrendingUp }
    if (cases >= 30) return { level: "Medium", color: "secondary", icon: Minus }
    return { level: "Low", color: "default", icon: TrendingDown }
  }

  const getRiskColor = (cases) => {
    if (cases >= 70) return "bg-red-100 text-red-800 border border-red-200"
    if (cases >= 30) return "bg-yellow-100 text-yellow-800 border border-yellow-200"
    return "bg-green-100 text-green-800 border border-green-200"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-4 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search districts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>District</TableHead>
              <TableHead className="text-right">Predicted Cases</TableHead>
              <TableHead className="text-right">Risk Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No districts found matching your search."  : "No data available."}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => {
                const risk = getRiskLevel(item.cases)
                const RiskIcon = risk.icon
                return (
                  <TableRow key={item.district} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{item.district}</TableCell>
                    <TableCell className={`text-right font-mono ${getRiskColor(item.cases)} px-3 py-1 rounded-md`}>
                      {item.cases.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={risk.color} className="gap-1">
                        <RiskIcon className="h-3 w-3" />
                        {risk.level}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {filteredData.length > 0 && (
        <div className="text-sm text-muted-foreground text-center pt-2 border-t">
          Showing {filteredData.length} district{filteredData.length !== 1 ? "s" : ""}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}
    </div>
  )
}
