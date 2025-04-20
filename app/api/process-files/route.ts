import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const stockFile = formData.get("stockFile") as File
    const wipFile = formData.get("wipFile") as File

    if (!stockFile || !wipFile) {
      return NextResponse.json({ error: "Both Stock Data and WIP Data files are required" }, { status: 400 })
    }

    // Process Stock Data file
    const stockBuffer = await stockFile.arrayBuffer()
    const stockWorkbook = XLSX.read(new Uint8Array(stockBuffer), { type: 'array' })
    const stockSheet = stockWorkbook.Sheets[stockWorkbook.SheetNames[0]]
    const stockData = XLSX.utils.sheet_to_json(stockSheet, { 
      raw: true,
      defval: null
    })

    // Process WIP Data file
    const wipBuffer = await wipFile.arrayBuffer()
    const wipWorkbook = XLSX.read(new Uint8Array(wipBuffer), { type: 'array' })
    const wipSheet = wipWorkbook.Sheets[wipWorkbook.SheetNames[0]]
    
    // First get the raw data with headers from the first row
    const rawWipData = XLSX.utils.sheet_to_json(wipSheet, {
      raw: true,
      defval: null,
      blankrows: false
    })

    console.log('Raw WIP data first row:', rawWipData[0]);

    // Clean and validate the WIP data
    const wipData = rawWipData
      .filter(row => row && typeof row === 'object')  // Remove any invalid rows
      .map(row => {
        // Map the data to our expected structure
        const mappedRow = {
          "S.No": row["S.No"] || "",
          "Coil No": row["Coil No"] || "",
          "DOP": row["DOP"] || "",
          "LOCATION": row["LOCATION"] || "",
          "SUPP": row["SUPP"] || "",
          "Grade": row["Grade"] || "",
          "Thk": Number(row["Thk"]) || 0,
          "Width": Number(row["Width"]) || 0,
          "Length": Number(row["Length"]) || 0,
          "Weight": Number(row["Weight"]) || 0,
          "Prev Opn": row["Prev Opn"] || "",
          "Nxt Opn": row["Nxt Opn"] || "",
          "Scn Opn": row["Scn Opn"] || "",
          "Decision": row["Decision"] || "",
          "WIP Remarks": row["WIP Remarks"] || "",
          "Disp Status": row["Disp Status"] || "",
          "RO No": row["RO No"] || "",
          "LOCATION UPDATED ON": row["LOCATION UPDATED ON"] || "",
          "PPC Remarks": row["PPC Remarks"] || "",
          "HRM Coil Status": row["HRM Coil Status"] || "",
          "Sales Return": row["Sales Return"] || "",
          "Slab Seq": row["Slab Seq"] || ""
        };

        // Debug log for numeric fields
        console.log('Processing row:', {
          grade: mappedRow.Grade,
          thk: mappedRow.Thk,
          width: mappedRow.Width,
          originalThk: row["Thk"],
          originalWidth: row["Width"]
        });

        return mappedRow;
      })
      .filter(row => {
        const isValid = row.Grade && row.Thk > 0 && row.Width > 0;
        if (!isValid) {
          console.log('Filtered out invalid row:', row);
        }
        return isValid;
      }); // Only keep rows with required fields

    // Debug logging
    console.log('Processing files:')
    console.log('Stock File:', stockFile.name)
    console.log('WIP File:', wipFile.name)
    console.log('First processed WIP row:', wipData[0])
    console.log('WIP rows count:', wipData.length)
    console.log('Sample WIP data fields:', wipData[0] ? Object.keys(wipData[0]) : 'No data')

    return NextResponse.json({
      stockData,
      wipData,
      message: "Files processed successfully",
    })
  } catch (error) {
    console.error("Error processing files:", error)
    console.error("Error details:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Failed to process files" }, { status: 500 })
  }
}
