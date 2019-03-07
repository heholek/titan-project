const api_url = "http://localhost:8081";

var remote_file_hash = undefined

/////////////////////
// Init ACE editor //
/////////////////////

// Build the ACE editor to edit configuration
function buildEditor() {
  ace.require("ace/ext/language_tools");

  var editor = ace.edit("logstash_filter_textarea");
  editor.session.setMode("ace/mode/ruby");
  editor.session.setTabSize(2);

  editor.setOptions({
    fontSize: "12pt",
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    indentedSoftWrap: true,
    useSoftTabs: true,
    showPrintMargin: false,
    enableSnippets: false,
    navigateWithinSoftTabs: true,
    keyboardHandler: "ace/keyboard/sublime"
  })

  // Editor save and open behavior

  editor.commands.addCommand({
    name: 'save',
    bindKey: { win: "Ctrl-S", "mac": "Cmd-S" },
    exec: function (editor) {
      data = editor.session.getValue()
      saveToFile(data, "logstash_filter.conf")
    }
  })

  editor.commands.addCommand({
    name: 'open',
    bindKey: { win: "Ctrl-O", "mac": "Cmd-O" },
    exec: function (editor) {
      $('#filter_input_loading').click();
    }
  })

  return editor
}

// Meta function to read file content
function readSingleFile(e, callback) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function (e) {
    var contents = e.target.result;
    callback(contents)
  };
  reader.readAsText(file);
}

// Read the content of a single file, and put it into the editor
function loadConfEditor(e) {
  readSingleFile(e, (contents) => {
    editor.session.setValue(contents);
  })
}

// We create a callback when user click on the input loading
document.getElementById('filter_input_loading').addEventListener('change', loadConfEditor, false);

// Save a string to file
function saveToFile(data, filename) {
  var blob = new Blob([data], { type: 'text/plain' }),
    e = document.createEvent('MouseEvents'),
    a = document.createElement('a')

  a.download = filename
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':')
  e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  a.dispatchEvent(e)
}

// Create the editor that will be used by others files
var editor = buildEditor()

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

//////////////////////////
// Example form filling //
//////////////////////////

// Trigger for the multiline example
$('#multiline_example').click(function () {

  $.ajax({
    url: "./sample/multiline/data.txt",
    success: function (data) {
      $('#input_data_textarea').val(data);
    }
  });

  $.ajax({
    url: "./sample/multiline/filter.conf",
    success: function (data) {
      editor.setValue(data, -1);
    }
  });

  $.ajax({
    url: "./sample/multiline/multiline.codec",
    success: function (data) {
      enableMultilineCodec(data)
    }
  });

  applyFieldsAttributes([
    { attribute: "type", value: "java-stack-trace" }
  ])

  fileUploadDisabled()

});

// Trigger for the basic example
$('#simple_example').click(function () {

  $.ajax({
    url: "./sample/simple/data.txt",
    success: function (data) {
      $('#input_data_textarea').val(data);
    }
  });

  $.ajax({
    url: "./sample/simple/filter.conf",
    success: function (data) {
      editor.setValue(data, -1);
    }
  });

  applyFieldsAttributes([
    { attribute: "pilote", value: "system" },
    { attribute: "application", value: "system" },
    { attribute: "type", value: "syslog" },
    { attribute: "path", value: "/var/log/syslog" }
  ])

  disableMultilineCodec()

  fileUploadDisabled()

});

//////////////////
// Form control //
//////////////////

// Manage list of extra fields

// Apply conf of extra input fields
function applyFieldsAttributes(conf) {
  var oldValues = "";
  var number = "";

  if (conf == undefined) {
    oldValues = getFieldsAttributesValues()
    number = $('#fields_attributes_number').val();
  } else {
    oldValues = conf;
    number = conf.length;
    $('#fields_attributes_number').val(number);
  }

  $('#fields_attributes').empty();
  for (var i = 0; i < number; i++) {
    var attr = "";
    var val = "";
    if (i < oldValues.length) {
      attr = oldValues[i].attribute != undefined ? oldValues[i].attribute : ""
      val = oldValues[i].value != undefined ? oldValues[i].value : ""
    }
    var str = '<div class="form-group row" style="margin-top: 1em">';
    str += '<div class="col"><input type="text" class="form-control log-display" id="field_attribute_key_' + i + '" size="20" name="p_scnt" value="' + attr + '" placeholder="Attribute ' + (i + 1) + '" /></div>';
    str += '<div class="col"><input type="text" class="form-control log-display" id="field_attribute_value_' + i + '" size="20" name="p_scnt" value="' + val + '" placeholder="Value ' + (i + 1) + '" /></div>';
    str += '</div>';
    $('#fields_attributes').append(str);
  }
}

// Get value of extra input files
function getFieldsAttributesValues() {
  var number = $('#fields_attributes_number').val();
  var values = []
  for (var i = 0; i < number; i++) {
    values.push({
      attribute: $('#field_attribute_key_' + i).val(),
      value: $('#field_attribute_value_' + i).val()
    });
  }
  return values
}

// Trigger on the fields attribute number
$("#fields_attributes_number").change(function () {
  applyFieldsAttributes()
});

// Manage the custom multiline codec

// Enable the multiline codec
function enableMultilineCodec(value) {
  if (value != undefined) {
    $('#custom_codec_field').val(value)
  }
  $('#enable_custom_codec').attr('checked', true);
  $('#custom_codec_field').removeClass('d-none');
}

// Disable the multiline codec
function disableMultilineCodec() {
  $('#custom_codec_field').addClass('d-none');
  $('#custom_codec_field').val("");
  $('#enable_custom_codec').attr('checked', false);
}

// Trigger on the multiline codec checkbox
$('#enable_custom_codec').change(function () {
  if (this.checked) {
    enableMultilineCodec()
  } else {
    disableMultilineCodec()
  }
});

// Validate the user input

function userInputValid() {
  input_valid = true;

  var input_data = $('#input_data_textarea').val();
  var logstash_filter = editor.getValue();

  if (input_data.length == 0) {
    $('#input_data_textarea').addClass("is-invalid");
    input_valid = false;
  } else {
    $('#input_data_textarea').removeClass("is-invalid");
  }

  if (logstash_filter.length == 0) {
    $('#logstash_filter_title').addClass("text-danger");
    input_valid = false;
  } else {
    $('#logstash_filter_title').removeClass("text-danger");
  }

  fieldsAttributes = getFieldsAttributesValues()
  fieldsAttributesValids = true

  for (var i = 0; i < fieldsAttributes.length; i++) {
    if (fieldsAttributes[i].attribute == "" || fieldsAttributes[i].value == "") {
      input_valid = false;
      fieldsAttributesValids = false;
      $('#input_extra_attributes').addClass("text-danger");
      break;
    }
  }

  if (fieldsAttributesValids) {
    $('#input_extra_attributes').removeClass("text-danger");
  }

  if ($('#enable_custom_codec').is(':checked')) {
    var custom_codec_value = $('#custom_codec_field').val()
    if (custom_codec_value.length == 0) {
      input_valid = false;
      $('#custom_codec_field').addClass("is-invalid");
    } else {
      $('#custom_codec_field').removeClass("is-invalid");
    }
  }

  if (!input_valid) {
    toastr.error('All fields need to be fill !', 'Informations missings')
  }

  return input_valid
}

/////////////////
// File upload //
/////////////////

// When we want to disable file upload
function fileUploadDisabled() {
  $('#upload_logfile').val("")
  $('#upload_logfile').show()
  $('#upload_logfile_cancel').hide()
  remote_file_hash = undefined
  $('#input_data_textarea').prop('readonly', false);
  $('#input_data_textarea').val("")
  saveSession()
}

// When we want to enable file upload
function fileUploadEnabled(hash, content) {
  $('#upload_logfile').hide()
  $('#upload_logfile_cancel').show()
  remote_file_hash = hash
  $('#input_data_textarea').prop('readonly', true);

  if (content != undefined) {
    logfile_content_cut = "<-- Only the first 50 lines of your log file are shown here -->\n"
    logfile_content_cut += content.split('\n').slice(0, 50).join('\n')
    $('#input_data_textarea').val(logfile_content_cut)
  }

  saveSession()
}

// Read the content of a single file, and put it into the editor
function sendLogfileToBackend(e) {
  readSingleFile(e, (content) => {

    var hash = md5(content)
    fileUploadEnabled(hash)

    remoteLogExists(hash, (exists) => {
      if (!exists) {
        uploadLogFile(hash, content, (succeed) => {
          if (!succeed) {
            toastr.error('Unable to upload your log file', 'Error')
            fileUploadDisabled()
          } else {
            fileUploadEnabled(hash, content)
          }
        })
      } else {
        fileUploadEnabled(hash, content)
      }
    })
  })
}


// Upload a log file
function uploadLogFile(hash, content, callback) {
  body = {
    hash: hash,
    file_content: content
  }
  $.ajax({
    url: api_url + "/file/upload",
    type: "POST",
    data: JSON.stringify(body),
    contentType: "application/json",
    dataType: "json",
    success: function (data) {
      callback(data.succeed)
    },
    error: function () {
      jobFailed()
      fileUploadDisabled()
    }
  });
}

// Check if a Logfile exists on remote server, send result in callback
function remoteLogExists(hash, callback) {
  body = {
    hash: hash
  }
  $.ajax({
    url: api_url + "/file/exists",
    type: "POST",
    data: JSON.stringify(body),
    contentType: "application/json",
    dataType: "json",
    success: function (data) {
      return callback(data.exists == true)
    },
    error: function () {
      jobFailed()
    }
  });
}

// Trigger for upload a file
document.getElementById('upload_logfile').addEventListener('change', sendLogfileToBackend, false);


// Trigger for upload a file
$('#upload_logfile_cancel').click(function () {
  fileUploadDisabled()
});

///////////////////////////
// Backend communication //
///////////////////////////

// Escape a string to html
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// A function to display beautiful json

function jsonSyntaxHighlight(json) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

// Format logstash log output

function formatLogstashLog(log) {
  res = ""
  lines = log.split('\n')
  for (var i = 0; i < lines.length; i++) {
    line = lines[i]
    if (line.startsWith("[")) {
      line = line.replace(/\\r\\n/g, '\n')
      line = line.replace(/\\n/g, '\n')
      line = escapeHtml(line)
    } else if (line.startsWith("{") && line.endsWith("}")) {
      obj = JSON.stringify(JSON.parse(line), null, 2);
      line = jsonSyntaxHighlight(obj)
    }
    res += line + "\n"
  }
  return res;
}

// Manage if backend fail to treat user input

function jobFailed() {
  $("#start_process").removeClass('disabled');
  $('#failModal').modal('show');
  $('#failModalReason').html("Unable to obtain a response from the backend server.<br/>You cannot do anything to solve it, please contact the maintainer of this project.");

  $("#start_process").removeClass('disabled');
  $('#output').text('No data was receive from backend server :(');
}

$('#clear_form').click(function () {
  $('#input_data_textarea').val("");
  editor.setValue("", -1);
  $('#output').text("The Logstash output will be shown here !");
  $('#fields_attributes_number').val(0);
  applyFieldsAttributes()
  disableMultilineCodec()
  fileUploadDisabled()
  saveSession();
});

// The main process, that will send data to backend

$('#start_process').click(function () {

  saveSession()

  if (userInputValid()) {

    var body = {
      logstash_filter: editor.getValue(),
      input_extra_fields: getFieldsAttributesValues()
    };

    if(remote_file_hash == undefined) {
      body.input_data = $('#input_data_textarea').val()
    } else {
      body.filehash = remote_file_hash
    }

    console.log(body)

    if ($('#enable_custom_codec').is(':checked')) {
      body.custom_codec = $('#custom_codec_field').val();
    }

    if ($('#custom_logstash_patterns_input').val() != "") {
      body.custom_logstash_patterns = $('#custom_logstash_patterns_input').val();
    }

    $('#output').html('<div style="padding-top: 1em; padding-bottom: 1em"><div class="spinner-border" style="display: block; margin: auto;" role="status><span class="sr-only"></span></div></div>');
    $("#start_process").addClass('disabled');

    $.ajax({
      url: api_url + "/start_process",
      type: "POST",
      data: JSON.stringify(body),
      contentType: "application/json",
      dataType: "json",
      timeout: 60000,
      success: function (data) {
        if (data.job_result.status == -1) {
          toastr.error('Unable to execute the process on remote server.', 'Error')
        } else if (data.job_result.status != 0 || data.job_result.stdout.indexOf("[ERROR]") != -1 || data.job_result.stdout.indexOf("[WARNING]") != -1) {
          toastr.error('There was a problem in your configuration.', 'Error')
          data.job_result.stdout = formatLogstashLog(data.job_result.stdout)
        } else {
          toastr.success('Configuration parsing is done !', 'Success')
          data.job_result.stdout = formatLogstashLog(data.job_result.stdout)
        }

        if (!data.config_ok) {
          toastr.error('All fields need to be fill !', 'Informations missings')
        }

        $('#output').html(data.job_result.stdout);
        $("#start_process").removeClass('disabled');
      },
      error: function () {
        jobFailed()
      }
    });

  }

});

////////////////////////
// Session management //
////////////////////////

// Save current user session
function saveSession() {
  console.log("Saving session into cookie")
  var session = {
    minimalist: ($('#css_theme_minimalist').attr('href').indexOf('nominimalist.css') != -1 ? false : true),
    theme: ($('#css_theme_bootstrap').attr('href').indexOf('bootstrap.min.css') != -1 ? "white" : "black"),
    input_data: $('#input_data_textarea').val(),
    logstash_filter: editor.getValue(),
    input_fields: getFieldsAttributesValues(),
    custom_logstash_patterns: $('#custom_logstash_patterns_input').val(),
    custom_codec: ($('#enable_custom_codec').is(':checked') ? $('#custom_codec_field').val() : ""),
    remote_file_hash: remote_file_hash
  }
  store.set('session', session);

  if (JSON.stringify(store.get('session')) != JSON.stringify(session)) {
    toastr.warning('There was a problem while saving your work', 'Save problem')
  }
}

// Load session for user
function loadSession() {
  var session = store.get('session');
  if (session != undefined) {
    console.log("Loading user session")
    session.theme == "white" ? enableWhiteTheme() : enableBlackTheme()
    $('#input_data_textarea').val(session.input_data)
    $('#custom_logstash_patterns_input').val(session.custom_logstash_patterns)
    editor.setValue(session.logstash_filter, -1)
    applyFieldsAttributes(session.input_fields)
    if (session.custom_codec != "") {
      enableMultilineCodec(session.custom_codec)
    } else {
      disableMultilineCodec()
    }
    if (session.minimalist) {
      enableMinimalistMode()
    } else {
      disableMinimalistMode()
    }
    if (session.remote_file_hash != undefined) {
      fileUploadEnabled(session.remote_file_hash)
    } else {
      fileUploadDisabled()
    }
  } else {
    console.log("No cookie for session found")
  }
}




// Set default values

applyFieldsAttributes()
loadSession()