import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

interface OrderData {
  Grade: string;
  Thi: number;
  Wid: number;
  F: string;
  Qty: number;
  Customer: string;
}

interface StockData {
  GRD: string;
  THK: number;
  WIDT: number;
  FIN: string;
  PKT: string;
}

interface WIPData {
  'Coil No': string;
  Grade: string;
  Thk: number;
  Width: number;
}

interface HeatPlan {
  Grade: string;
  Width: number;
  NoOfSlabs: string;
  Quantity: number;
  NoOfHeat: number;
}

interface AvailableStock {
  Grade: string;
  Width: number;
  PKTNO: string;
  CustomerName: string;
}

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
    const orderHeaders = Object.keys(orderData[0]);
    const stockHeaders = Object.keys(stockData[0]);
    const wipHeaders = Object.keys(wipData[0]);

    console.log('Found headers:', {
      order: orderHeaders,
      stock: stockHeaders,
      wip: wipHeaders
    });

    // Map columns with flexible matching
    const orderColumnMap = {
      Grade: findMatchingColumn(orderHeaders, ['Grade', 'grade', 'GRADE', 'Material', 'material', 'GRD', 'grd']),
      Thi: findMatchingColumn(orderHeaders, ['Thi', 'THI', 'Thickness', 'THICKNESS', 'THK', 'thk']),
      Wid: findMatchingColumn(orderHeaders, ['Wid', 'WID', 'Width', 'WIDTH', 'WIDT', 'widt']),
      F: findMatchingColumn(orderHeaders, ['F', 'f', 'Finish', 'FINISH', 'FIN', 'fin']),
      Qty: findMatchingColumn(orderHeaders, ['Qty', 'QTY', 'Quantity', 'QUANTITY', 'B Qty', 'B QTY', 'BQTY']),
      Customer: findMatchingColumn(orderHeaders, ['Customer', 'CUSTOMER', 'CustomerName', 'CUSTOMERNAME'])
    };

    const stockColumnMap = {
      GRD: findMatchingColumn(stockHeaders, ['GRD', 'Grade', 'GRADE', 'Material']),
      THK: findMatchingColumn(stockHeaders, ['THK', 'Thickness', 'THICKNESS', 'Thi']),
      WIDT: findMatchingColumn(stockHeaders, ['WIDT', 'Width', 'WIDTH', 'Wid']),
      FIN: findMatchingColumn(stockHeaders, ['FIN', 'Finish', 'FINISH', 'F']),
      PKT: findMatchingColumn(stockHeaders, ['PKT', 'PKTNO', 'PacketNo', 'Packet'])
    };

    const wipColumnMap = {
      'Coil No': findMatchingColumn(wipHeaders, ['Coil No', 'CoilNo', 'COILNO', 'Coil']),
      Grade: findMatchingColumn(wipHeaders, ['Grade', 'GRADE', 'Material']),
      Thk: findMatchingColumn(wipHeaders, ['Thk', 'THK', 'Thickness']),
      Width: findMatchingColumn(wipHeaders, ['Width', 'WIDTH', 'Wid'])
    };

    // Map data to expected format
    const mappedOrderData = orderData.map(row => ({
      Grade: String(row[orderColumnMap.Grade!] || '').trim(),
      Thi: Number(row[orderColumnMap.Thi!]) || 0,
      Wid: Number(row[orderColumnMap.Wid!]) || 0,
      F: String(row[orderColumnMap.F!] || '').trim(),
      Qty: Number(row[orderColumnMap.Qty!]) || 0,
      Customer: String(row[orderColumnMap.Customer!] || '').trim()
    }));

    const mappedStockData = stockData.map(row => ({
      GRD: String(row[stockColumnMap.GRD!] || '').trim(),
      THK: Number(row[stockColumnMap.THK!]) || 0,
      WIDT: Number(row[stockColumnMap.WIDT!]) || 0,
      FIN: String(row[stockColumnMap.FIN!] || '').trim(),
      PKT: String(row[stockColumnMap.PKT!] || '').trim()
    }));

    const mappedWipData = wipData.map(row => ({
      'Coil No': String(row[wipColumnMap['Coil No']!] || '').trim(),
      Grade: String(row[wipColumnMap.Grade!] || '').trim(),
      Thk: Number(row[wipColumnMap.Thk!]) || 0,
      Width: Number(row[wipColumnMap.Width!]) || 0
    }));

    // Process data
    const heatPlans: HeatPlan[] = [];
    const availableStock: AvailableStock[] = [];
    const usedPKTNOs = new Set<string>();

    // Process each order
    for (const order of mappedOrderData) {
      // Skip if order has no grade or quantity
      if (!order.Grade || !order.Qty) {
        continue;
      }

      // Try stock match first
      const stockMatch = mappedStockData.find(
        stock =>
          stock.GRD === order.Grade &&
          Math.abs(stock.THK - order.Thi) < 0.01 &&
          stock.WIDT === order.Wid &&
          stock.FIN === order.F &&
          !usedPKTNOs.has(stock.PKT)
      );

      if (stockMatch) {
        availableStock.push({
          Grade: order.Grade,
          Width: order.Wid,
          PKTNO: stockMatch.PKT,
          CustomerName: order.Customer
        });
        usedPKTNOs.add(stockMatch.PKT);
        continue;
      }

      // Try WIP match
      const wipMatch = mappedWipData.find(
        wip =>
          wip.Grade === order.Grade &&
          Math.abs(wip.Thk - order.Thi) < 0.01 &&
          wip.Width === order.Wid &&
          !usedPKTNOs.has(wip['Coil No'])
      );

      if (wipMatch) {
        availableStock.push({
          Grade: order.Grade,
          Width: order.Wid,
          PKTNO: wipMatch['Coil No'],
          CustomerName: order.Customer
        });
        usedPKTNOs.add(wipMatch['Coil No']);
        continue;
      }

      // If no match found, add to heat plans
      const existingPlan = heatPlans.find(
        plan => plan.Grade === order.Grade && plan.Width === order.Wid
      );

      if (existingPlan) {
        existingPlan.Quantity += order.Qty;
        existingPlan.NoOfHeat = Math.max(1, Math.ceil(existingPlan.Quantity / 60));
      } else {
        heatPlans.push({
          Grade: order.Grade,
          Width: order.Wid,
          NoOfSlabs: '',
          Quantity: order.Qty,
          NoOfHeat: Math.max(1, Math.ceil(order.Qty / 60))
        });
      }
    }

    // Sort heat plans
    heatPlans.sort((a, b) => {
      if (a.Grade === b.Grade) {
        return a.Width - b.Width;
      }
      return a.Grade.localeCompare(b.Grade);
    });

    console.log('Generated data:', {
      heatPlans,
      availableStock
    });

    return NextResponse.json({
      heatPlans,
      availableStock
    });

  } catch (error) {
    console.error('Error processing files:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function readExcelFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(worksheet);
} 