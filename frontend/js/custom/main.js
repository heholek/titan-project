const api_url = "http://localhost:8081";
const enable_news = true

// Set default values

applyFieldsAttributes()

loadLogstashVersions(function () {
    loadSession()
    loadShareConfigIfNeeded()
})
