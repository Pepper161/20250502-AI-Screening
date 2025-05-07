import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log(req); // 仮にログ出力
  return NextResponse.json({ success: true, message: "認証機能は後で実装予定" });
}