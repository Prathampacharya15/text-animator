
// // components/TextScene.jsx
// import React, { useEffect } from "react";
// import { useThreeScene } from "../hooks/useThreeScene";
// import { useLetters } from "../hooks//useLetters";
// import { animateLetters } from "../animations/animations";

// export default function TextScene({ text, animation, trigger,font}) {
//   const { mountRef, canvasRef, textureRef } = useThreeScene();
//   const lettersRef = useLetters(text, canvasRef,font);

//   // --- Redraw function ---
//   const redraw = () => {
//     if (!canvasRef.current || !textureRef.current) return;
//     const ctx = canvasRef.current;
//     const texture = textureRef.current;

//     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//     ctx.font = `60px "${font}", sans-serif`;
//     ctx.fillStyle = "#00ffcc";
//     ctx.textBaseline = "top";

//     lettersRef.current.forEach((letter) => {
//       ctx.save();
//       ctx.globalAlpha = letter.opacity ?? 1;
//       ctx.translate(letter.x + 10, letter.y + 40);
//       ctx.rotate(letter.rot || 0);
//       ctx.scale(letter.scale ?? 1, letter.scale ?? 1);
//       ctx.fillText(letter.char, 0, 0);
//       ctx.restore();
//     });

//     texture.needsUpdate = true;
//   };

//   // --- Animate letters when animation changes or trigger is pressed ---
//   useEffect(() => {
//     if (!lettersRef.current.length) return;

    
//     lettersRef.current.forEach((letter) => {
//       letter.rot = 0;
//       letter.scale = 1;
//       letter.opacity = 1;
//     });
//     redraw();

//     const anims = animateLetters(lettersRef.current, animation, redraw);

//     return () => anims.forEach((a) => a.kill?.());
//   }, [text, trigger]);

//   return (
//     <div
//       ref={mountRef}
//       style={{ width: "100%", height: "100vh", background: "#111" }}
//     />
//   );
// }

// components/TextScene.jsx
import React, { useEffect } from "react";
import { useThreeScene } from "../hooks/useThreeScene";
import { useLetters } from "../hooks/useLetters";
import { animateLetters } from "../animations/animations";
import gsap from "gsap";

export default function TextScene({
  text,
  animation,
  trigger,
  font,
  onComplete,
  fadeDuration = 0.5
}) {
  const { mountRef, canvasRef, textureRef } = useThreeScene();
  const lettersRef = useLetters(text, canvasRef, font);

  // --- Redraw function ---
  const redraw = () => {
    if (!canvasRef.current || !textureRef.current) return;
    const ctx = canvasRef.current;
    const texture = textureRef.current;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = `60px "${font}", sans-serif`;
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";

    lettersRef.current.forEach((letter) => {
      ctx.save();
      ctx.globalAlpha = letter.opacity ?? 1;
      ctx.translate(letter.x + 10, letter.y + 40);
      ctx.rotate(letter.rot || 0);
      ctx.scale(letter.scale ?? 1, letter.scale ?? 1);
      ctx.fillText(letter.char, 0, 0);
      ctx.restore();
    });

    texture.needsUpdate = true;
  };

  // --- Animate letters when animation, font, or trigger changes ---
  useEffect(() => {
    if (!lettersRef.current.length) return;

    // Reset letters
    lettersRef.current.forEach((letter) => {
      letter.rot = 0;
      letter.scale = 1;
      letter.opacity = 1;
    });
    redraw();

    // Animate letters
    const anims = animateLetters(lettersRef.current, animation, redraw);

    // Handle completion with fade-out
    if (anims.length && anims[anims.length - 1].eventCallback) {
      anims[anims.length - 1].eventCallback("onComplete", () => {
        if (lettersRef.current.length && fadeDuration > 0) {
          const tl = gsap.timeline({ onComplete: onComplete });

          lettersRef.current.forEach((letter, i) => {
            tl.to(letter, { opacity: 0, duration: fadeDuration, onUpdate: redraw }, i * 0.02);
          });
        } else {
          if (onComplete) onComplete();
        }
      });
    }

    return () => anims.forEach((a) => a.kill?.());
  }, [text, animation, trigger, font]);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100vh", background: "#111" }}
    />
  );
}
