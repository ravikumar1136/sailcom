import { type NextRequest, NextResponse } from "next/server"

// Update the interface definitions to match the actual data structure from the screenshots

interface StockData {
  TYP: string
  DTP: string
  PKT: string
  GRD: string
  FIN: string
  THK: number
  WIDT: number
  LNGT: string
  PWT: string
  QLY: string
  EDGE: string
  ASP: string
  HRC1: string
  BL: string
  SAL: string
  STORE: string
  NICKEL: number
  COILNO: string
}

interface WipData {
  "S.No": string
  "Coil No": string
  DOP: string
  LOCATION: string
  SUPP: string
  Grade: string
  Thk: number
  Width: number
  Length: number
  Weight: number
  "Prev Opn": string
  "Nxt Opn": string
  "Scn Opn": string
  Decision: string
  "WIP Remarks": string
  "Disp Status": string
  "RO No": string
  "LOCATION UPDATED ON": string
  "PPC Remarks": string
  "HRM Coil Status": string
  "Sales Return": string
  "Slab Seq": string
}

interface SearchResult {
  found: boolean
  exactMatch: boolean
  message: string
  data: (StockData | WipData)[]  // Changed to array of matches
}

export async function POST(request: NextRequest) {
  try {
    const { grade, width, thickness, finish, stockData, wipData } = await request.json()

    // Convert inputs to appropriate types
    const searchParams = {
      grade: grade.toString(),
      width: Number.parseFloat(width),
      thickness: Number.parseFloat(thickness),
      finish: finish.toString(),
    }

    // Search in stock data
    const stockResult = searchStockData(searchParams, stockData)

    // Search in WIP data
    const wipResult = searchWipData(searchParams, wipData)

    return NextResponse.json({
      stockResult,
      wipResult,
    })
  } catch (error) {
    console.error("Error processing search:", error)
    return NextResponse.json({ error: "Failed to process search" }, { status: 500 })
  }
}

// Update the search function to match the actual data structure
function searchStockData(
  searchParams: { grade: string; width: number; thickness: number; finish: string },
  stockData: StockData[],
): SearchResult {
  // Case 1: Exact matches
  const exactMatches = stockData.filter(
    (item) =>
      item.GRD === searchParams.grade &&
      item.WIDT === searchParams.width &&
      item.THK === searchParams.thickness &&
      (item.FIN === searchParams.finish || !item.FIN), // Also include items with empty finish
  ).slice(0, 10); // Get up to 10 exact matches

  // Case 2: Same grade and thickness matches
  const sameGradeThicknessMatches = stockData.filter(
    (item) => item.GRD === searchParams.grade && item.THK === searchParams.thickness
  ).filter(item => !exactMatches.includes(item)) // Exclude exact matches
   .slice(0, 5); // Get up to 5 grade/thickness matches

  // Case 3: Same grade and thickness within ±0.25
  const thicknessRangeMatches = stockData.filter(
    (item) => 
      item.GRD === searchParams.grade && 
      Math.abs(item.THK - searchParams.thickness) <= 0.25
  ).filter(item => 
    !exactMatches.includes(item) && 
    !sameGradeThicknessMatches.includes(item)
  ).slice(0, 5); // Get up to 5 thickness range matches

  // Case 4: Approximate matches
  const approximateMatches = stockData.filter(
    (item) =>
      item.GRD === searchParams.grade &&
      (Math.abs(item.THK - searchParams.thickness) <= 0.5 ||
        Math.abs(item.WIDT - searchParams.width) <= 100 ||
        item.FIN === searchParams.finish ||
        !item.FIN) // Also include items with empty finish
  ).filter(item => 
    !exactMatches.includes(item) && 
    !sameGradeThicknessMatches.includes(item) && 
    !thicknessRangeMatches.includes(item)
  ).slice(0, 5); // Get up to 5 approximate matches

  // Combine all matches
  const allMatches = [
    ...exactMatches,
    ...sameGradeThicknessMatches,
    ...thicknessRangeMatches,
    ...approximateMatches
  ];

  if (allMatches.length > 0) {
    return {
      found: true,
      exactMatch: exactMatches.length > 0,
      message: exactMatches.length > 0 ? "Stock Available" : "Approximate Stock Available",
      data: allMatches,
    }
  }

  return {
    found: false,
    exactMatch: false,
    message: "Stock is not available",
    data: [],
  }
}

function searchWipData(
  searchParams: { grade: string; width: number; thickness: number; finish: string },
  wipData: WipData[],
): SearchResult {
  if (!wipData || wipData.length === 0) {
    return {
      found: false,
      exactMatch: false,
      message: "No WIP data available",
      data: [],
    }
  }

  // Debug logging
  console.log('Search params:', searchParams);
  console.log('First WIP item:', wipData[0]);

  // Case 1: Exact matches
  const exactMatches = wipData.filter((item) => {
    if (!item.Grade || !item.Width || !item.Thk) return false;

    // Convert values to proper format for comparison
    const itemGrade = String(item.Grade).trim();
    const itemWidth = Number(item.Width);
    const itemThk = Number(item.Thk);
    const searchGrade = searchParams.grade.trim();

    const gradeMatch = itemGrade === searchGrade;
    const widthMatch = Math.abs(itemWidth - searchParams.width) < 1;
    const thicknessMatch = Math.abs(itemThk - searchParams.thickness) < 0.01;

    console.log('Comparing:', {
      item: { grade: itemGrade, width: itemWidth, thk: itemThk },
      search: { grade: searchGrade, width: searchParams.width, thk: searchParams.thickness },
      matches: { gradeMatch, widthMatch, thicknessMatch }
    });

    return gradeMatch && widthMatch && thicknessMatch;
  }).slice(0, 3); // Get up to 3 exact matches

  // Case 2: Same grade and thickness matches
  const sameGradeThicknessMatches = wipData.filter((item) => {
    if (!item.Grade || !item.Thk) return false;
    
    const itemGrade = String(item.Grade).trim();
    const itemThk = Number(item.Thk);
    const searchGrade = searchParams.grade.trim();

    const gradeMatch = itemGrade === searchGrade;
    const thicknessMatch = Math.abs(itemThk - searchParams.thickness) < 0.01;
    
    return gradeMatch && thicknessMatch;
  }).filter(item => !exactMatches.includes(item))
    .slice(0, 2); // Get up to 2 grade/thickness matches

  // Case 3: Same grade and thickness within ±0.25
  const thicknessRangeMatches = wipData.filter((item) => {
    if (!item.Grade || !item.Thk) return false;
    
    const itemGrade = String(item.Grade).trim();
    const itemThk = Number(item.Thk);
    const searchGrade = searchParams.grade.trim();

    const gradeMatch = itemGrade === searchGrade;
    const thicknessInRange = Math.abs(itemThk - searchParams.thickness) <= 0.25;
    
    return gradeMatch && thicknessInRange;
  }).filter(item => 
    !exactMatches.includes(item) && 
    !sameGradeThicknessMatches.includes(item)
  ).slice(0, 2); // Get up to 2 thickness range matches

  // Case 4: Approximate matches
  const approximateMatches = wipData.filter((item) => {
    if (!item.Grade || !item.Width || !item.Thk) return false;
    
    const itemGrade = String(item.Grade).trim();
    const itemWidth = Number(item.Width);
    const itemThk = Number(item.Thk);
    const searchGrade = searchParams.grade.trim();

    const gradeMatch = itemGrade === searchGrade;
    const thicknessApprox = Math.abs(itemThk - searchParams.thickness) <= 0.5;
    const widthApprox = Math.abs(itemWidth - searchParams.width) <= 100;
    
    return gradeMatch && (thicknessApprox || widthApprox);
  }).filter(item => 
    !exactMatches.includes(item) && 
    !sameGradeThicknessMatches.includes(item) && 
    !thicknessRangeMatches.includes(item)
  ).slice(0, 2); // Get up to 2 approximate matches

  // Combine all matches
  const allMatches = [
    ...exactMatches,
    ...sameGradeThicknessMatches,
    ...thicknessRangeMatches,
    ...approximateMatches
  ];

  if (allMatches.length > 0) {
    return {
      found: true,
      exactMatch: exactMatches.length > 0,
      message: exactMatches.length > 0 ? "WIP Available" : "Approximate WIP Available",
      data: allMatches,
    }
  }

  return {
    found: false,
    exactMatch: false,
    message: "WIP is not available",
    data: [],
  }
}
