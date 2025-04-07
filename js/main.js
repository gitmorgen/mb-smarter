/* IMPORT */
import { _G } from "./_G.js";
import { quickLinks } from "./customElements/quickLinks.js";
import { translation } from "./customElements/translation.js";
import { observer } from "./utils/mutations.js";

/* DECLARATIONS */

/* STARTUP */
document.querySelector("#sidemenu").append(quickLinks);
document.querySelector("#sidemenu").append(translation);

// Observe changes in the entire document body
observer.observe(document.body, {
  childList: true, // Detect added/removed nodes
  attributes: true, // Detect attribute changes
  subtree: true, // Monitor entire DOM
});
console.log("Observing DOM mutations...");
