//////////////////////
// Theme management //
//////////////////////

// Theme colors

// Enable the black theme
function enableBlackTheme() {
  editor.setTheme("ace/theme/dracula");
  inputEditor.setTheme("ace/theme/dracula");

  $('#css_theme_bootstrap').attr('href', './css/bootstrap-black.min.css');
  $('#css_theme_custom').attr('href', './css/custom-black.css');

  editor.setTheme("ace/theme/dracula");
  inputEditor.setTheme("ace/theme/dracula");

  console.log("Enable black theme")
}

// Enable the white theme
function enableWhiteTheme() {
  editor.setTheme("ace/theme/clouds");
  inputEditor.setTheme("ace/theme/chrome");

  $('#css_theme_bootstrap').attr('href', './css/bootstrap.min.css');
  $('#css_theme_custom').attr('href', './css/custom.css');

  editor.setTheme("ace/theme/clouds");
  inputEditor.setTheme("ace/theme/chrome");

  console.log("Enable white theme")
}

// Change theme button rtrigger
$('#change_theme').click(function () {
  if ($('#css_theme_bootstrap').attr('href').includes('bootstrap.min.css')) {
    enableBlackTheme()
    saveSession()
  } else {
    enableWhiteTheme()
    saveSession()
  }
  document.location.reload(true);
});

// Minimalist mode

// Enable the minimalist mode
function enableMinimalistMode() {
  $('#css_theme_minimalist').attr('href', './css/custom-minimalist.css');

  console.log("Enable minimalist mode")
}

// Disable the minimalist mode
function disableMinimalistMode() {
  $('#css_theme_minimalist').attr('href', './css/custom-nominimalist.css');

  console.log("Disable minimalist mode")
}

// Change minimalist mode button trigger
$('#change_minimalist').click(function () {
  if ($('#css_theme_minimalist').attr('href').includes('nominimalist.css')) {
    enableMinimalistMode()
    saveSession()
  } else {
    disableMinimalistMode()
    saveSession()
  }
});

// Redirect the user to a specific anchor in the page

function jumpTo(anchor) {
  window.location.href = "#"+anchor;
}

// Redirect click for a toastr event for a specific anchor

function redirectToastrClick(element, anchor) {
  $(element).click(function(){ 
    jumpTo(anchor)
  });
}