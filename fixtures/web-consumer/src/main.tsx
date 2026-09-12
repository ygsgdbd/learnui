import * as LearnUI from "@learnui/web";
import { Button, Divider, Spinner } from "@learnui/web";
import "@learnui/web/styles";
import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import "./app.css";

function App() {
  const [count, setCount] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <main
      className="learnui-consumer-smoke"
      data-learnui-export-count={Object.keys(LearnUI).length}
    >
      <span>LearnUI web consumer smoke</span>
      <section aria-label="Button consumer">
        <Button ref={buttonRef} onPress={() => setCount(count + 1)}>Save fixture</Button>
        <output aria-label="Press count">{count}</output>
        <Button isPending>Pending fixture</Button>
        <Button isDisabled>Disabled fixture</Button>
        <Button aria-label="Add fixture">+</Button>
        <Button className="learnui-consumer-button-override" variant="outline" size="lg">Override fixture</Button>
      </section>
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
