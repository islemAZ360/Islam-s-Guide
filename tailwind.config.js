/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./views/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // هنا يمكننا إضافة ألوان مخصصة أو خطوط إذا رغبنا في المستقبل
      // حالياً نعتمد على ألوان Tailwind الافتراضية (Slate, Indigo, Rose, etc.)
    },
  },
  plugins: [],
}