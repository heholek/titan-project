/////////////////////
// Init ACE editor //
/////////////////////

// Format logstash filter code
function formatLogstashFilter() {
    logstash_filter = editor.getValue()
    lines = logstash_filter.split('\n')
    level = 0;

    for (var i = 0; i < lines.length; i++) {
        line = lines[i]
        if (line.match(/}\s*$/g) && level != 0) {
            level -= 1
        }
        if (line.match(/^\s*/g)) {
            lines[i] = line.replace(/^\s*/g, "  ".repeat(level))
        }
        if (line.match(/\s+{/g)) {
            level += 1
        }
    }
    
    logstash_filter = lines.join('\n')
    editor.setValue(logstash_filter, -1)
    console.log("Code formatted")
}

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

    editor.commands.addCommand({
        name: 'autoident',
        bindKey: { win: "Ctrl-I", "mac": "Cmd-I" },
        exec: function (editor) {
            formatLogstashFilter()
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
