/* IMPORT */
import { idCopy } from "../customElements/idCopy.js";
import { urlsBulkModify } from "../customElements/urlsBulkModify.js";
import { applyProfile } from "../customElements/applyprofile.js";
import { ccSelectors, cornercopy } from "../customElements/cornercopy.js";
import { languagesInThatLanguage } from "../customElements/translation.js";

/* DECLARATIONS */
const elementsInfo = {
  // a directory of CSS selectors used to identify the desired element, and the function used to inject it into the DOM
  urlsbulkModify: {
    selector: "#urladd",
    inject: function (targetElement) {
      let a = targetElement.closest(".bubble");
      a.firstChild.appendChild(urlsBulkModify);
    },
  },
  idCopy: {
    selector: ".username b[style='font-size: 1.8vmin; color: #488f96;']",
    inject: function (targetElement) {
      targetElement.insertBefore(idCopy, targetElement.childNodes[2]);
    },
  },
  applyProfile: {
    selector: "#main .tabname:has(.username)",
    inject: function (targetElement) {
      targetElement.prepend(applyProfile);
    },
  },
  googleTranslateDropdownOption: {
    selector:
      "option[value='en'],option[value='iw'],option[value='yi'],option[value='fr'],option[value='es']",
    inject: function (targetElement) {
      targetElement.innerText = languagesInThatLanguage[targetElement.value];
    },
  },
  googleTranslate: {
    selector: "div.skiptranslate.goog-te-gadget",
    inject: function (targetElement) {
      targetElement.lastChild.remove();
      targetElement.lastChild.remove();
      targetElement.querySelector(".goog-te-combo").style = "width: 100%;";
    },
  },
};
Object.keys(ccSelectors).forEach((dataType) => {
  elementsInfo[dataType] = {
    selector: ccSelectors[dataType].selector,
    tab: ccSelectors[dataType].tab,
    inject: function (targetElement) {
      const a = new cornercopy(dataType);
      a.appendTo(targetElement);
      targetElement.style["overflow-x"] = "visible"; // forces the parent element to allow overflow visiblity
      targetElement.style.position = "relative"; // forces the parent element to work properly with the cornercopy's absolute positioning
    },
  };
});

/* EXPORT */
export { elementsInfo };
