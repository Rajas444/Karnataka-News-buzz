"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SeedDatabase() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Error seeding database");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seed Database</CardTitle>
        <CardDescription>Populate Firestore with sample articles, districts, and categories.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSeed} disabled={loading}>
          {loading ? "Seeding..." : "Seed Live Database"}
        </Button>
        {message && <p className="mt-2">{message}</p>}
      </CardContent>
    </Card>
  );
}
