// import React, { useState, useEffect } from "react";
// import TextScene from "./components/TextScene";

// export default function App() {
//   const [text, setText] = useState("Hello");
//   const [animation, setAnimation] = useState("FlyIn");
//   const [trigger, setTrigger] = useState(0);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [fonts, setFonts] = useState([]);
//   const [selectedFont, setSelectedFont] = useState("Arial");
//   const [textQueue,setTextQueue] = useState([])

//   useEffect(() => {
//     const loadFonts = async () => {
//       if (window.electronAPI?.getFonts) {
//         try {
//           const systemFonts = await window.electronAPI.getFonts(); 
//           setFonts(systemFonts);
//           if (systemFonts.length) setSelectedFont(systemFonts[0]);
//         } catch (err) {
//           console.error("Failed to load fonts:", err);
//           setFonts(["Arial", "Times New Roman", "Courier New"]); // fallback
//         }
//       } else {
//         setFonts(["Arial", "Times New Roman", "Courier New"]); // fallback
//       }
//     };

//     loadFonts();
//   }, []);

//   const handleFontChange = (e) => {
//     setSelectedFont(e.target.value);
//     setTrigger((t) => t + 1); // re-trigger text update
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         height: "100vh",
//         background: "#111",
//         color: "#00ffcc",
//       }}
//     >
//       {/* Controls */}
//       <div
//         style={{
//           padding: 10,
//           display: "flex",
//           gap: 10,
//           alignItems: "center",
//         }}
//       >
//         <textarea
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Enter text"
//           style={{ fontSize: 16, padding: 5, width: 300, height: 80 }}
//         />

//         <select
//           value={animation}
//           onChange={(e) => setAnimation(e.target.value)}
//           style={{ fontSize: 16, padding: 5 }}
//         >
//           <option value="FlyIn">Fly In</option>
//           <option value="Bounce">Bounce</option>
//           <option value="Rotate">Rotate</option>
//           <option value="Fade">Fade</option>
//           <option value="Scale">Scale</option>
//           <option value="WaveFromLeft">Wave</option>
//           <option value="Scramble">Scramble</option>
//           <option value="LetterFlip">Letter Flip</option>
//           <option value="Collision">Collision</option>
//           <option value="MaskedLines">Masked Lines</option>
//           <option value="SplitTextEffect">Revert</option>
//         </select>

//         {/* Font selector */}
//         <select
//           value={selectedFont}
//           onChange={handleFontChange}
//           style={{ fontSize: 16, padding: 5 }}
//         >
//           {fonts.map((f, i) => (
//             <option key={i} value={f}>
//               {f}
//             </option>
//           ))}
//         </select>

//         <button
//           onClick={() => setTrigger((t) => t + 1)}
//           style={{ fontSize: 16, padding: "5px 10px", cursor: "pointer" }}
//         >
//           Apply
//         </button>
//       </div>

//       {/* 3D Text Canvas */}
//       <div style={{ flex: 1, minHeight: 500 }}>
//         <TextScene
//           text={text}
//           animation={animation}
//           trigger={trigger}
//           font={selectedFont}
//         />
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect, useRef } from "react";
import * as dat from "dat.gui";
import TextScene from "./components/TextScene";

export default function App() {
  const [fonts, setFonts] = useState([]);
  const [textQueue, setTextQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Scene state
  const [text, setText] = useState("Hello Frames");
  const [animation, setAnimation] = useState("FlyIn");
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [trigger, setTrigger] = useState(0);

  // GUI & controls
  const guiRef = useRef(null);
  const controlsRef = useRef({
    text: "Hello Frames",
    animation: "FlyIn",
    font: "Arial",
    selectedQueueId: "",
    addToQueue: () => {
      const id = Date.now();
      const entry = {
        id,
        text: controlsRef.current.text,
        animation: controlsRef.current.animation,
        font: controlsRef.current.font,
      };
      setTextQueue((prev) => [...prev, entry]);
      controlsRef.current.selectedQueueId = id; // auto-select newly added
    },
    playQueue: () => setCurrentIndex(0),
  });

  // Load system fonts
  useEffect(() => {
    const loadFonts = async () => {
      if (window.electronAPI?.getFonts) {
        try {
          const systemFonts = await window.electronAPI.getFonts();
          setFonts(systemFonts);
          if (systemFonts.length) setSelectedFont(systemFonts[0]);
        } catch {
          setFonts(["Arial", "Times New Roman", "Courier New"]);
        }
      } else {
        setFonts(["Arial", "Times New Roman", "Courier New"]);
      }
    };
    loadFonts();
  }, []);

  // Setup dat.GUI
  useEffect(() => {
    if (!fonts.length || guiRef.current) return;

    const gui = new dat.GUI();
    guiRef.current = gui;

    gui.add(controlsRef.current, "text").name("Text");
    gui
      .add(controlsRef.current, "animation", [
        "FlyIn",
        "Bounce",
        "Rotate",
        "Fade",
        "Scale",
        "WaveFromLeft",
        "Scramble",
        "LetterFlip",
        "Collision",
        "MaskedLines",
        "SplitTextEffect",
      ])
      .name("Animation");
    gui.add(controlsRef.current, "font", fonts).name("Font");
    gui.add(controlsRef.current, "addToQueue").name("➕ Add To Queue");
    gui.add(controlsRef.current, "playQueue").name("▶️ Play Queue");
  }, [fonts]);

  // Queue selection dropdown in dat.GUI
  useEffect(() => {
    if (!guiRef.current) return;

    // Remove previous controller
    if (controlsRef.current.queueController) {
      guiRef.current.remove(controlsRef.current.queueController);
    }

    const options = {};
    textQueue.forEach((entry) => {
      options[entry.text.substring(0, 20)] = entry.id;
    });

    if (Object.keys(options).length) {
      controlsRef.current.queueController = guiRef.current
        .add(controlsRef.current, "selectedQueueId", options)
        .name("Select Text")
        .onChange((id) => {
          const selectedEntry = textQueue.find((e) => e.id === id);
          if (!selectedEntry) return;

          // Update scene immediately
          setText(selectedEntry.text);
          setAnimation(selectedEntry.animation);
          setSelectedFont(selectedEntry.font);
          setTrigger((t) => t + 1);
        });
    }
  }, [textQueue]);

  // Play queue automatically
  useEffect(() => {
    if (currentIndex >= textQueue.length) return;

    const { text, animation, font } = textQueue[currentIndex];
    setText(text);
    setAnimation(animation);
    setSelectedFont(font);
    setTrigger((t) => t + 1);
  }, [currentIndex, textQueue]);

  return (
    <div style={{ width: "100%", height: "100vh", background: "#111" }}>
      <TextScene
        text={text}
        animation={animation}
        trigger={trigger}
        font={selectedFont}
        onComplete={() => setCurrentIndex((i) => i + 1)}
      />
    </div>
  );
}
