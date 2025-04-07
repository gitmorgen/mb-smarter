/* IMPORT */
import {
  stringToJson,
  jsonToString,
  getFormDatasFromData,
  getDataFromUserId,
} from "../utils/mbsmart.js";
import { _G } from "../_G.js";
import { toggleWarningBox } from "./warningBox.js";

/* DECLARATIONS */
const applyProfile = document.createElement("div");
applyProfile.className = "mbs--middleelement";
applyProfile.id = "mbs-applyprofile";

const version = document.createElement("h2");
version.innerText = "Super Admin v0.0.1 -- Early testing. Expect bugs.";
version.className = "mbs--version";

const getButton = document.createElement("button");
getButton.className = "mbs--copybutton mbs--bluecopy";
getButton.innerText = "🔗 Copy Full Profile";
getButton.style.marginRight = "15px";
getButton.style.padding = "8px 15px";
getButton.style.flex = "0";
getButton.style.whiteSpace = "nowrap";
getButton.style.zIndex = "4000";
getButton.style.position = "relative";

const getButtonLabel = document.createElement("p");
getButtonLabel.className = "mbs--copiedlabel";
getButtonLabel.textContent = "Copied to clipboard!";
getButtonLabel.style.transition = "all 0.5s ease";
getButtonLabel.classList.add("hidden");

const getButtonCover = document.createElement("div");
getButtonCover.className = "mbs--cover";
getButtonCover.style.position = "absolute";
getButtonCover.style.top = "0";
getButtonCover.style.left = "0";
getButtonCover.style.width = "100%";
getButtonCover.style.height = "100%";
getButtonCover.style.transition = "all 0.25s ease";
getButtonCover.style.zIndex = "3999";
getButtonCover.style.backgroundColor =
  "color-mix(in srgb, var(--blue), transparent 100%)";
getButtonCover.style.pointerEvents = "none";
document.querySelector("body").append(getButtonCover);

function toggleCoverVisibility(isVisible = null) {
  if (isVisible === null) {
    getButtonLabel.classList.add("hidden");
    getButtonCover.style.backgroundColor =
      "color-mix(in srgb, var(--blue), transparent 100%)";
  } else if (typeof isVisible === "boolean") {
    if (isVisible) {
      getButtonLabel.classList.remove("hidden");
      getButtonCover.style.backgroundColor =
        "color-mix(in srgb, var(--blue), transparent 50%)";
    } else {
      getButtonLabel.classList.add("hidden");
      getButtonCover.style.backgroundColor =
        "color-mix(in srgb, var(--blue), transparent 100%)";
    }
  } else {
    console.error("Parameter must be a boolean or null.");
  }
}

const form = document.createElement("form");
form.style.display = "flex";
form.style.flex = "1";

const input = document.createElement("input");
input.type = "text";
input.className = "mbs--input";
input.placeholder = "Enter Profile E.g. ///Ka890d...";
input.style.flex = "1";
form.append(input);

const submitButton = document.createElement("button");
submitButton.type = "submit";
submitButton.className = "mbs--button mbs--purple";
submitButton.innerText = "-->";
submitButton.style.marginLeft = "5px";
submitButton.style.flex = "0";
submitButton.style.whiteSpace = "nowrap";
form.append(submitButton);

const div1 = document.createElement("div");
div1.style.display = "flex";
div1.append(getButton, form);

applyProfile.append(version, div1, getButtonLabel);

/* EVENTS */
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the default form submission behavior
  const inputText = input.value;
  submitButton.innerText = "fetching...";
  const { json, success } = stringToJson(inputText);
  let fetchThese;
  if (success) {
    const { returnedFormDatasWithTabs } = await getFormDatasFromData(
      json,
      _G.getUserId()
    );
    fetchThese = returnedFormDatasWithTabs;
  } else {
    fetchThese = [];
  }
  submitButton.innerText = "-->";
  console.log("These are to be fetched:", fetchThese);
  toggleWarningBox(true, fetchThese);
});
const ignoreTheseTabs = ["apps", "info"];
getButton.addEventListener("click", async () => {
  getButton.textContent = "🔗 " + "fetching" + "...";
  const userid = _G.getUserId();
  const { activeTab, otherTabs } = _G.getCurrentTabs();
  const allTabs = [activeTab, ...otherTabs]
    .map((tab) => {
      return {
        name: tab,
      };
    })
    .filter((tab) => !ignoreTheseTabs.includes(tab.name));
  let data = await getDataFromUserId(allTabs, userid);
  data = jsonToString(data);
  if (typeof data === "string") {
    data = "///" + data;
  } else {
    console.error("Data must be a string.");
  }
  _G.copyToClipboard(data, function () {
    getButton.textContent = "🔗 Copy Full Profile";
    toggleCoverVisibility(true);
    setTimeout(() => {
      toggleCoverVisibility(false);
    }, 3000);
  });
});

/* STARTUP */

/* EXPORT */
export { applyProfile };
