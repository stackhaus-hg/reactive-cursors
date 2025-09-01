// vanilla-extract styling file for Layout component

import { style } from "@vanilla-extract/css";

export const app = style({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  // backgroundColor: "#FFFFFF",
  backgroundColor: "#EEEEEE",
  fontFamily: "Montserrat, apple-system, sans-serif"  // Fonts imported through index.html
});

export const appContent = style({
  margin: "1rem 0",
  flex: "1" // Let all the flexible items be the same length, regardless of its content
})