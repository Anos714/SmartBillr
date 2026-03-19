import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/react";

const PublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PublishableKey) {
  throw new Error(
    "VITE_CLERK_PUBLISHABLE_KEY is not defined in the environment variables.",
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PublishableKey}>
      <App />
    </ClerkProvider>
  </StrictMode>,
);
