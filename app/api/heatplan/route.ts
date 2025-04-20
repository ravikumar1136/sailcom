import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// Function to normalize column names (remove spaces, special characters, and convert to lowercase)
function normalizeColumnName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Function to find matching column based on normalized name
function findMatchingColumn(headers: string[], targetColumn: string): string | null {
  const normalizedTarget = normalizeColumnName(targetColumn);
  return headers.find(header => normalizeColumnName(header) === normalizedTarget) || null;
}

// Required columns for each file type
const requiredColumns = {
  order: ['Order No', 'Material', 'Quantity'],
  stock: ['Material', 'Stock Quantity', 'Location'],
  wip: ['Material', 'WIP Quantity', 'Status']
};

// Function to validate file columns
function validateFileColumns(worksheet: XLSX.WorkSheet, fileType: 'order' | 'stock' | 'wip'): string[] {
  const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
  const missingColumns: string[] = [];

  requiredColumns[fileType].forEach(requiredCol => {
    if (!findMatchingColumn(headers, requiredCol)) {
      missingColumns.push(requiredCol);
    }
  });

  return missingColumns;
}

// Function to process the heatplan
function processHeatplan(orderData: any[], stockData: any[], wipData: any[]) {
  // Create a map to store material information
  const materialMap = new Map();

  // Process order data
  orderData.forEach(order => {
    const material = order.Material;
    if (!materialMap.has(material)) {
      materialMap.set(material, {
        material,
        orderQuantity: 0,
        stockQuantity: 0,
        wipQuantity: 0,
        locations: new Set(),
        status: []
      });
    }
    materialMap.get(material).orderQuantity += Number(order.Quantity) || 0;
  });

  // Process stock data
  stockData.forEach(stock => {
    const material = stock.Material;
    if (!materialMap.has(material)) {
      materialMap.set(material, {
        material,
        orderQuantity: 0,
        stockQuantity: 0,
        wipQuantity: 0,
        locations: new Set(),
        status: []
      });
    }
    const materialInfo = materialMap.get(material);
    materialInfo.stockQuantity += Number(stock['Stock Quantity']) || 0;
    if (stock.Location) {
      materialInfo.locations.add(stock.Location);
    }
  });

  // Process WIP data
  wipData.forEach(wip => {
    const material = wip.Material;
    if (!materialMap.has(material)) {
      materialMap.set(material, {
        material,
        orderQuantity: 0,
        stockQuantity: 0,
        wipQuantity: 0,
        locations: new Set(),
        status: []
      });
    }
    const materialInfo = materialMap.get(material);
    materialInfo.wipQuantity += Number(wip['WIP Quantity']) || 0;
    if (wip.Status) {
      materialInfo.status.push(wip.Status);
    }
  });

  // Convert map to array and format the data
  return Array.from(materialMap.values()).map(info => ({
    ...info,
    locations: Array.from(info.locations),
    totalAvailableQuantity: info.stockQuantity + info.wipQuantity,
    deficit: info.orderQuantity - (info.stockQuantity + info.wipQuantity)
  }));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = {
      order: formData.get('orderFile') as File,
      stock: formData.get('stockFile') as File,
      wip: formData.get('wipFile') as File
    };

    // Validate that all required files are present
    const missingFiles = Object.entries(files)
      .filter(([_, file]) => !file)
      .map(([type]) => type);

    if (missingFiles.length > 0) {
      return NextResponse.json(
        { error: `Missing required files: ${missingFiles.join(', ')}` },
        { status: 400 }
      );
    }

    // Process each file
    const fileData: { [key: string]: any[] } = {};
    const fileValidationErrors: string[] = [];

    for (const [fileType, file] of Object.entries(files)) {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Validate columns
      const missingColumns = validateFileColumns(worksheet, fileType as 'order' | 'stock' | 'wip');
      if (missingColumns.length > 0) {
        fileValidationErrors.push(
          `${fileType} file is missing required columns: ${missingColumns.join(', ')}`
        );
        continue;
      }

      // Convert worksheet to JSON
      fileData[fileType] = XLSX.utils.sheet_to_json(worksheet);
    }

    if (fileValidationErrors.length > 0) {
      return NextResponse.json(
        { error: 'File validation errors', details: fileValidationErrors },
        { status: 400 }
      );
    }

    // Process the data
    const result = processHeatplan(fileData.order, fileData.stock, fileData.wip);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error processing heatplan:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 