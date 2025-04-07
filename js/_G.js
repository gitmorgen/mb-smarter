/* DECLARATIONS */
const _G = {};

_G.bulkItemDelay = 50; // Delay between each bulk item in milliseconds
_G.fetchUrl = "https://portal.mbsmartservices.net/mbsmart/info";
_G.fetch = function (formData) {
  // Return a promise that resolves with the HTML document
  return fetch(_G.fetchUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded", // Set content type to Form Data
    },
    body: formData.toString(), // Send the form data as a URL-encoded string
  })
    .then((response) => response.text()) // Parse the HTML response
    .then((html) => {
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(html, "text/html");
      // Now you can work with the HTML object
      return { htmlDoc };
    })
    .catch((error) => {
      console.error("MBS Failed:", error); // Handle any errors
      throw error; // Rethrow the error to be handled by the caller
    });
};
_G.getUserId = function () {
  // Get the query string part of the current URL
  const queryString = window.location.search;

  // Create a URLSearchParams object
  const urlParams = new URLSearchParams(queryString);

  // Example: Retrieve a specific parameter
  const paramValue = urlParams.get("userid"); // Replace 'parameterName' with your desired parameter
  return paramValue;
};
_G.getHtmlDocFromUserId = async function (userid, tabName) {
  // Data to send in the POST request, structured as form data
  const formData = new URLSearchParams();
  formData.append("mode", 0);
  formData.append("userid", userid);
  formData.append("type", "user");
  formData.append("place", tabName);

  return await _G.fetch(formData);
};
_G.places = {
  Info: "info",
  Main: "main",
  Categories: "cats",
  Apps: "apps",
  "System Apps": "sapps",
  "Extension Settings (Pro)": "extension",
  Restrictions: "rest",
  "Urls List": "url",
  Features: "features",
  "Special Conf.": "conf",
};
const invertKeyValues = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [value, key]));
_G.placesFromShorthand = invertKeyValues(_G.places);
_G.getActiveTab = function () {
  let a = document.querySelector("#main > div.tab > button.tabclicked");
  if (a && a.innerText) {
    a = a.innerText.trim();
  }
  return _G.places[a];
};
_G.getCurrentTabs = function () {
  const activeTab = _G.getActiveTab();
  const otherTabs = [];
  const tabButtons = document.querySelectorAll(
    "#main > div.tab > button[onclick]"
  );
  tabButtons.forEach((element) => {
    const onclickText =
      element.getAttribute("onclick") || element.onclick.toString();

    // Regex to match objects starting with {mode: until their closing }
    const objectRegex = /\{mode:[^{}]*\}/g; // Matches {mode: followed by anything except { or } until }
    const objectMatches = onclickText.match(objectRegex) || [];

    if (objectMatches) {
      const objects = objectMatches.map((match) => eval("(" + match + ")")); // Convert strings to JS objects
      otherTabs.push(objects[0].place.trim());
    } else {
      console.log("No objects starting with {mode: found.");
    }
  });
  return { activeTab, otherTabs };
};
_G.softReload = function () {
  // location.reload();
  const userid = _G.getUserId();
  const { activeTab } = _G.getCurrentTabs() || "info";
  console.log("Refreshing to", activeTab);

  var currentState = history.state;
  history.replaceState(
    currentState,
    "User: " + userid,
    "Admin.html?userid=" + userid
  );
  getdiv2(
    "info",
    {
      mode: "0",
      reload: "1",
      place: activeTab,
      type: "user",
      userid: userid,
    },
    "main",
    true
  );
};
_G.copyToClipboard = function (data, callback) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(data).then(
      () => {
        console.log("Data copied to clipboard successfully.");
        if (callback) {
          callback();
        }
      },
      (err) => {
        console.error("Failed to copy data to clipboard:", err);
      }
    );
  } else {
    console.error("Clipboard API is not supported in this browser.");
  }
};

/* EXPORT */
export { _G };
