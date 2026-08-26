import * as LearnUI from "@learnui/web";
import "@learnui/web/styles";
import React from "react";
import { createRoot } from "react-dom/client";

import "./app.css";

function App() {
  return (
    <main
      className="learnui-consumer-smoke"
      data-learnui-export-count={Object.keys(LearnUI).length}
    >
      <span>LearnUI web consumer smoke</span>
      <span className="learnui-consumer-control">Branded control</span>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
