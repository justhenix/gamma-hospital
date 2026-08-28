import { NextResponse } from "next/server";
import { getDisplayBoardData } from "@/server/data-access/queue";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getDisplayBoardData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch display data" },
      { status: 500 }
    );
  }
}
