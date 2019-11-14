var expect = require("chai").expect;
var request = require("request");

const config = require("./logstash/config")

describe("API Testing", function () {

  this.slow(100)

  describe("/", function () {

    var url = "http://localhost:8081/";

    it("returns status 200", function (done) {
      request(url, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

  });


  describe("/logstash", function () {

    describe("/start", function () {

      var url = "http://localhost:8081/logstash/start";

      it("without parameters", function (done) {
        formData = {
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(response.statusCode).to.equal(400);
          expect(body.config_ok).to.equal(false);
          expect(body.succeed).to.equal(false);
          expect(body.missing_fields.length).to.equal(4);
          expect(body.missing_fields).to.contain("logstash_filter");
          expect(body.missing_fields).to.contain("input_data");
          expect(body.missing_fields).to.contain("filehash");
          expect(body.missing_fields).to.contain("logstash_version");
          done();
        });
      });

      it("with missing parameters", function (done) {
        formData = {
          input_data: "hi\nho\nha\nhou\nlol"
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
            expect(body.succeed).to.equal(false);
            expect(body.config_ok).to.equal(false);
            expect(response.statusCode).to.equal(400);
            expect(body.missing_fields.length).to.equal(2);
            expect(body.missing_fields).to.contain("logstash_filter");
            expect(body.missing_fields).to.contain("logstash_version");
            done();
        });
      });

      it("with incompatible parameters", function (done) {
        formData = {
          input_data: "hi\nho\nha\nhou\nlol",
          logstash_filter: "filter{mutate{add_field=>{'test'=> 'test2'}}}",
          filehash: "1F9720F871674C18E5FECFF61D92C1355CD4BFAC25699FB7DDFE7717C9669B4D085193982402156122DFAA706885FD64741704649795C65B2A5BDEC40347E28A",
          logstash_version: "1.2.3"
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
            expect(body.succeed).to.equal(false);
            expect(body.config_ok).to.equal(false);
            expect(response.statusCode).to.equal(400);
            expect(body.missing_fields.length).to.equal(2);
            expect(body.missing_fields).to.contain("input_data");
            expect(body.missing_fields).to.contain("filehash");
            done();
        });
      });

    });

    describe("/versions", function () {

      var url = "http://localhost:8081/logstash/versions";
  
      it("get the logstash versions", function (done) {
        request({ url: url, json: true }, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(body.succeed).to.equal(true);
          expect(body.versions.length).to.not.equal(0);
          expect(body.versions).to.contain(config.logstashVersion);
          done();
        });
      });
  
    });

  });

  describe("/grok_tester", function () {

    var url = "http://localhost:8081/grok_tester";

    it("work with a working grok pattern", function (done) {
      formData = {
        line: 'Dec 23 12:11:43 louis postfix/smtpd[31499]: connect from unknown[95.75.93.154]',
        grok_pattern: "%{SYSLOGTIMESTAMP:syslog_timestamp} %{SYSLOGHOST:syslog_hostname} %{DATA:syslog_program}(?:\[%{POSINT:syslog_pid}\])?: %{GREEDYDATA:syslog_message}"
      }
      request.post({ url: url, body: formData, json: true }, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(body.config_ok).to.equal(true);
        expect(body.succeed).to.equal(true);
        expect(body.results.length).not.to.equal(0)
        done();
      });
    });

    it("work with a working grok pattern", function (done) {
      formData = {
        line: 'Dec 23 12:11:43 louis postfix/smtpd[31499]: connect from unknown[95.75.93.154]',
        grok_pattern: "%{SYSLOGTIMESTAMP:syslog_timestamp} %{SYSLOGHOST:syslog_hostname} %{DATA:syslog_program}(?:\[%{POSINT:syslog_pid}\])?: %{GREEDYDATATEST:syslog_message}",
        extra_patterns: "GREEDYDATATEST .*"
      }
      request.post({ url: url, body: formData, json: true }, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(body.config_ok).to.equal(true);
        expect(body.succeed).to.equal(true);
        expect(body.results.length).not.to.equal(0)
        done();
      });
    });

    it("work with a semi-working grok pattern", function (done) {
      formData = {
        line: 'Dec 23 12:11:43 louis postfix/smtpd[31499]: connect from unknown[95.75.93.154]',
        grok_pattern: "%{SYSLOGTIMESTAMP:syslog_timestamp} %{SYSLOGHOST:syslog_hostname} %{NUMBER:syslog_program}(?:\[%{POSINT:syslog_pid}\])?: %{GREEDYDATA:syslog_message}"
      }
      request.post({ url: url, body: formData, json: true }, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(body.config_ok).to.equal(true);
        expect(body.succeed).to.equal(true);
        expect(body.results.length).not.to.equal(0)
        done();
      });
    });

    it("work with a bad grok pattern", function (done) {
      formData = {
        line: 'Dec 23 12:11:43 louis postfix/smtpd[31499]: connect from unknown[95.75.93.154]',
        grok_pattern: "^%{NUMBER:syslog_program}(?:\[%{POSINT:syslog_pid}\])?: %{GREEDYDATA:syslog_message}"
      }
      request.post({ url: url, body: formData, json: true }, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(body.config_ok).to.equal(true);
        expect(body.succeed).to.equal(true);
        expect(body.results.length).not.to.equal(0)
        done();
      });
    });

    it("don't work with missing parameters", function (done) {
      formData = {
      }
      request.post({ url: url, body: formData, json: true }, function (error, response, body) {
        expect(response.statusCode).to.not.equal(200);
        expect(body.config_ok).to.equal(false);
        expect(body.succeed).to.equal(false);
        done();
      });
    });

  });

  describe("/guess_config", function () {

    var url = "http://localhost:8081/guess_config";

    it("guess for a classical log file input", function (done) {
      formData = {
        input_data: "hi\nho\nha\nhou\nlol"
      }
      request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(body.config_ok).to.equal(true);
          expect(body.succeed).to.equal(true);
          expect(body.logstash_filter).to.equal('filter {\n\n  grok {\n    match => {\n      "message" => "%{GREEDYDATA:text}"\n    }\n  }\n}')
          expect(body.custom_codec).to.equal('')
          done();
      });
    });

    it("guess for an uploaded log file", function (done) {
      var filehash = "BBB720F871674C18E5FECFF61D92C1355CD4BFAC25699FB7DDFE7717C9669B4D085193982402156122DFAA706885FD64741704649795C65B2A5BDEC40347E28A";

      formDataInitial = {
        hash: filehash,
        file_content: "hi\nho\nha\nhou\nlol"
      }
      request.post({ url: "http://localhost:8081/file/upload", body: formDataInitial, json: true }, function (error, response, body) {
        expect(error).to.equal(null)

        formData = {
          filehash: filehash
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body.config_ok).to.equal(true);
            expect(body.succeed).to.equal(true);
            expect(body.logstash_filter).to.equal('filter {\n\n  grok {\n    match => {\n      "message" => "%{GREEDYDATA:text}"\n    }\n  }\n}')
            expect(body.custom_codec).to.equal('')
            done();
        });
      });
      
    });

  });


  describe("/config", function () {

    describe("/store", function () {

      var url = "http://localhost:8081/config/store";
  
      it("store a config", function (done) {
        formData = {
          hash: "fds",
          config: "my full config"
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(body.config_ok).to.equal(true);
          expect(body.succeed).to.equal(true);
          done();
        });
      });
  
    });

    describe("/get", function () {

      var url = "http://localhost:8081/config/get";
  
      it("get a non-existing config", function (done) {
        formData = {
          hash: "fds_unknown"
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(body.config_ok).to.equal(true);
          expect(body.succeed).to.equal(false);
          done();
        });
      });

      it("get with no parameters", function (done) {
        formData = {
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(response.statusCode).not.to.equal(200);
          expect(body.config_ok).to.equal(false);
          done();
        });
      });

      it("get an existing config", function (done) {
        formDataInitial = {
          hash: "superhash",
          config: "my full config abc"
        }
        request.post({ url: "http://localhost:8081/config/store", body: formDataInitial, json: true }, function (error, response, body) {
          expect(error).to.equal(null)

          formData = {
            hash: "superhash"
          }
          request.post({ url: url, body: formData, json: true }, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body.config_ok).to.equal(true);
            expect(body.succeed).to.equal(true);
            expect(body.config.value).to.equal(formDataInitial.config);
            done();
          });
        });
        
      });
  
    });

  });

  describe("/file", function () {

    describe("/upload", function () {

      var url = "http://localhost:8081/file/upload";
  
      it("store a logfile", function (done) {
        formData = {
          hash: "1F9720F871674C18E5FECFF61D92C1355CD4BFAC25699FB7DDFE7717C9669B4D085193982402156122DFAA706885FD64741704649795C65B2A5BDEC40347E28A",
          file_content: "my log file content\n and another line"
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(body.config_ok).to.equal(true);
          expect(body.succeed).to.equal(true);
          done();
        });
      });
  
    });

    describe("/exists", function () {

      var url = "http://localhost:8081/file/exists";
  
      it("check existance for a non-existing logfile", function (done) {
        formData = {
          hash: "random_nonexistant_hash"
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(body.config_ok).to.equal(true);
          expect(body.succeed).to.equal(true);
          expect(body.exists).to.equal(false);
          done();
        });
      });

      it("check existance of existing file", function (done) {
        formData = {
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(response.statusCode).not.to.equal(200);
          expect(body.config_ok).to.equal(false);
          done();
        });
      });

      it("assert existance of an existing logfile", function (done) {
        var filehash = "AAA720F871674C18E5FECFF61D92C1355CD4BFAC25699FB7DDFE7717C9669B4D085193982402156122DFAA706885FD64741704649795C65B2A5BDEC40347E28A";

        formDataInitial = {
          hash: filehash,
          file_content: "my log file content\n and another line\nand another"
        }
        request.post({ url: "http://localhost:8081/file/upload", body: formDataInitial, json: true }, function (error, response, body) {
          expect(error).to.equal(null)

          formData = {
            hash: filehash
          }
          request.post({ url: url, body: formData, json: true }, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body.config_ok).to.equal(true);
            expect(body.succeed).to.equal(true);
            expect(body.exists).to.equal(true);
            done();
          });
        });
        
      });
  
    });

  });


});
