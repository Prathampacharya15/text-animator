// import { useEffect, useRef } from "react";

// export function useLetters(text, canvasRef) {
//   const lettersRef = useRef([]);

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const ctx = canvasRef.current;
//     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//     ctx.font = "60px 'Tangerine', cursive";
//     ctx.fillStyle = "#00ffcc";
//     ctx.textBaseline = "top";

//     const words = text.split(" ");
//     const letters = [];
//     const maxWidth = ctx.canvas.width - 100;
//     let x = 50;
//     let y = 20;

//     words.forEach((word) => {
//       const wordWidth = ctx.measureText(word + " ").width;
//       if (x + wordWidth > maxWidth) {
//         x = 50;
//         y += 100;
//       }

//       word.split("").forEach((char) => {
//         letters.push({ char, x, y, rot: 0, scale: 1, opacity: 1 });
//         x += ctx.measureText(char).width;
//       });

//       x += ctx.measureText(" ").width; // space between words
//     });

//     lettersRef.current = letters;
//   }, [text, canvasRef]);

//   return lettersRef;
// }

import { useEffect, useRef } from "react";

export function useLetters(text, canvasRef) {
  const lettersRef = useRef([]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "60px 'Tangerine', cursive";
    ctx.fillStyle = "#00ffcc";
    ctx.textBaseline = "top";

    const lines = text.split("\n"); // split by Enter key
    const letters = [];
    const maxWidth = ctx.canvas.width - 100;
    const lineHeight = 50; // distance between lines
    let startX = 50;

    let y = 20; // initial y position

    lines.forEach((line) => {
      let x = startX;
      const words = line.split(" ");
      words.forEach((word, wIndex) => {
        word.split("").forEach((char) => {
          letters.push({ char, x, y, rot: 0, scale: 1, opacity: 1 });
          x += ctx.measureText(char).width;
        });
        // add space after word
        x += ctx.measureText(" ").width;
      });
      y += lineHeight; // move to next line after Enter
    });

    lettersRef.current = letters;
  }, [text, canvasRef]);

  return lettersRef;
}
