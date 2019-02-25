const api_url = "http://localhost:8081";

// Init ace editor
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
  bindKey: {win: "Ctrl-S", "mac": "Cmd-S"},
  exec: function(editor) {
      data = editor.session.getValue()
      saveToFile(data, "logstash_filter.conf")
  }
})

editor.commands.addCommand({
  name: 'open',
  bindKey: {win: "Ctrl-O", "mac": "Cmd-O"},
  exec: function(editor) {
      $('#filter_input_loading').click();
  }
})

function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    editor.session.setValue(contents);
  };
  reader.readAsText(file);
}

document.getElementById('filter_input_loading')
  .addEventListener('change', readSingleFile, false);


// Util functions

function saveToFile(data, filename) {
  var blob = new Blob([data], {type: 'text/plain'}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl =  ['text/plain', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
}

// Theme color

function enableBlackTheme() {
  $('#css_theme_bootstrap').attr('href','./css/bootstrap-black.min.css');
  $('#css_theme_custom').attr('href','./css/custom-black.css');

  editor.setTheme("ace/theme/dracula");

  console.log("enable black theme")
}

function enableWhiteTheme() {
  $('#css_theme_bootstrap').attr('href','./css/bootstrap.min.css');
  $('#css_theme_custom').attr('href','./css/custom.css');

  editor.setTheme("ace/theme/clouds");

  console.log("enable white theme")
}

function applyFieldsAttributes(conf) {
  var oldValues = "";
  var number = "";
  
  if(conf == undefined) {
    oldValues = getFieldsAttributesValues()
    number = $('#fields_attributes_number').val();
  } else {
    oldValues = conf;
    number = conf.length;
    $('#fields_attributes_number').val(number);
  }

  $('#fields_attributes').empty();
  for(var i = 0 ; i < number ; i++) {
    var attr = "";
    var val = "";
    if (i < oldValues.length) {
      attr = oldValues[i].attribute != undefined ? oldValues[i].attribute : ""
      val = oldValues[i].value != undefined ? oldValues[i].value : ""
    }
    var str = '<div class="form-group row" style="margin-top: 1em">';
    str += '<div class="col"><input type="text" class="form-control log-display" id="field_attribute_key_' + i + '" size="20" name="p_scnt" value="' + attr + '" placeholder="Attribute '+ (i + 1) + '" /></div>';
    str += '<div class="col"><input type="text" class="form-control log-display" id="field_attribute_value_' + i + '" size="20" name="p_scnt" value="' + val + '" placeholder="Value '+ (i + 1) + '" /></div>';
    str += '</div>';
    $('#fields_attributes').append(str);
  }
}

function getFieldsAttributesValues() {
  var number = $('#fields_attributes_number').val();
  var values = []
  for(var i = 0 ; i < number ; i++) {
    values.push({
      attribute: $('#field_attribute_key_' + i).val(),
      value: $('#field_attribute_value_' + i).val()
    });
  }
  return values
}

function jobFailed(reason) {
  $("#start_process").removeClass('disabled');
  $('#failModal').modal('show');
  $('#failModalReason').html(reason);

  $("#start_process").removeClass('disabled');
  $('#output').text('No data was receive from backend sever :(');
}

$('#clear_form').click(function () {
  $('#input_data_textarea').val("");
  editor.setValue("", -1);
  $('#output').text("The Logstash output will be shown here !");
  $('#fields_attributes_number').val(0);
  applyFieldsAttributes()
  saveSession();
});

$('#multiline_example').click(function () {

  $.ajax({
    url: "./sample/multiline/data.txt",
    success: function (data){
      $('#input_data_textarea').val(data);
    }
  });

  $.ajax({
    url: "./sample/multiline/filter.conf",
    success: function (data){
      editor.setValue(data, -1);
    }
  });

  $.ajax({
    url: "./sample/multiline/multiline.codec",
    success: function (data){
      enableMultilineCodec(data)
    }
  });

  applyFieldsAttributes([
    { attribute: "type", value: "java-stack-trace"}
  ])

  $('#more_informations_colapse').removeClass("show");

});

$('#simple_example').click(function () {

  $.ajax({
    url: "./sample/simple/data.txt",
    success: function (data){
      $('#input_data_textarea').val(data);
    }
  });

  $.ajax({
    url: "./sample/simple/filter.conf",
    success: function (data){
      editor.setValue(data, -1);
    }
  });

  applyFieldsAttributes([
    { attribute: "pilote", value: "system"},
    { attribute: "type", value: "syslog"}
  ])

  disableMultilineCodec()

  $('#more_informations_colapse').removeClass("show");

});

function enableMultilineCodec(value) {
  if(value != undefined) {
    $('#custom_codec_field').val(value)
  }
  $('#enable_custom_codec').attr('checked',true);
  $('#custom_codec_field').removeClass('d-none');
}

function disableMultilineCodec() {
  $('#custom_codec_field').addClass('d-none');
  $('#custom_codec_field').val("")
}

$('#enable_custom_codec').change(function() {
  if(this.checked) {
    enableMultilineCodec()
  } else {
    disableMultilineCodec()
  }
}); 

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

  for(var i = 0 ; i < fieldsAttributes.length ; i++) {
    if(fieldsAttributes[i].attribute == "" || fieldsAttributes[i].value == "") {
      input_valid = false;
      fieldsAttributesValids = false;
      $('#input_extra_attributes').addClass("text-danger");
      break;
    }
  }

  if(fieldsAttributesValids) {
    $('#input_extra_attributes').removeClass("text-danger");
  }

  if ($('#enable_custom_codec').is(':checked')) {
    var custom_codec_value = $('#custom_codec_field').val()
    if(custom_codec_value.length == 0) {
      input_valid = false;
      $('#custom_codec_field').addClass("is-invalid");
    } else {
      $('#custom_codec_field').removeClass("is-invalid");
    }
  }

  if(!input_valid) {
    toastr.error('All fields need to be fill !', 'Informations missings')
  }

  return input_valid
}

$('#start_process').click(function () {

  saveSession()

  if (userInputValid()) {

    var body = {
      input_data: $('#input_data_textarea').val(),
      logstash_filter: editor.getValue(),
      input_extra_fields: getFieldsAttributesValues()
    };

    if ($('#enable_custom_codec').is(':checked')) {
      body.custom_codec = $('#custom_codec_field').val();
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
        $('#output').text(data.job_result.stdout);
        $("#start_process").removeClass('disabled');
        if (data.job_result.status != 0 || data.job_result.stdout.startsWith("[ERROR]")) {
          toastr.error('There was a problem in your configuration.', 'Error')
        } else {
          toastr.success('Configuration parsing is done !', 'Success')
        }
        if (!data.config_ok) {
          toastr.error('All fields need to be fill !', 'Informations missings')
        }
      },
      error: function () {
        jobFailed("Unable to obtain a response from the backend server.<br/>You cannot do anything to solve it, please contact the maintainer of this project.")
      }
    });

  }

});

// Save and load user session

function saveSession() {
  console.log("Saving session into cookie")
  var session = {
    theme: ($('#css_theme_bootstrap').attr('href').indexOf('bootstrap.min.css') != -1? "white" : "black"),
    input_data: $('#input_data_textarea').val(),
    logstash_filter: editor.getValue(),
    input_fields: getFieldsAttributesValues(),
    custom_codec: ($('#enable_custom_codec').is(':checked') ? $('#custom_codec_field').val() : "")
  }
  Cookies.set('session', session, { expires: 7 });
}

function loadSession() {
  var session = Cookies.get('session');
  if (session != undefined) {
    var session = JSON.parse(session)
    console.log("Loading user session")
    session.theme == "white" ? enableWhiteTheme() : enableBlackTheme()
    $('#input_data_textarea').val(session.input_data)
    editor.setValue(session.logstash_filter, -1)
    applyFieldsAttributes(session.input_fields)
    if(session.custom_codec != "") {
      enableMultilineCodec(session.custom_codec)
    } else {
      disableMultilineCodec()
    }
  } else {
    console.log("No cookie for session found")
  }
}

$( "#fields_attributes_number" ).change(function() {
  applyFieldsAttributes()
});

// Change theme button

$('#change_theme').click(function (){
  if($('#css_theme_bootstrap').attr('href').includes('bootstrap.min.css')) {
    enableBlackTheme()
    saveSession()
  } else {
    enableWhiteTheme()
    saveSession()
  }
});

applyFieldsAttributes()
loadSession()