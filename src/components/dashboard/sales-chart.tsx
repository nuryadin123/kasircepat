"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { name: "Sen", total: Math.floor(Math.random() * 500000) + 100000 },
  { name: "Sel", total: Math.floor(Math.random() * 500000) + 100000 },
  { name: "Rab", total: Math.floor(Math.random() * 500000) + 100000 },
  { name: "Kam", total: Math.floor(Math.random() * 500000) + 100000 },
  { name: "Jum", total: Math.floor(Math.random() * 500000) + 100000 },
  { name: "Sab", total: Math.floor(Math.random() * 500000) + 100000 },
  { name: "Min", total: Math.floor(Math.random() * 500000) + 100000 },
]

export function SalesChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="font-headline">Ringkasan Penjualan Minggu Ini</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `Rp${Number(value) / 1000}k`}
            />
            <Tooltip 
              cursor={{fill: 'hsl(var(--muted))'}}
              contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
