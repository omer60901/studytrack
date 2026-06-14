export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Geist", "Poppins", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 50px rgba(124, 58, 237, 0.22)"
      }
    }
  },
  plugins: []
};
