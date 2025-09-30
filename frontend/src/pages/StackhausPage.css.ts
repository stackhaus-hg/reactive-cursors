// Vanilla Extract Styling file for Homepage StackhausPage.jsx

import { style } from "@vanilla-extract/css";

export const stackhauspage = style({
  // margin: "2rem",
  marginTop: "20px",
  // display: "grid",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
});

export const stackhauspageDemoDiv = style({
  marginTop: "20px",
  padding: "20px",
  display: "flex",
  flexDirection: "row",
  height: "200px",
  justifyContent: "center",
  
});

export const stackhauspageDemo = style({
  marginLeft: "10px",
  flexBasis: "300px",
  flexGrow: "0",
  flexShrink: "0",
  border: "solid"
});

export const stackhauspageH3 = style({
  marginTop: "30px",
  // paddingLeft: "20px",
  // paddingRight: "20px",
  textAlign: "center"
});
