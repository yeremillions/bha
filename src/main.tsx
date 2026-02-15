import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("Environment check - Paystack Key:", import.meta.env.VITE_PAYSTACK_PUBLIC_KEY);

createRoot(document.getElementById("root")!).render(<App />);
