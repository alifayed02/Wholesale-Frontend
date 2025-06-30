# Urban Unity Frontend

A modern, modular SaaS sales dashboard inspired by 21st.dev, Linear, and Framer. Built with React, TypeScript, and Tailwind CSS, this project features a pixel-perfect, bento-style layout, a robust design system, and is ready for real-time data integration from Google Sheets.

---

## ✨ Features
- **Premium, Figma-accurate UI** with bento/boxed layout
- **Design system**: tokenized colors, spacing, typography, and reusable UI primitives (`Button`, `Input`, `Card`, etc.)
- **Dashboard, SDR Sales, and Closer Sales** pages with charts, tables, and metrics
- **Date range picker** with custom styling
- **Ready for backend integration** (Node.js/Python API for Google Sheets)
- **Dark mode** and responsive design

---

## 🛠 Tech Stack
- **React** + **TypeScript**
- **Tailwind CSS** (with custom tokens)
- **Recharts** (charts)
- **react-day-picker** (date picker)
- **react-query** (data fetching, ready for live metrics)
- **Vite** (build tool)

---

## 🚀 Getting Started

1. **Clone the repo:**
   ```sh
   git clone https://github.com/your-username/Scaling-Society-Frontend.git
   cd Scaling-Society-Frontend
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```
3. **Start the dev server:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```
4. **Open in your browser:**
   Visit [http://localhost:5173](http://localhost:5173)

---

## 🎨 Design System
- All colors, spacing, and typography are defined in [`src/theme.ts`](src/theme.ts)
- UI primitives in [`src/components/ui/`](src/components/ui/)
- See [`src/docs/Primitives.md`](src/docs/Primitives.md) for usage and examples
- Extend the system by adding new tokens and components as needed

---

## 📊 Data Integration
- The app is ready to connect to a backend API (Node.js or Python) that fetches data from Google Sheets
- Use the `useGoogleSheetsData` hook as a pattern for data fetching
- All metrics, charts, and tables are prop-driven and ready for live data

---

## 🧑‍💻 Contributing
1. Fork the repo and create your feature branch (`git checkout -b feature/your-feature`)
2. Commit your changes (`git commit -am 'Add new feature'`)
3. Push to the branch (`git push origin feature/your-feature`)
4. Open a Pull Request

---

## 📄 License
[MIT](LICENSE)

---

## 🙏 Credits
- Inspired by [21st.dev](https://21st.dev), [Linear](https://linear.app), and [Framer](https://framer.com)
- Built with love by the Urban Unity team
