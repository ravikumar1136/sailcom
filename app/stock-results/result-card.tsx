"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import * as XLSX from "xlsx"
import { useEffect, useState } from "react"

interface ResultData {
  [key: string]: string | number | boolean
}

interface SearchParams {
  grade: string
  width: number | string
  thickness: number | string
  finish: string
}

interface ResultCardProps {
  title: string
  found: boolean
  exactMatch: boolean
  message: string
  data: ResultData[] | null
  notFoundMessage?: string
}

export function ResultCard({
  title,
  found,
  exactMatch: serverExactMatch,
  message: serverMessage,
  data,
  notFoundMessage = "No matching data was found for your search criteria.",
}: ResultCardProps) {
  // Determine which columns to show based on the title
  const isStockData = title === "Stock Data";
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [effectivelyExactMatches, setEffectivelyExactMatches] = useState<{ [key: number]: boolean }>({});
  
  // Get search parameters from localStorage
  useEffect(() => {
    const savedParams = localStorage.getItem("searchParams");
    if (savedParams) {
      try {
        setSearchParams(JSON.parse(savedParams));
      } catch (err) {
        console.error("Error parsing search parameters:", err);
      }
    }
  }, []);
  
  // Determine if items are effective exact matches (when finish is empty but others match)
  useEffect(() => {
    if (!data || !searchParams) return;
    
    const matches: { [key: number]: boolean } = {};
    
    // Check each item if it is effectively an exact match
    data.forEach((item, index) => {
      if (isStockData) {
        const gradeMatch = String(item.GRD).trim() === searchParams.grade.trim();
        const widthMatch = Math.abs(Number(item.WIDT) - Number(searchParams.width)) < 0.001;
        const thicknessMatch = Math.abs(Number(item.THK) - Number(searchParams.thickness)) < 0.001;
        const finishEmpty = !item.FIN || item.FIN === "" || item.FIN === "-";
        
        // It is effectively exact if Grade, Width, and Thickness match, and Finish is empty
        // or if Finish actually matches
        const effectivelyExact = gradeMatch && widthMatch && thicknessMatch && 
                                (finishEmpty || String(item.FIN).trim() === searchParams.finish.trim());
        
        if (effectivelyExact) {
          matches[index] = true;
        }
      } else {
        // WIP data exact match logic
        const gradeMatch = String(item.Grade).trim() === searchParams.grade.trim();
        const widthMatch = Math.abs(Number(item.Width) - Number(searchParams.width)) < 0.001;
        const thicknessMatch = Math.abs(Number(item.Thk) - Number(searchParams.thickness)) < 0.001;
        
        const effectivelyExact = gradeMatch && widthMatch && thicknessMatch;
        
        if (effectivelyExact) {
          matches[index] = true;
        }
      }
    });
    
    setEffectivelyExactMatches(matches);
  }, [data, searchParams, isStockData]);
  
  // Determine if we should show as exact match (either server says so or we have detected effectively exact matches)
  const shouldShowAsExactMatch = serverExactMatch || (isStockData && Object.keys(effectivelyExactMatches).length > 0);
  
  // Update message if we are showing as exact match but server did not think so
  const displayMessage = shouldShowAsExactMatch && !serverExactMatch 
    ? "Stock Available (Empty finish treated as match)" 
    : serverMessage;
  
  const handleExport = () => {
    if (!data || data.length === 0) return;
    
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Convert the data to a worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, title.replace(/\s+/g, ""));
      
      // Generate a filename with current date
      const fileName = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
      
      // Write the workbook and trigger a download
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    }
  };
  
  // Helper function to check if a cell value matches the search parameter
  const isMatchingCell = (fieldName: string, value: any): boolean => {
    if (!searchParams) return true;
    
    // Helper to safely compare numeric values
    const numericMatch = (val1: any, val2: any): boolean => {
      if (!val1 || !val2) return false;
      const num1 = Number(val1);
      const num2 = Number(val2);
      if (isNaN(num1) || isNaN(num2)) return false;
      return Math.abs(num1 - num2) < 0.001; // Using small epsilon for float comparison
    };
    
    // Helper to safely compare string values
    const stringMatch = (val1: any, val2: any): boolean => {
      if (!val1 || !val2) return false;
      return String(val1).trim().toLowerCase() === String(val2).trim().toLowerCase();
    };
    
    if (isStockData) {
      // Stock data field mapping
      if (fieldName === "GRD" && stringMatch(value, searchParams.grade)) return true;
      if (fieldName === "WIDT" && numericMatch(value, searchParams.width)) return true;
      if (fieldName === "THK" && numericMatch(value, searchParams.thickness)) return true;
      
      // Special handling for Finish - consider empty values as matching
      if (fieldName === "FIN") {
        if (!value || value === "" || value === "-") return true;
        return stringMatch(value, searchParams.finish);
      }
    } else {
      // WIP data field mapping
      if (fieldName === "Grade" && stringMatch(value, searchParams.grade)) return true;
      if (fieldName === "Width" && numericMatch(value, searchParams.width)) return true;
      if (fieldName === "Thk" && numericMatch(value, searchParams.thickness)) return true;
      // WIP data might not have a finish field
    }
    
    return false;
  };
  
  // Get highlight class for a cell
  const getCellClass = (fieldName: string, value: any, rowIndex: number): string => {
    // If it is one of our effectively exact matches, do not highlight anything
    if (isStockData && effectivelyExactMatches[rowIndex]) {
      return "border border-gray-200 px-4 py-2";
    }
    
    // For partial matches, we want to highlight the differing values
    const isMatching = isMatchingCell(fieldName, value);
    const isHighlightField = isStockData 
      ? ["GRD", "WIDT", "THK", "FIN"].includes(fieldName)
      : ["Grade", "Width", "Thk"].includes(fieldName);
      
    if (isHighlightField && !isMatching) {
      return "border border-gray-200 px-4 py-2 bg-green-100 dark:bg-green-900/20";
    }
    
    return "border border-gray-200 px-4 py-2";
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {found && (
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {found && data ? (
          <div className="space-y-8">
            {/* Exact Matches Section */}
            {Object.keys(effectivelyExactMatches).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Exact Matches</Badge>
                  <span className="text-sm">{isStockData ? "Stock Available (Exact Match)" : "WIP Available (Exact Match)"}</span>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse border border-gray-200 min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        {isStockData ? (
                          <>
                            <th className="border border-gray-200 px-4 py-2 text-left">TYP</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">DTP</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">PKT</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">GRD</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">FIN</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">THK</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">WIDT</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">LNGT</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">PWT</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">QLY</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">EDGE</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">ASP</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">HRC1</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">BL</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">SAL</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">STORE</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">NICKEL</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">COILNO</th>
                          </>
                        ) : (
                          <>
                            <th className="border border-gray-200 px-4 py-2 text-left">S.No</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Coil No</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">DOP</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">LOCATION</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">SUPP</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Grade</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Thk</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Width</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Length</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Weight</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Prev Opn</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Nxt Opn</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Scn Opn</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Decision</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">WIP Remarks</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Disp Status</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">RO No</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(data) && data.map((item, index) => (
                        effectivelyExactMatches[index] && (
                          <tr key={index} className="hover:bg-gray-50">
                            {isStockData ? (
                              <>
                                <td className="border border-gray-200 px-4 py-2">{item.TYP}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.DTP}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.PKT}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.GRD}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.FIN}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.THK}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.WIDT}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.LNGT}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.PWT}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.QLY}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.EDGE}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.ASP}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.HRC1}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.BL}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.SAL}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.STORE}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.NICKEL}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.COILNO}</td>
                              </>
                            ) : (
                              <>
                                <td className="border border-gray-200 px-4 py-2">{item["S.No"]}</td>
                                <td className="border border-gray-200 px-4 py-2">{item["Coil No"]}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.DOP}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.LOCATION}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.SUPP}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.Grade}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.Thk}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.Width}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.Length}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.Weight}</td>
                                <td className="border border-gray-200 px-4 py-2">{item["Prev Opn"]}</td>
                                <td className="border border-gray-200 px-4 py-2">{item["Nxt Opn"]}</td>
                                <td className="border border-gray-200 px-4 py-2">{item["Scn Opn"]}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.Decision}</td>
                                <td className="border border-gray-200 px-4 py-2">{item["WIP Remarks"]}</td>
                                <td className="border border-gray-200 px-4 py-2">{item["Disp Status"]}</td>
                                <td className="border border-gray-200 px-4 py-2">{item["RO No"]}</td>
                              </>
                            )}
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Partial Matches Section */}
            {data.some((_, index) => !effectivelyExactMatches[index]) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Partial Matches</Badge>
                  <span className="text-sm">{isStockData ? "Similar Stock Available" : "Similar WIP Available"}</span>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse border border-gray-200 min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        {isStockData ? (
                          <>
                            <th className="border border-gray-200 px-4 py-2 text-left">TYP</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">DTP</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">PKT</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">GRD</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">FIN</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">THK</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">WIDT</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">LNGT</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">PWT</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">QLY</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">EDGE</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">ASP</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">HRC1</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">BL</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">SAL</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">STORE</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">NICKEL</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">COILNO</th>
                          </>
                        ) : (
                          <>
                            <th className="border border-gray-200 px-4 py-2 text-left">S.No</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Coil No</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">DOP</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">LOCATION</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">SUPP</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Grade</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Thk</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Width</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Length</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Weight</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Prev Opn</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Nxt Opn</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Scn Opn</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Decision</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">WIP Remarks</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Disp Status</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">RO No</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(data) && data.map((item, index) => (
                        !effectivelyExactMatches[index] && (
                          <tr key={index} className="hover:bg-gray-50">
                            {isStockData ? (
                              <>
                                <td className="border border-gray-200 px-4 py-2">{item.TYP}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.DTP}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.PKT}</td>
                                <td className={getCellClass("GRD", item.GRD, index)}>{item.GRD}</td>
                                <td className={getCellClass("FIN", item.FIN, index)}>{item.FIN}</td>
                                <td className={getCellClass("THK", item.THK, index)}>{item.THK}</td>
                                <td className={getCellClass("WIDT", item.WIDT, index)}>{item.WIDT}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.LNGT}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.PWT}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.QLY}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.EDGE}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.ASP}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.HRC1}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.BL}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.SAL}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.STORE}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.NICKEL}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.COILNO}</td>
                              </>
                            ) : (
                              <>
                                <td className="border border-gray-200 px-4 py-2">{item["S.No"]}</td>
                                <td className="border border-gray-200 px-4 py-2">{item["Coil No"]}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.DOP}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.LOCATION}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.SUPP}</td>
                                <td className={getCellClass("Grade", item.Grade, index)}>{item.Grade}</td>
                                <td className={getCellClass("Thk", item.Thk, index)}>{item.Thk}</td>
                                <td className={getCellClass("Width", item.Width, index)}>{item.Width}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.Length}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.Weight}</td>
                                <td className="border border-gray-200 px-4 py-2">{item["Prev Opn"]}</td>
                                <td className="border border-gray-200 px-4 py-2">{item["Nxt Opn"]}</td>
                                <td className="border border-gray-200 px-4 py-2">{item["Scn Opn"]}</td>
                                <td className="border border-gray-200 px-4 py-2">{item.Decision}</td>
                                <td className="border border-gray-200 px-4 py-2">{item["WIP Remarks"]}</td>
                                <td className="border border-gray-200 px-4 py-2">{item["Disp Status"]}</td>
                                <td className="border border-gray-200 px-4 py-2">{item["RO No"]}</td>
                              </>
                            )}
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="rounded-md bg-muted p-4">
              <h3 className="font-medium mb-2">Match Details</h3>
              <p className="text-sm text-muted-foreground">
                {displayMessage}
                {isStockData && Object.keys(effectivelyExactMatches).length > 0 && 
                  " Some items exactly match your search criteria."}
                {data.some((_, index) => !effectivelyExactMatches[index]) &&
                  " Some items approximately match your search criteria."}
                {shouldShowAsExactMatch && !serverExactMatch && isStockData && 
                  " (Records with empty finish values are considered exact matches.)"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-muted p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium">No Data Found</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">{notFoundMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 