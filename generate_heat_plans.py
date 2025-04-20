import pandas as pd
import json

def read_csv_files():
    # Read the CSV files
    orders_df = pd.read_csv('sample_order_data.csv')
    stock_df = pd.read_csv('sample_stock_data.csv')
    wip_df = pd.read_csv('sample_wip_data.csv')
    return orders_df, stock_df, wip_df

def process_heat_plans():
    orders_df, stock_df, wip_df = read_csv_files()
    heat_plans = []
    available_stock = []
    used_pktnos = set()

    # Process each order
    for _, order in orders_df.iterrows():
        # Try to match with stock
        stock_match = stock_df[
            (stock_df['GRD'] == order['Grade']) &
            (abs(stock_df['THK'] - order['Thi']) < 0.01) &
            (stock_df['WIDT'] == order['Wid']) &
            (stock_df['FIN'] == order['F']) &
            (~stock_df['PKT'].isin(used_pktnos))
        ].iloc[0] if len(stock_df[
            (stock_df['GRD'] == order['Grade']) &
            (abs(stock_df['THK'] - order['Thi']) < 0.01) &
            (stock_df['WIDT'] == order['Wid']) &
            (stock_df['FIN'] == order['F']) &
            (~stock_df['PKT'].isin(used_pktnos))
        ]) > 0 else None

        if stock_match is not None:
            available_stock.append({
                'Grade': order['Grade'],
                'Width': order['Wid'],
                'PKTNO': stock_match['PKT'],
                'CustomerName': order['Customer']
            })
            used_pktnos.add(stock_match['PKT'])
            continue

        # Try to match with WIP
        wip_match = wip_df[
            (wip_df['Grade'] == order['Grade']) &
            (abs(wip_df['Thk'] - order['Thi']) < 0.01) &
            (wip_df['Width'] == order['Wid']) &
            (~wip_df['Coil No'].isin(used_pktnos))
        ].iloc[0] if len(wip_df[
            (wip_df['Grade'] == order['Grade']) &
            (abs(wip_df['Thk'] - order['Thi']) < 0.01) &
            (wip_df['Width'] == order['Wid']) &
            (~wip_df['Coil No'].isin(used_pktnos))
        ]) > 0 else None

        if wip_match is not None:
            available_stock.append({
                'Grade': order['Grade'],
                'Width': order['Wid'],
                'PKTNO': wip_match['Coil No'],
                'CustomerName': order['Customer']
            })
            used_pktnos.add(wip_match['Coil No'])
            continue

        # If no match found, add to heat plans
        existing_plan = next(
            (plan for plan in heat_plans 
             if plan['Grade'] == order['Grade'] and plan['Width'] == order['Wid']),
            None
        )

        if existing_plan:
            existing_plan['Quantity'] += order['Qty']
            existing_plan['NoOfHeat'] = max(1, round(existing_plan['Quantity'] / 60))
        else:
            heat_plans.append({
                'Grade': order['Grade'],
                'Width': order['Wid'],
                'NoOfSlabs': '',
                'Quantity': order['Qty'],
                'NoOfHeat': max(1, round(order['Qty'] / 60))
            })

    # Sort heat plans
    heat_plans.sort(key=lambda x: (x['Grade'], x['Width']))
    
    # Save results to JSON files
    with open('heat_plans.json', 'w') as f:
        json.dump(heat_plans, f, indent=2)
    
    with open('available_stock.json', 'w') as f:
        json.dump(available_stock, f, indent=2)

    print("Heat Plans generated successfully!")
    print(f"Number of heat plans: {len(heat_plans)}")
    print(f"Number of available stock matches: {len(available_stock)}")

if __name__ == "__main__":
    process_heat_plans() 