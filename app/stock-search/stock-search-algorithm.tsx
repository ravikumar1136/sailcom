"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function StockSearchAlgorithm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Algorithm Explanation</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="case1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="case1">Case 1</TabsTrigger>
            <TabsTrigger value="case2">Case 2</TabsTrigger>
            <TabsTrigger value="case3">Case 3</TabsTrigger>
            <TabsTrigger value="case4">Case 4</TabsTrigger>
          </TabsList>
          <TabsContent value="case1" className="space-y-4 pt-4">
            <h3 className="font-medium">Case 1: Exact Match</h3>
            <p className="text-sm text-muted-foreground">
              When all parameters (Grade, Width, Thickness, Finish) match exactly with the stock data, the system will
              show that complete row of stock data with a message indicating that the stock is available.
            </p>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm">
                <strong>Example:</strong> If you search for Grade: X70, Width: 1500, Thickness: 12.5, Finish: 2B and
                there is an exact match in the stock data, the system will show the complete row with a message "Stock
                Available".
              </p>
            </div>
          </TabsContent>
          <TabsContent value="case2" className="space-y-4 pt-4">
            <h3 className="font-medium">Case 2: Same Grade and Thickness</h3>
            <p className="text-sm text-muted-foreground">
              If any of the values do not match exactly, the system will first check if the same grade is available. If
              the same grade is available, it will then check if the thickness also matches. If both grade and thickness
              match, it will show that row with a message indicating that stock is available with the same thickness but
              other values may differ.
            </p>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm">
                <strong>Example:</strong> If you search for Grade: X70, Width: 1500, Thickness: 12.5, Finish: 2B but
                only a stock with Grade: X70, Width: 1450, Thickness: 12.5, Finish: 2B is available, the system will
                show this row with a message "Stock available with same thickness but different width".
              </p>
            </div>
          </TabsContent>
          <TabsContent value="case3" className="space-y-4 pt-4">
            <h3 className="font-medium">Case 3: Same Grade with Thickness Range</h3>
            <p className="text-sm text-muted-foreground">
              If the grade matches but the thickness does not match exactly, the system will check if there is stock
              with the same grade and a thickness within ±0.25 of the requested value. If found, it will show that row
              with an appropriate message.
            </p>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm">
                <strong>Example:</strong> If you search for Grade: X70, Width: 1500, Thickness: 12.5, Finish: 2B but
                only a stock with Grade: X70, Width: 1500, Thickness: 12.7, Finish: 2B is available, the system will
                show this row with a message "Stock available with similar thickness (within ±0.25)".
              </p>
            </div>
          </TabsContent>
          <TabsContent value="case4" className="space-y-4 pt-4">
            <h3 className="font-medium">Case 4: No Match</h3>
            <p className="text-sm text-muted-foreground">
              If none of the above cases are satisfied, the system will show a message indicating that no stock is
              available matching the search criteria.
            </p>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm">
                <strong>Example:</strong> If you search for Grade: X70, Width: 1500, Thickness: 12.5, Finish: 2B but
                there is no stock with Grade X70 or the available stock with Grade X70 has a thickness that is not
                within ±0.25 of 12.5, the system will show a message "Stock is not available".
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
