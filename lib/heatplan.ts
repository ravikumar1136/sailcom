interface OrderData {
  Grade: string;
  Width: number;
  Thickness: number;
  Finish: string;
  'B Qty': number;
  'R Qty': number;
}

interface StockData {
  Grade: string;
  Width: number;
  Thickness: number;
  Finish: string;
  PKTNO: string;
}

interface WIPData {
  Grade: string;
  Width: number;
  Thickness: number;
  'Coil No': string;
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
}

interface ProcessedData {
  heatPlans: HeatPlan[];
  availableStock: AvailableStock[];
}

export function processHeatplan(
  orderData: OrderData[],
  stockData: StockData[],
  wipData: WIPData[]
): ProcessedData {
  const heatPlans: HeatPlan[] = [];
  const availableStock: AvailableStock[] = [];
  const usedPKTNOs = new Set<string>();

  // Process each order
  for (const order of orderData) {
    // Skip if order has no grade or quantity
    if (!order.Grade || !order.Qty) {
      continue;
    }

    // Try stock match first
    const stockMatch = stockData.find(
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
        CustomerName: order.Customer,
      });
      usedPKTNOs.add(stockMatch.PKT);
      continue;
    }

    // Try WIP match
    const wipMatch = wipData.find(
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
        CustomerName: order.Customer,
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
        NoOfHeat: Math.max(1, Math.ceil(order.Qty / 60)),
      });
    }
  }

  // Sort heat plans first by Grade, then by Width
  heatPlans.sort((a, b) => {
    if (a.Grade === b.Grade) {
      return a.Width - b.Width;
    }
    return a.Grade.localeCompare(b.Grade);
  });

  // Log heat plans for debugging
  console.log('Generated heat plans:', heatPlans);

  return {
    heatPlans,
    availableStock
  };
} 