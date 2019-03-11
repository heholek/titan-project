//////////////////////
// Theme management //
//////////////////////

// Theme colors

// Enable the black theme
function enableBlackTheme() {
  $('#css_theme_bootstrap').attr('href', './css/bootstrap-black.min.css');
  $('#css_theme_custom').attr('href', './css/custom-black.css');

  editor.setTheme("ace/theme/dracula");

  console.log("Enable black theme")
}

// Enable the white theme
function enableWhiteTheme() {
  $('#css_theme_bootstrap').attr('href', './css/bootstrap.min.css');
  $('#css_theme_custom').attr('href', './css/custom.css');

  editor.setTheme("ace/theme/clouds");

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
