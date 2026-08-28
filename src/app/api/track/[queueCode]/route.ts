import { NextRequest, NextResponse } from "next/server";
import { getQueueByCode } from "@/server/data-access/queue";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queueCode: string }> }
) {
  try {
    const { queueCode } = await params;
    const data = await getQueueByCode(queueCode);

    if (!data) {
      return NextResponse.json(
        { error: `Queue code "${queueCode}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tracker data" },
      { status: 500 }
    );
  }
}
