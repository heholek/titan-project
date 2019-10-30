const api_url = "http://localhost:8081";
const enable_news = true
const enable_file_upload = true

// Set default values

applyFieldsAttributes()

loadLogstashVersions(function () {
    loadSession()
    loadShareConfigIfNeeded()
})

if(enable_file_upload) {
    $('#file_upload_feature').removeClass('d-none')
}