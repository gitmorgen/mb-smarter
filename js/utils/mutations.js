/* IMPORT */
import { _G } from "../_G.js";
import { elementsInfo } from "./elementsinfo.js";

/* DECLARATIONS */
function handleMutation(mutationsList) {
  const activeTab = _G.getActiveTab();
  for (let mutation of mutationsList) {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          // Ensure it's an element
          // console.log("captured a node.", node);
          Object.values(elementsInfo).forEach((elementInfo) => {
            if (
              (elementInfo.tab && activeTab === elementInfo.tab) ||
              !elementInfo.tab
            ) {
              if (node.matches(elementInfo.selector)) {
                // First try to see if the element itself matches
                elementInfo.inject(node);
              } else {
                // If there is no match, perform querySelector on the element
                let targetElement = node.querySelector(elementInfo.selector);
                if (targetElement) {
                  elementInfo.inject(targetElement);
                  // } else {
                  //   console.log("missed");
                }
              }
            }
          });
        }
      });
    }
    // if (mutation.type === "attributes") {
    //   if (
    //     mutation.target.id === "target-id" &&
    //     mutation.attributeName === "class"
    //   ) {
    //     console.log("Target element's class changed:", mutation.target);
    //   }
    // }
  }
}

// Set up the MutationObserver
const observer = new MutationObserver(handleMutation);

/* EXPORT */
export { observer };
