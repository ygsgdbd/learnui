import * as LearnUI from "@learnui/web";
import { Card, Divider, Spinner } from "@learnui/web";
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
      <Card.Root variant="elevated" className="learnui-consumer-card-override">
        <Card.Header><Card.Title>Consumer Card</Card.Title><Card.Description>Tarball composition</Card.Description></Card.Header>
        <Card.Body><p>Consumer body</p></Card.Body><Card.Footer><p>Consumer footer</p></Card.Footer>
      </Card.Root>
      <span className="learnui-consumer-control">Branded control</span>
      <div className="learnui-consumer-divider-stack">
        <span>Default Divider</span>
        <Divider />
        <span>Consumer override</span>
        <Divider className="learnui-consumer-divider-override" />
      </div>
      <div aria-busy="true" className="learnui-consumer-spinner-stack">
        <span>Standalone Spinner</span>
        <Spinner label="Loading fixture" />
        <span>Decorative consumer override</span>
        <Spinner className="learnui-consumer-spinner-override" isDecorative />
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
