/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",   // warna background lembut (from-blue-50)
          100: "#e0e7ff",  // warna gradasi ringan
          200: "#c7d2fe",  // border halus (border-blue-200)
          500: "#6366f1",  // tombol utama (bg-blue-500)
          600: "#4f46e5",  // hover (bg-blue-600)
          800: "#312e81",  // teks utama (text-blue-800)
        },
        secondary: {
          500: "#22c55e",  // hijau utama (bg-green-500)
          600: "#16a34a",  // hover hijau (bg-green-600)
        },
        neutral: {
          50: "#f9fafb",   // latar lembut (bg-gray-50)
          100: "#f3f4f6",  // latar konten
          200: "#e5e7eb",  // border ringan
          600: "#4b5563",  // teks sekunder
          700: "#374151",  // teks utama
          800: "#1f2937",  // teks gelap
          900: "#111827",  // teks paling gelap
        },
      },
      fontFamily: {
        sans: ["Inter", "Nunito", "sans-serif"],
      },
      animation: {
        "pulse-fast": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
