"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("PDFファイルを選択してください");
        setFile(null);
      } else {
        setError(null);
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("ファイルを選択してください");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/screen-candidate", {
        method: "POST",
        body: formData,
      });

      console.log("レスポンスステータス:", response.status);
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.text();
          console.log("レスポンステキスト:", errorData);
          errorData = JSON.parse(errorData);
        } catch (jsonError) {
          errorData = { error: "レスポンスが不正です", details: "JSON解析に失敗しました" };
        }
        console.error("APIエラー詳細:", errorData);
        throw new Error(errorData.error || "履歴書の解析に失敗しました");
      }

      const data = await response.json();
      console.log("APIレスポンス:", data);
      if (data.questions) {
        // questionsをstring[]形式に変換
        const questionsToStore = data.questions.map((q: { id: string; text: string }) => q.text);
        console.log("保存するquestions:", questionsToStore);
        sessionStorage.setItem("questions", JSON.stringify(questionsToStore));
        router.push("/upload");
      } else {
        throw new Error("質問の生成に失敗しました");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">履歴書アップロード</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              PDFファイルを選択
            </label>
            <input
              type="file"
              id="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={uploading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {uploading ? "アップロード中..." : "アップロード"}
          </button>
        </form>
      </div>
    </div>
  );
}