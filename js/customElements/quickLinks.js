/* IMPORT */
import { _G } from "../_G.js";

/* DECLARATIONS */
const quickLinks = document.createElement("div");
quickLinks.id = "mbs-quicklinks";
quickLinks.className = "mbs--sidepanelelement";

const title = document.createElement("h2");
title.innerText = "Quick Links";
title.className = "mbs--title";
quickLinks.append(title);

const ul = document.createElement("ul");
quickLinks.append(ul);

function makeA(href, innerText) {
  const a = document.createElement("a");
  a.href = href;
  a.target = "_blank";
  a.innerText = innerText;
  return a;
}
const asinfo = [
  {
    href: "https://admin.tag.org/wiki/mb-smart",
    innerText: "-> TAG Wiki",
  },
  {
    href: "https://chromewebstore.google.com/detail/mb-filter/hkcgejlfeaojlbblhajcpklojekobbpg",
    innerText: "-> MB Extension",
  },
  {
    href: "https://github.com/gitmorgen/mb-smarter",
    innerText: "-> MBS Extension",
  },
];
asinfo.forEach((ainfo) => {
  const li = document.createElement("li");
  const a = makeA(ainfo.href, ainfo.innerText);
  li.append(a);
  ul.append(li);
});

/* EVENTS */

/* EXPORT */
export { quickLinks };
