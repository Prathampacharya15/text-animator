import { useEffect, useRef } from "react";

export function useLetters(text, canvasRef,font = "Arial") {
  const lettersRef = useRef([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = `60px "${font}", sans-serif`;
    ctx.fillStyle = "#00ffcc";
    ctx.textBaseline = "top";

    const words = text.split(" ");
    const letters = [];
    const maxWidth = ctx.canvas.width - 100;
    let x = 50;
    let y = 20;

    words.forEach((word) => {
      const wordWidth = ctx.measureText(word + " ").width;
      if (x + wordWidth > maxWidth) {
        x = 50;
        y += 100;
      }

      word.split("").forEach((char) => {
        letters.push({ char, x, y, rot: 0, scale: 1, opacity: 1 });
        x += ctx.measureText(char).width;
      });

      x += ctx.measureText(" ").width; // space between words
    });

    lettersRef.current = letters;
  }, [text, canvasRef,font]);

  return lettersRef;
}
