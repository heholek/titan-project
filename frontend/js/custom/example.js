//////////////////////////
// Example form filling //
//////////////////////////

// To generate examples
function exampleFactory(input_data_filepath, filter_filepath, input_data_attributes, custom_codec_filepath) {

    if (input_data_filepath != undefined) {
        $.ajax({
            url: input_data_filepath,
            success: function (data) {
                inputEditor.setValue(data, -1)
            }
        });
    } else {
        inputEditor.setValue("", -1)
    }

    if (filter_filepath != undefined) {
        $.ajax({
            url: filter_filepath,
            success: function (data) {
                editor.setValue(data, -1);
            }
        });
    }

    if (input_data_attributes != undefined) {
        applyFieldsAttributes(input_data_attributes)
    }

    if (custom_codec_filepath != undefined) {
        $.ajax({
            url: custom_codec_filepath,
            success: function (data) {
                enableMultilineCodec(data)
            }
        });
    } else {
        disableMultilineCodec()
    }

    fileUploadDisabled()

}

// Trigger for the multiline example
$('#multiline_example').click(function () {

    exampleFactory(
        input_data_filepath = "./sample/multiline/data.txt",
        filter_filepath = "./sample/multiline/filter.conf",
        input_data_attributes = [
            { attribute: "type", value: "java-stack-trace" }
        ],
        custom_codec_filepath = "./sample/multiline/multiline.codec"
    )

});

// Trigger for the basic example
$('#simple_example').click(function () {

    exampleFactory(
        input_data_filepath = "./sample/simple/data.txt",
        filter_filepath = "./sample/simple/filter.conf",
        input_data_attributes = [
            { attribute: "pilote", value: "system" },
            { attribute: "type", value: "syslog" },
            { attribute: "path", value: "/var/log/syslog" }
        ],
        custom_codec_filepath = undefined
    )

});

// Trigger for a basic Logstash template
$('#template_example').click(function () {

    exampleFactory(
        input_data_filepath = undefined,
        filter_filepath = "./sample/template/filter.conf",
        input_data_attributes = [
            { attribute: "pilote", value: "my-pilote" },
            { attribute: "type", value: "my-type" }
        ],
        custom_codec_filepath = undefined
    )

});