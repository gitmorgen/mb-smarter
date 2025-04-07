/* IMPORT */
import { _G } from "../_G.js";
import {
  toggleProgressDisplayer,
  updateProgressDisplayer,
  toggleWarningBox,
} from "../customElements/warningBox.js";
import lzjs from "./lzjs.js";

/* DECLARATIONS */
const commandFromDropdownText = {
  "Extension Excluded": "fullyOpenExtensionExcluded",
  "Fully Open": "fullyOpen",
  "MB Filter Only": "mbFilterOnly",
  "Vpn/Browser No Images": "vpnBrowserNoImages",
  Blocked: "block",
  Remove: "remove",
};
const commCodes = {
  // Define command codes for bulk modify
  fullyOpen: 14,
  fullyOpenExtensionExcluded: 14,
  vpnBrowserNoImages: 15,
  block: 30,
  remove: 16,
  mbFilterOnly: 15,
};

function jsonToString(json) {
  // Convert JSON object to string
  const jsonString = JSON.stringify(json);

  // Perform nondestructive compression
  const compressed = lzjs.compressToBase64(jsonString);
  return compressed;
}
function stringToJson(compressedString) {
  const segments = compressedString
    .split("///")
    .filter((segment) => segment)
    .map((segment) => "///" + segment);
  let result = [];
  let success = true;

  segments.forEach((segment) => {
    try {
      segment = segment.slice(3); // slice to remove the "///"
      const decompressed = lzjs.decompressFromBase64(segment);
      const json = JSON.parse(decompressed); // Parse JSON string
      result = result.concat(json);
    } catch (error) {
      console.error("Error processing segment:", error);
      success = false;
    }
  });

  return { json: result, success };
}
function fetchUsingFormData(formData) {
  // Construct form params
  const formDataParams = new URLSearchParams();
  for (const [key, value] of Object.entries(formData)) {
    formDataParams.append(key, value);
  }
  // Return a promise that resolves with the HTML document
  return fetch(_G.fetchUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded", // Set content type to Form Data
    },
    body: formDataParams.toString(), // Send the form data as a URL-encoded string
  })
    .then((response) => response.text()) // Parse the HTML response
    .then((responseString) => {
      // const parser = new DOMParser();
      // const htmlDoc = parser.parseFromString(responseString, "text/html");
      return responseString;
    })
    .catch((error) => {
      console.error("Error:", error); // Handle any errors
      throw error; // Rethrow the error to be handled by the caller
    });
}
async function fetchFormDatas(formDatas) {
  toggleProgressDisplayer(true);
  let delay = 0;
  const results = [];
  for (let i = 0; i < formDatas.length; i++) {
    const formData = formDatas[i];
    setTimeout(async () => {
      try {
        updateProgressDisplayer(`(${i + 1}, ${formDatas.length})`);
        const responseString = await fetchUsingFormData(formData);
        results.push([formData, responseString]);
      } catch (error) {
        console.error("Error in fetch:", error);
        throw error;
      }
    }, delay);
    delay = delay + 50;
  }
  setTimeout(() => {
    updateProgressDisplayer("Refreshing...");
  }, delay);
  setTimeout(() => {
    toggleWarningBox(false);
    toggleProgressDisplayer(false);
    _G.softReload();
    const strangeOnes = results.filter(
      ([_, responseString]) => responseString !== "sent"
    );
    console.log("Potential errors:", strangeOnes);
  }, delay + 1000);
  return results;
}
const ignoreTheseDropdowns = [
  "Safari_Mode200", // url tab
  "addurl", // url tab
  "ppdisabled", // main tab
  "removedvcebutn", // main tab
  "levelsmultioption", // main tab
  "Enrollment_Lock1", // main tab
  "Kiwi block Extension Removal", // extension tab
  "upgradesub", // extension tab
];
const ignoreTheseSwitches = [
  "checkmove", // main tab
  "checkim", // main tab
  "checkoth", // main tab
  "On0main", // main tab
  "Open_Chrome_Whitelisted__Device_Owner_49main", // main tab
  "ios_18_password_removed2000", // extension tab
  "ios_18_password_not_removed2001", // extension tab
];
async function getDataFromUserId(tabs, userid, ignoreTemplate) {
  // ignoreTemplate is optional; it prevents template packing
  const returnedData = [];
  for (const tab of tabs) {
    // get the htmlDoc
    const { htmlDoc } = await _G.getHtmlDocFromUserId(userid, tab.name);
    console.log(tab, htmlDoc);
    const body = htmlDoc.querySelector("body");

    // set up data extraction containers
    const formDatas = [];
    const templateObject = {};

    // get bubbles
    const modifiedSelector = tab.selector ? tab.selector.slice(8) : undefined; // remove "#main >" from the beginning
    const bubbles = modifiedSelector
      ? [body.querySelector(modifiedSelector)]
      : Array.from(body.children).slice(2); // ignore the first 2 elements (header and tabs divs)
    bubbles.forEach((bubble) => {
      if (bubble) {
        // extract data from checkboxes/switches
        let switchElements = bubble.querySelectorAll("input[type='checkbox']");
        switchElements = Array.from(switchElements).filter(
          (d) => !ignoreTheseSwitches.includes(d.id)
        );
        switchElements.forEach((switchElement) => {
          const onchangeText =
            switchElement.getAttribute("onchange") ||
            switchElement.onchange.toString();

          // Regex to match objects starting with {mode: until their closing }
          const objectRegex = /\{mode:[^{}]*\}/g; // Matches {mode: followed by anything except { or } until }
          const objectMatches = onchangeText.match(objectRegex) || [];

          if (objectMatches) {
            const objects = objectMatches.map((match) =>
              eval("(" + match + ")")
            ); // Convert strings to JS objects
            let aa;
            if (objects[1]) {
              aa = switchElement.checked ? objects[0] : objects[1];
            } else {
              aa = objects[0];
            }
            aa["on"] = switchElement.checked;
            formDatas.push(aa);
          } else {
            console.log("No objects starting with {mode: found.");
          }
        });

        // extract data from dropdowns
        let dropdownElements = bubble.querySelectorAll(".dropdown");
        dropdownElements = Array.from(dropdownElements).filter(
          (d) => !ignoreTheseDropdowns.includes(d.querySelector("button").id)
        );
        dropdownElements.forEach((dropdown) => {
          const button = dropdown.querySelector("button");
          const links = dropdown.querySelectorAll("a");
          // console.log(button.innerText);
          let e = Array.from(links).find(
            (link) => link.innerText.trim() === button.innerText.trim()
          );
          if (e) {
            const onclickText =
              e.getAttribute("onclick") || e.onchange.toString();
            // Regex to match objects starting with {mode: until their closing }
            const objectRegex = /\{mode:[^{}]*\}/g; // Matches {mode: followed by anything except { or } until }
            const objectMatches = onclickText.match(objectRegex) || [];

            if (objectMatches) {
              const objects = objectMatches.map((match) =>
                eval("(" + match + ")")
              ); // Convert strings to JS objects
              formDatas.push(objects[0]);
            } else {
              console.log("No objects starting with {mode: found.");
            }
          }
        });
      }
    });
    if (formDatas[0]) {
      if (!ignoreTemplate) {
        // set redundant information aside in templateObject
        const keys = Object.keys(formDatas[0]);
        keys.forEach((key) => {
          const allSame = formDatas.every(
            (obj) => obj[key] === formDatas[0][key]
          );
          if (allSame) {
            templateObject[key] = formDatas[0][key];
            formDatas.forEach((obj) => delete obj[key]);
          }
        });
      }
      if (templateObject.uid) {
        templateObject.uid = "--userid--";
      }
      returnedData.push({
        tab: tab,
        template: templateObject,
        formDatas: formDatas,
      });
    }
  }
  return returnedData;
}
async function getFormDatasFromData(data, userid) {
  const returnedFormDatasWithTabs = [];
  await Promise.all(
    data.map(async (dataNugget, index) => {
      const formDatasAtTheEnd = [];
      const tab = dataNugget.tab;
      const formDatas = dataNugget.formDatas;
      const template = dataNugget.template;

      // make sure the tab is relevant
      const { activeTab, otherTabs } = _G.getCurrentTabs();
      const currentTabs = [activeTab, ...otherTabs];
      if (currentTabs.includes(tab.name)) {
        // repair userid in template
        Object.keys(template).forEach((key) => {
          if (template[key] === "--userid--") {
            template[key] = userid;
          }
        });

        // inject template values into all of the formDatas
        formDatas.forEach((formData) => {
          Object.keys(template).forEach((key) => {
            if (!formData.hasOwnProperty(key)) {
              formData[key] = template[key];
            }
          });
        });

        // get current form datas
        const currentData = await getDataFromUserId(
          [dataNugget.tab],
          _G.getUserId(),
          true
        );
        // filter out mismatching lists
        if (currentData[0]) {
          const currentFormDatas = currentData[0].formDatas;

          if (currentFormDatas.length === formDatas.length) {
            // filter out redundant formDatas
            const changedFormDatas = formDatas.filter(
              (formData) =>
                !currentFormDatas.some((currentFormData) =>
                  Object.keys(formData).every(
                    (key) => formData[key] === currentFormData[key]
                  )
                )
            );
            // console.log(
            //   tab,
            //   "NEW FORM DATAS:",
            //   formDatas,
            //   "CURRENT FORM DATAS:",
            //   currentFormDatas,
            //   "CHANGED FORM DATAS:",
            //   changedFormDatas
            // );

            // manage locked category switches by replacing them with unlock, and pushing the lock command to the end
            changedFormDatas.forEach((formData) => {
              if (formData.comm === "lockcat" && formData.on === true) {
                formDatasAtTheEnd.push({ ...formData });
                formData.on = false;
              }
            });

            // push them to the master list
            const returnedFormDatas = [
              ...changedFormDatas,
              ...formDatasAtTheEnd,
            ];
            if (returnedFormDatas.length > 0) {
              returnedFormDatasWithTabs.push([tab, returnedFormDatas]);
            } else {
              returnedFormDatasWithTabs.push([tab, "No changes detected."]);
            }
          } else {
            returnedFormDatasWithTabs.push([tab, "Mismatching list."]);
          }
        } else {
          returnedFormDatasWithTabs.push([tab, "Missing list."]);
        }
      } else {
        returnedFormDatasWithTabs.push([tab, "Missing tab."]);
      }
    })
  );
  return { returnedFormDatasWithTabs };
}

/* STARTUP */

/* EXPORT */
export {
  getFormDatasFromData,
  getDataFromUserId,
  jsonToString,
  stringToJson,
  fetchFormDatas,
  commCodes,
  commandFromDropdownText,
};
