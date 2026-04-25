import * as genai from "@google/genai";
const keys = Object.keys(genai);
console.log("Keys containing Google:", keys.filter(k => k.toLowerCase().includes("google")));
console.log("Keys containing GenAI:", keys.filter(k => k.toLowerCase().includes("genai")));
console.log("Keys containing Generative:", keys.filter(k => k.toLowerCase().includes("generative")));
