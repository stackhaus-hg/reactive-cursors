// vanilla-extract themes file

import { createGlobalTheme } from "@vanilla-extract/css";

// Root variables. Note that this is tied to the DOM so we do not want to make changes to this
export const root = createGlobalTheme(":root", {
  // Semantic tokens
  
});


// Making a copy of the root variables that we can work with
export const vars = {...root};  // The ... (spread) operator splits iterables into individual elements
