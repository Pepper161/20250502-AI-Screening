import { NextResponse } from "next/server";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createPagesServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: () => cookies() }
  );

  // ユーザー認証を確認
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  // リクエストボディから回答を取得
  const { answers }: { answers: { questionId: string; answerText: string }[] } = await req.json();
  const userId = user.id;

  try {
    // Supabase に回答を保存
    const { error } = await supabase.from("answers").insert(
      answers.map((a) => ({
        user_id: userId,
        question_id: a.questionId,
        answer_text: a.answerText,
      }))
    );
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("保存エラー:", error);
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}