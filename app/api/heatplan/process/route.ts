import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { processHeatplan } from '@/lib/heatplan';

function normalizeColumnName(name: string): string {
  return name.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/^b/, '')  // Remove 'B' prefix
    .replace(/^ssp/, '') // Remove 'SSP' prefix
    .replace(/ro$/, ''); // Remove 'RO' suffix
}

function findMatchingColumn(headers: string[], possibleNames: string[]): string | null {
  const normalizedHeaders = headers.map(normalizeColumnName);
  const normalizedPossibleNames = possibleNames.map(normalizeColumnName);
  
  for (const header of normalizedHeaders) {
    if (normalizedPossibleNames.includes(header)) {
      return headers[normalizedHeaders.indexOf(header)];
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const orderFile = formData.get('orderFile') as File;
    const stockFile = formData.get('stockFile') as File;
    const wipFile = formData.get('wipFile') as File;

    console.log('Received files:', {
      orderFile: orderFile?.name,
      stockFile: stockFile?.name,
      wipFile: wipFile?.name
    });

    if (!orderFile || !stockFile || !wipFile) {
      return NextResponse.json(
        { error: 'All files are required' },
        { status: 400 }
      );
    }

    // Read files
    const orderData = await readExcelFile(orderFile);
    const stockData = await readExcelFile(stockFile);
    const wipData = await readExcelFile(wipFile);

    // Get headers from first row
    const orderHeaders = Object.keys(orderData[0] || {});
    const stockHeaders = Object.keys(stockData[0] || {});
    const wipHeaders = Object.keys(wipData[0] || {});

    console.log('Found headers:', {
      order: orderHeaders,
      stock: stockHeaders,
      wip: wipHeaders
    });

    // Map order data columns
    const orderColumnMap = {
      Grade: findMatchingColumn(orderHeaders, ['Grade', 'grade', 'GRADE', 'Material']),
      Width: findMatchingColumn(orderHeaders, ['Width', 'WIDTH', 'Wid', 'WID', 'WIDT']),
      Thickness: findMatchingColumn(orderHeaders, ['Thickness', 'THK', 'Thi', 'THICKNESS']),
      Finish: findMatchingColumn(orderHeaders, ['Finish', 'FIN', 'F']),
      'B Qty': findMatchingColumn(orderHeaders, ['B Qty', 'BQty', 'Quantity', 'QTY']),
      'R Qty': findMatchingColumn(orderHeaders, ['R Qty', 'RQty', 'Received', 'RQTY'])
    };

    // Map stock data columns
    const stockColumnMap = {
      Grade: findMatchingColumn(stockHeaders, ['Grade', 'GRD', 'GRADE', 'Material']),
      Width: findMatchingColumn(stockHeaders, ['Width', 'WIDT', 'Wid']),
      Thickness: findMatchingColumn(stockHeaders, ['Thickness', 'THK', 'Thi']),
      Finish: findMatchingColumn(stockHeaders, ['Finish', 'FIN', 'F']),
      PKTNO: findMatchingColumn(stockHeaders, ['PKTNO', 'PKT', 'Packet'])
    };

    // Map WIP data columns
    const wipColumnMap = {
      Grade: findMatchingColumn(wipHeaders, ['Grade', 'GRADE', 'Material']),
      Width: findMatchingColumn(wipHeaders, ['Width', 'WIDT', 'Wid']),
      Thickness: findMatchingColumn(wipHeaders, ['Thickness', 'THK', 'Thi']),
      'Coil No': findMatchingColumn(wipHeaders, ['Coil No', 'CoilNo', 'COILNO'])
    };

    // Validate all required columns are found
    const missingOrderColumns = Object.entries(orderColumnMap)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);

    const missingStockColumns = Object.entries(stockColumnMap)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);

    const missingWipColumns = Object.entries(wipColumnMap)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);

    if (missingOrderColumns.length > 0) {
      throw new Error(`Missing order columns: ${missingOrderColumns.join(', ')}. Found: ${orderHeaders.join(', ')}`);
    }

    if (missingStockColumns.length > 0) {
      throw new Error(`Missing stock columns: ${missingStockColumns.join(', ')}. Found: ${stockHeaders.join(', ')}`);
    }

    if (missingWipColumns.length > 0) {
      throw new Error(`Missing WIP columns: ${missingWipColumns.join(', ')}. Found: ${wipHeaders.join(', ')}`);
    }

    // Map data to expected format
    const mappedOrderData = orderData.map(row => ({
      Grade: String(row[orderColumnMap.Grade!]),
      Width: Number(row[orderColumnMap.Width!]),
      Thickness: Number(row[orderColumnMap.Thickness!]),
      Finish: String(row[orderColumnMap.Finish!]),
      'B Qty': Number(row[orderColumnMap['B Qty']!] || 0),
      'R Qty': Number(row[orderColumnMap['R Qty']!] || 0)
    }));

    const mappedStockData = stockData.map(row => ({
      Grade: String(row[stockColumnMap.Grade!]),
      Width: Number(row[stockColumnMap.Width!]),
      Thickness: Number(row[stockColumnMap.Thickness!]),
      Finish: String(row[stockColumnMap.Finish!]),
      PKTNO: String(row[stockColumnMap.PKTNO!])
    }));

    const mappedWipData = wipData.map(row => ({
      Grade: String(row[wipColumnMap.Grade!]),
      Width: Number(row[wipColumnMap.Width!]),
      Thickness: Number(row[wipColumnMap.Thickness!]),
      'Coil No': String(row[wipColumnMap['Coil No']!])
    }));

    // Process the data
    const result = processHeatplan(mappedOrderData, mappedStockData, mappedWipData);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing heatplan:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process heatplan' },
      { status: 500 }
    );
  }
}

async function readExcelFile(file: File) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid file format - expected array of records');
    }
    
    if (data.length === 0) {
      throw new Error('File is empty');
    }
    
    return data;
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error(`Failed to read file: ${error.message}`);
  }
} 