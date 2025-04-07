/* IMPORT */
import { _G } from "../_G.js";

/* DECLARATIONS */
const idCopy = document.createElement("button");
idCopy.innerText = "🔗";
idCopy.id = "mbs-idcopy";

const label = document.createElement("span");
label.className = "hidden";
label.innerHTML = `Copied to clipboard!`;
idCopy.append(label);

/* EVENTS */
idCopy.addEventListener("click", () => {
  const userid = _G.getUserId();
  _G.copyToClipboard(userid, function () {
    console.log("Text copied to clipboard");
    label.classList.remove("hidden");
    setTimeout(() => {
      label.classList.add("hidden");
    }, 3000);
  });
});

/* EXPORT */
export { idCopy };
