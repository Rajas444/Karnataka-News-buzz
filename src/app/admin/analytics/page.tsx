
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TrafficChart from "@/components/admin/TrafficChart";
import { BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights into your news portal's performance.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6" />
            <span>Coming Soon</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            A comprehensive analytics dashboard is under construction. For now, here is a preview of the traffic chart.
          </p>
          <div className="max-w-4xl mx-auto">
            <TrafficChart />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
