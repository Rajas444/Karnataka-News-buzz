'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: 'Bengaluru', views: 4000 },
  { name: 'Mysuru', views: 3000 },
  { name: 'Mangaluru', views: 2000 },
  { name: 'Belagavi', views: 2780 },
  { name: 'Hubballi', views: 1890 },
  { name: 'Shivamogga', views: 2390 },
  { name: 'Udupi', views: 3490 },
];

export default function TrafficChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic by District</CardTitle>
        <CardDescription>An overview of article views per district in the last 30 days.</CardDescription>
      </CardHeader>
      <CardContent>
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
              tickFormatter={(value) => `${value / 1000}k`}
            />
             <Tooltip
                cursor={{fill: 'hsl(var(--muted))'}}
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))'
                }}
            />
            <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
