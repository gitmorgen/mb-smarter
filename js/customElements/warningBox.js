/* IMPORT */
import { _G } from "../_G.js";
import { fetchFormDatas } from "../utils/mbsmart.js";

/* DECLARATIONS */
const warningBox = document.createElement("div");
warningBox.className = "hidden";
const warningContent = document.createElement("div");
warningContent.id = "mbs-warningbox";

const div1 = document.createElement("div");

const title = document.createElement("h2");
title.className = "mbs--title2";
title.textContent = "Wait! Are you sure?";

const message = document.createElement("p");
message.className = "mbs--title";
message.innerHTML = `Applying will overwrite current filtering settings. This action can not be reversed.`;

const messageBr = document.createElement("br");

const buttonContainer = document.createElement("div");

const yesButton = document.createElement("button");
yesButton.className = "mbs--button mbs--purple";
yesButton.textContent = "Apply Everything";

const noButton = document.createElement("button");
noButton.className = "mbs--button mbs--blue";
noButton.textContent = "Go back.";

const progressDisplayer = document.createElement("p");
progressDisplayer.className = "hidden";

buttonContainer.append(yesButton, noButton, progressDisplayer);

const detailsList = document.createElement("ul");
function fillDetails(newDetails) {
  let detailsCount = 0;
  // Clear the details list
  detailsList.innerHTML = "";

  // Populate the details list with new details
  newDetails.forEach((detail) => {
    const listItem = document.createElement("li");
    const title = document.createElement("h4");
    const desc = document.createElement("p");
    title.textContent = _G.placesFromShorthand[detail[0].name];
    listItem.append(title, desc);
    if (Array.isArray(detail[1])) {
      // there are changes
      detailsCount += detail[1].length;
      desc.textContent = `${detail[1].length} change${
        detail[1].length > 1 ? "s" : ""
      } detected ---->`;
      const button = document.createElement("button");
      button.textContent = "Apply";
      button.className = "mbs--button mbs--purple";
      button.addEventListener("click", () => {
        console.log(detail[1]);
        fetchFormDatas(detail[1]);
      });
      listItem.append(button);
    } else if (typeof detail[1] === "string") {
      desc.textContent = detail[1];
    }
    detailsList.appendChild(listItem);
  });
  return detailsCount;
}

div1.append(
  title,
  detailsList,
  document.createElement("br"),
  message,
  messageBr,
  buttonContainer,
  progressDisplayer
);

const div2 = document.createElement("div");

const title2 = document.createElement("h2");
title2.className = "mbs--title2";
title2.textContent = "Faulty profile.";

const message2 = document.createElement("p");
message2.className = "mbs--title";
message2.innerHTML = `No changes were detected.<br>Please try a different profile input.`;

const backButton = document.createElement("button");
backButton.className = "mbs--button mbs--blue";
backButton.textContent = "OK, go back.";

div2.append(
  title2,
  document.createElement("br"),
  message2,
  document.createElement("br"),
  backButton
);

warningContent.append(div1, div2);
warningBox.append(warningContent);
// Add styles for the background blur
const style = document.createElement("style");
style.id = "blurredbackground";
style.textContent = `
    body::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.1);
    z-index: 5000;
    backdrop-filter: blur(10px);
}
`;

let inputtedFormDatas;
function toggleWarningBox(show = null, formDatas) {
  const styleElement = document.querySelector("#blurredbackground");

  if (show === null) return;

  if (show && formDatas) {
    inputtedFormDatas = formDatas;
    if (formDatas.length > 0) {
      title.textContent = `Affects ${formDatas.length} tab${
        formDatas.length === 1 ? "" : "s"
      }.`;
      const detailsCount = fillDetails(formDatas);
      if (detailsCount <= 0) {
        yesButton.classList.add("hidden");
        message.classList.add("hidden");
        messageBr.classList.add("hidden");
      } else {
        yesButton.classList.remove("hidden");
        message.classList.remove("hidden");
        messageBr.classList.remove("hidden");
      }
      div1.classList.remove("hidden");
      div2.classList.add("hidden");
    } else {
      div1.classList.add("hidden");
      div2.classList.remove("hidden");
    }
    warningBox.classList.remove("hidden");
    if (!styleElement) {
      document.head.prepend(style);
    }
  } else {
    warningBox.classList.add("hidden");
    if (styleElement) {
      styleElement.remove();
    }
  }
}
function toggleProgressDisplayer(show = null) {
  if (show === null) return;

  if (show) {
    yesButton.classList.add("hidden");
    noButton.classList.add("hidden");
    progressDisplayer.classList.remove("hidden");
  } else {
    yesButton.classList.remove("hidden");
    noButton.classList.remove("hidden");
    progressDisplayer.classList.add("hidden");
  }
}
function updateProgressDisplayer(text) {
  progressDisplayer.textContent = text;
}

/* EVENTS */
noButton.addEventListener("click", () => {
  toggleWarningBox(false);
});
backButton.addEventListener("click", () => {
  toggleWarningBox(false);
});
yesButton.addEventListener("click", () => {
  const inputtedFormDatasList = [];
  inputtedFormDatas.forEach((d) => {
    if (Array.isArray(d[1])) {
      inputtedFormDatasList.push(...d[1]);
    }
  });
  console.log(inputtedFormDatasList);
  fetchFormDatas(inputtedFormDatasList);
});
document.addEventListener("click", (event) => {
  if (
    !warningBox.contains(event.target) &&
    !warningBox.classList.contains("hidden")
  ) {
    toggleWarningBox(false);
  }
});

/* STARTUP */
document.body.append(warningBox);

/* EXPORT */
export {
  warningBox,
  toggleWarningBox,
  toggleProgressDisplayer,
  updateProgressDisplayer,
};
