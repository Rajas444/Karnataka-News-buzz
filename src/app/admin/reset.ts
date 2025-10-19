// app/api/admin/reset/route.ts
import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST() {
  return new Promise((resolve) => {
    exec("node scripts/resetFirestore.js", (error, stdout, stderr) => {
      if (error) {
        console.error("Error resetting Firestore:", error);
        resolve(
          NextResponse.json({ success: false, message: stderr || error.message })
        );
        return;
      }
      resolve(
        NextResponse.json({ success: true, message: stdout })
      );
    });
  });
}
