/* IMPORT */
import { _G } from "../_G.js";

/* DECLARATIONS */
const translation = document.createElement("div");
translation.id = "mbs-translation";
translation.className = "mbs--sidepanelelement";

const title = document.createElement("h2");
title.innerText = "Language";
title.className = "mbs--title";
translation.append(title);

const languagesInThatLanguage = {
  en: "English",
  iw: "עברית",
  yi: "יידיש",
  es: "Español",
  fr: "Français",
};

// Create a div for the Google Translate widget
const translateDiv = document.createElement("div");
translateDiv.id = "google_translate_element";
translation.appendChild(translateDiv);

// Inject the Google Translate initialization script
const translateScript = document.createElement("script");
translateScript.innerHTML = `
  function googleTranslateElementInit() {
    new google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        includedLanguages: 'en,iw,yi,fr,es',
      }, 
      'google_translate_element'
    );
  }
`;
translation.appendChild(translateScript);

// Inject the Google Translate API script
const googleScript = document.createElement("script");
googleScript.src =
  "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
translation.appendChild(googleScript);

/* EVENTS */

/* EXPORT */
export { translation, languagesInThatLanguage };
