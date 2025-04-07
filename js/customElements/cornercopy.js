/* IMPORT */
import { getDataFromUserId, jsonToString } from "../utils/mbsmart.js";
import { _G } from "../_G.js";

/* DECLARATIONS */
class cornercopy {
  constructor(dataType) {
    // Create data (the long encoded string)
    this.data = "///" + "copy"; // default value is "copy"; this will be replaced with the actual data string

    // Create assignment (the type of data)
    this.dataType = dataType;
    console.log(`Assigned corner copy to the dataType: ${dataType}.`);

    // Create a container div
    this.container = document.createElement("div");
    this.container.className = "mbs mbs--cornercopy";

    // Create a button
    this.button = document.createElement("button");
    this.button.className = "mbs--copybutton mbs--bluecopy";
    this.button.textContent = "🔗 " + this.data.slice(0, 9) + "...";

    // Create a cover for the container
    this.cover = document.createElement("div");
    this.cover.className = "mbs--cover";
    this.cover.style.position = "absolute";
    this.cover.style.top = "0";
    this.cover.style.left = "0";
    this.cover.style.width = "100%";
    this.cover.style.height = "100%";
    this.cover.style.borderRadius = "12px";
    this.cover.style.transition = "all 0.25s ease";
    this.cover.style.backgroundColor =
      "color-mix(in srgb, var(--blue), transparent 100%)";
    this.cover.style.pointerEvents = "none";

    // Create a copied label
    this.label = document.createElement("p");
    this.label.className = "mbs--copiedlabel";
    this.label.textContent = "Copied to clipboard!";
    this.label.style.transition = "all 0.5s ease";
    this.label.classList.add("hidden");

    // Append children
    this.container.append(this.cover, this.label, this.button);

    // Add click event listener to the button
    this.button.addEventListener("click", async () => {
      this.button.textContent = "🔗 " + "fetching" + "...";
      const userid = _G.getUserId();
      const data = await getDataFromUserId(
        [
          {
            name: ccSelectors[this.dataType].tab,
            selector: ccSelectors[this.dataType].selector,
          },
        ],
        userid
      );
      console.log(data);
      this.updateData(data);
      _G.copyToClipboard(this.data);
      this.toggleCoverVisibility(true);
      setTimeout(() => {
        this.toggleCoverVisibility(false);
      }, 3000);
    });
  }

  // Method to change the data
  updateData(data) {
    data = jsonToString(data);
    this.data = "///" + data;
    this.button.textContent = "🔗 " + this.data.slice(0, 9) + "...";
  }
  // Method to append the element to the DOM
  appendTo(parent) {
    if (parent instanceof HTMLElement) {
      parent.appendChild(this.container);
    } else {
      console.error("Parent must be a valid HTMLElement.");
    }
  }
  // Method to toggle the cover's visibility
  toggleCoverVisibility(isVisible = null) {
    if (isVisible === null) {
      this.label.classList.add("hidden");
      this.cover.style.backgroundColor =
        "color-mix(in srgb, var(--blue), transparent 100%)";
    } else if (typeof isVisible === "boolean") {
      if (isVisible) {
        this.label.classList.remove("hidden");
        this.cover.style.backgroundColor =
          "color-mix(in srgb, var(--blue), transparent 50%)";
      } else {
        this.label.classList.add("hidden");
        this.cover.style.backgroundColor =
          "color-mix(in srgb, var(--blue), transparent 100%)";
      }
    } else {
      console.error("Parameter must be a boolean or null.");
    }
  }
}
const ccSelectors = {
  // corner copy selectors
  url1: {
    tab: "url",
    selector: "#main > div:nth-child(3n of div):has(#urladd)",
  },
  url2: {
    tab: "url",
    selector: "#main > div:nth-child(4n of div):has(#customershalf)",
  },
  cats1: {
    tab: "cats",
    selector: "#main > div:nth-child(3n of div):has(#customers)",
  },
  cats2: {
    tab: "cats",
    selector: "#main > div:nth-child(4n of div) > div.bubswi:nth-child(1)",
  },
  cats3: {
    tab: "cats",
    selector: "#main > div:nth-child(4n of div) > div.bubswi:nth-child(2)",
  },
  features1: {
    tab: "features",
    selector: "#main > div.bubble2:nth-child(3n of div)",
  },
  restrictions1: {
    tab: "rest",
    selector: "#main > div:nth-child(3n of div)",
  },
  specialconf1: {
    tab: "conf",
    selector: "#main > table:nth-child(1n of table)",
  },
  main1: {
    tab: "main",
    selector: "#main > div:nth-child(3n of div):has(span#changenotes)",
  },
  extension1: {
    tab: "extension",
    selector: "#main > div.bubswi:nth-child(3n of div)",
  },
  sapps1: {
    tab: "sapps",
    selector: "#main > table:nth-child(1n of table)",
  },
  // apps1: {
  //   tab: "apps",
  //   selector: "#main > table#customers",
  // },
};

/* EVENTS */

/* STARTUP */

/* EXPORT */
export { cornercopy, ccSelectors };
