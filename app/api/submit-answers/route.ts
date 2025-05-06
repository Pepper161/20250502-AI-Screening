import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { answers }: { answers: { questionId: string; answerText: string }[] } = await req.json();
  const userId = session.user.id;

  try {
    await prisma.answer.createMany({
      data: answers.map((a) => ({
        userId,
        questionId: a.questionId,
        answerText: a.answerText,
      })),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("保存エラー:", error);
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}