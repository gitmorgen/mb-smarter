/* IMPORT */
import { _G } from "../_G.js";
import { commCodes, commandFromDropdownText } from "../utils/mbsmart.js";

/* DECLARATIONS */
// Define bulk modify components
const div1 = document.createElement("div");
div1.innerHTML = `
  <h2 class="mbs--title">Load URLs from Account</h2>
  <ul id="from-userid-buttons">
    <li><button id="import-fullyOpenExtensionExcluded" class="mbs--button mbs--blue">Fully Opened Extension Excluded</button></li>
    <li><button id="import-fullyOpen" class="mbs--button mbs--blue">Fully Opened</button></li>
    <li><button id="import-mbFilterOnly" class="mbs--button mbs--blue">MB Filtered Only</button></li>
    <li><button id="import-vpnBrowserNoImages" class="mbs--button mbs--blue">Vpn/Browser No Images</button></li>
    <li><button id="import-block" class="mbs--button mbs--blue">Blocked</button></li>
  </ul>
`;
const div2 = document.createElement("div");
div2.innerHTML = `
  <h2 class="mbs--title">Bulk Modify URLs</h2>
  <textarea id="website-list" rows="10" cols="30" placeholder="example.com\nexample.com\nexample.com\nexample.com"></textarea>
  <ul id="from-list-buttons">
    <li><button id="fullyOpenExtensionExcluded" class="mbs--button mbs--purple">Fully Open Extension Excluded</button></li>
    <li><button id="fullyOpen" class="mbs--button mbs--purple">Fully Open</button></li>
    <li><button id="mbFilterOnly" class="mbs--button mbs--purple">MB Filter Only</button></li>
    <li><button id="vpnBrowserNoImages" class="mbs--button mbs--purple">Vpn/Browser No Images</button></li>
    <li><button id="block" class="mbs--button mbs--purple">Block</button></li>
    <li><button id="remove" class="mbs--button mbs--purple">Remove</button></li>
  </ul>
`;

const urlsBulkModify = document.createElement("div");
urlsBulkModify.append(div1, div2);
urlsBulkModify.id = "mbs-urlbulkmodify";
urlsBulkModify.className = "mbs--middleelement";

const progressDisplayer = document.createElement("p");
urlsBulkModify.appendChild(progressDisplayer);

function modifyWebsiteException(
  manageThisUrl,
  MBextensionExcluded,
  userid,
  command
) {
  // Determine the right command code using commCodes object
  const comm = command ? commCodes[command] : commCodes.fullyOpen;
  // If the command is fullyOpenExtensionExcluded
  if (command === "fullyOpenExtensionExcluded") {
    MBextensionExcluded = true;
  }

  // Data to send in the POST request, structured as form data
  const formData = new URLSearchParams();
  formData.append("mode", 1);
  formData.append("uid", userid);
  formData.append("comm", comm);
  formData.append("num", 0);
  formData.append(
    "dat",
    MBextensionExcluded ? "&" + manageThisUrl : manageThisUrl
  );
  formData.append("date", Date.now());

  _G.fetch(formData);
}
async function getWebsiteExceptionsFromUserId(userid) {
  const { htmlDoc } = await _G.getHtmlDocFromUserId(userid, "url");
  const tbody = htmlDoc.querySelector("tbody");
  const tds = tbody.querySelectorAll("tr:not(:first-child) td:first-child");
  const dropdowns = tbody.querySelectorAll(".dropdown button");

  // Interate over the dropdown buttons and return an array of their text content
  const commandList = Array.from(dropdowns).map(
    (dropdown) => commandFromDropdownText[dropdown.innerText]
  );
  // Iterate over the tds and return an array of their text content
  const websiteList = Array.from(tds).map((td) => td.textContent.trim());

  return { websiteList, commandList };
}
function doBulkModifications(websiteList, commandList) {
  const userid = _G.getUserId();
  let delay = 0;
  for (let i = 0; i < websiteList.length; i++) {
    let website = websiteList[i];
    let command = Array.isArray(commandList) ? commandList[i] : commandList; // If the commandList is not an array, it is really a single command meant to apply to all of the websites
    // wait a tiny amount of time
    setTimeout(() => {
      progressDisplayer.textContent = `(${i + 1}, ${websiteList.length})`;
      modifyWebsiteException(website, false, userid, command);
      console.log(website + " " + command + "-ed.");
    }, delay);
    delay = delay + _G.bulkItemdelay;
    // if the command is to remove websites, remove them again with "&" at the beginning
    if (command === "remove") {
      setTimeout(() => {
        modifyWebsiteException(website, true, userid, command);
        console.log(website + " " + command + "-ed.");
      }, delay);
      delay = delay + _G.bulkItemdelay;
    }
  }
  setTimeout(() => {
    progressDisplayer.textContent = "Refreshing...";
  }, delay);
  // reload the page after all websites have been processed
  setTimeout(() => {
    _G.softReload();
    progressDisplayer.textContent = "";
  }, delay + 1000);
}

/* EVENTS */
urlsBulkModify
  .querySelectorAll("#from-userid-buttons button")
  .forEach((button) => {
    button.addEventListener("click", async (event) => {
      try {
        let { websiteList, commandList } = await getWebsiteExceptionsFromUserId(
          _G.getUserId()
        );
        let command = button.id.slice(7);
        const trimmedWebsiteList = websiteList.map((website, i) => {
          return commandList[i] === command ? websiteList[i] : null;
        });
        const filteredWebsiteList = trimmedWebsiteList.filter(
          (website) => website !== null
        );
        document.querySelector("#website-list").value =
          filteredWebsiteList.join("\n");
      } catch (error) {
        console.error("Error:", error);
      }
    });
  });
urlsBulkModify
  .querySelectorAll("#from-list-buttons button")
  .forEach((button) => {
    button.addEventListener("click", (event) => {
      const websiteList = document
        .querySelector("#website-list")
        .value.split("\n")
        .map((line) => line.trim()) // Remove leading/trailing whitespace
        .filter((line) => line.length > 0); // Exclude blank lines
      const command = event.target.id;

      console.log(websiteList, command);
      doBulkModifications(websiteList, command);
    });
  });

/* EXPORT */
export { urlsBulkModify };
