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

          if (!response.ok) {
            const errorData = await response.json();
            console.error("APIエラー詳細:", errorData); // デバッグ用
            throw new Error(errorData.error || "履歴書の解析に失敗しました");
          }

          const data = await response.json();
          console.log("APIレスポンス:", data); // デバッグ用
          if (data.questions) {
            sessionStorage.setItem("questions", JSON.stringify(data.questions));
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