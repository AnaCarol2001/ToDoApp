const $THEME_BTN = document.getElementById("theme-btn");
const $BODY = document.querySelector("body");
let saved_theme = localStorage.getItem("theme") || "";

function setTheme(theme) {
  switch (theme) {
    case "dark":
      $BODY.dataset.theme = "dark";
      $THEME_BTN.title = "Disable Dark Mode";

      break;
    case "light":
      $BODY.dataset.theme = "light";
      $THEME_BTN.title = "Enable Dark Mode";

      break;
    default:
      $BODY.dataset.theme = "light";
      $THEME_BTN.title = "Enable Dark Mode";
      break;
  }
}

if (saved_theme != "") {
  setTheme(saved_theme);
} else {
  if (window.matchMedia("(prefers-color-scheme : dark)").matches) {
    setTheme("dark");
    localStorage.setItem("theme", "dark");
  } else {
    setTheme("light");
    localStorage.setItem("theme", "light");
  }
}

$THEME_BTN.addEventListener("click", () => {
  let current_theme = $BODY.dataset.theme;

  if (current_theme == "light") {
    setTheme("dark");
    localStorage.setItem("theme", "dark");
  } else {
    setTheme("light");
    localStorage.setItem("theme", "light");
  }
});
