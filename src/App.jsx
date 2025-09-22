import React, { useState } from "react";
import TextScene from "./components/TextScene";


export default function App() {
  const [text, setText] = useState("Hello");
  const [animation, setAnimation] = useState("FlyIn");
  const [trigger, setTrigger] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#111", color: "#00ffcc" }}>
      {/* Controls */}
      <div style={{ padding: 10, display: "flex", gap: 10, alignItems: "center" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text (press Enter for new line)"
          style={{ fontSize: 16, padding: 5, width: 300, height: 80 }}
        />
        <select
          value={animation}
          onChange={(e) => setAnimation(e.target.value)}
          style={{ fontSize: 16, padding: 5 }}
        >
          <option value="FlyIn">Fly In</option>
          <option value="Bounce">Bounce</option>
          <option value="Rotate">Rotate</option>
          <option value="Fade">Fade</option>
          <option value="Scale">Scale</option>
          <option value="WaveFromLeft">Wave</option>
          <option value="Scramble">Scramble</option>
          <option value="LetterFlip">Letter Flip</option>
          <option value="Collision">Collision</option>
          <option value="MaskedLines">Masked Lines</option>
          <option value="SplitTextEffect">Revert</option>
        </select>
        <button
          onClick={() => setTrigger((t) => t + 1)}
          style={{ fontSize: 16, padding: "5px 10px", cursor: "pointer" }}
        >
          Apply
        </button>
      </div>

      {/* 3D Text Canvas */}
      <div style={{ flex: 1, minHeight: 500 }}>
        <TextScene text={text} animation={animation} trigger={trigger} />
      </div>
    </div>
  );
}
