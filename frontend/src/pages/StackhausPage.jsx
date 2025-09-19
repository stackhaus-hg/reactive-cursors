import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function StackhausPage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? "bg-[#00155B] text-white min-h-screen" : "bg-white text-gray-900 min-h-screen"}>
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-400 dark:border-gray-300">
        <h1 className="text-[28px] font-bold text-[#1B4E8F]">Stackhaus</h1>
        <nav className="flex items-center gap-6">
          <a href="/" className="text-[16px] hover:underline">Home</a>
          <a href="/doco" className="text-[16px] hover:underline">Docs</a>
          <a href="#" className="text-[16px] hover:underline">GitHub</a>
          <a href="#" className="text-[16px] hover:underline">Installation</a>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>
      </header>

      {/* Main */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 px-12 py-16 items-center">
        {/* Left */}
        <div>
          <h1 className="text-[35px] font-bold mb-6 text-gray-900 dark:text-white">Reactive Cursors</h1>
          <div className="flex gap-4">
            <a href="#" className="bg-[#1B4E8F] text-white px-5 py-2 rounded-lg text-[16px]">Installation</a>
            <a href="#" className="bg-[#1B4E8F] text-white px-5 py-2 rounded-lg text-[16px]">Docs</a>
            <a href="#" className="bg-[#1B4E8F] text-white px-5 py-2 rounded-lg text-[16px]">GitHub</a>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <section>
            <h2 className="text-[28px] font-semibold mb-2 text-gray-900 dark:text-white">About Us</h2>
            <p className="text-[16px] text-gray-600 dark:text-gray-300">
              Stackhaus presents Reactive Cursors — a package for adding real-time, collaborative cursors to any web application.
            </p>
          </section>

          <section>
            <h3 className="text-[24px] font-semibold mb-2 text-gray-900 dark:text-white">Installation</h3>
            <pre className="bg-gray-100 dark:bg-slate-800 p-3 rounded-lg text-[14px] text-gray-800 dark:text-gray-200">
              npm install reactive-cursors
            </pre>
          </section>

          <section>
            <h4 className="text-[20px] font-semibold mb-2 text-gray-900 dark:text-white">Cursor Preview</h4>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-[#1B4E8F] rounded-full"></div>
              <div className="w-6 h-6 bg-red-500 rounded-full"></div>
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 text-center border-t border-gray-400 dark:border-gray-300">
        <p className="text-[14px] text-gray-600 dark:text-gray-300">
          © {new Date().getFullYear()} Stackhaus. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
