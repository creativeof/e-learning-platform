import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-8 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
            E-Learning Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            YouTube動画を活用したオンライン学習プラットフォーム。
            あなたのペースで、好きな講座を学びましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href="/courses"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors text-lg"
            >
              講座一覧を見る
            </Link>
            <Link
              href="/courses"
              className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg shadow-lg transition-colors border border-gray-200 dark:border-gray-700 text-lg"
            >
              今すぐ始める
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
