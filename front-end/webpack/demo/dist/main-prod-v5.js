(() => {
  "use strict";
  const e = (() => {
    const e = document.createElement("h2");
    return e.textContent = "Hello webpack", e.addEventListener("click", (() => alert("Hello webpack"))), e
  })();
  document.body.append(e)
})();