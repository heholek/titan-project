var expect = require("chai").expect;
var request = require("request");

const MAX_TIMEOUT = 60000;

describe("API Testing", function () {



  describe("Root page", function () {

    var url = "http://localhost:8081/";

    it("returns status 200", function (done) {
      request(url, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

  });



  describe("Start process", function () {

    var url = "http://localhost:8081/start_process";

    describe("with bad parameters", function () {
      this.timeout(MAX_TIMEOUT);

      it("returns status 200", function (done) {
        formData = {
          input_data: "hi\nho\nha\nhou\nlol",
          logstash_filter: "filter mutate{add_field=>{'test'=> 'test2'}}}"
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          done();
        });
      });

      it("should be succeed", function (done) {
        formData = {
          input_data: "hi\nho\nha\nhou\nlol",
          logstash_filter: "filter mutate{add_field=>{'test'=> 'test2'}}}"
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(body.succeed).to.equal(true);
          done();
        });
      });

      it("should't have anything related to data in the output'", function (done) {
        formData = {
          input_data: "hi\nho\nha\nhou\nlol",
          logstash_filter: "filter mutate{add_field=>{'test'=> 'test2'}}}"
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(body.job_result.status).not.to.equal(0);
          expect(body.job_result.stdout).not.to.match(/hou/);
          expect(body.job_result.stdout).not.to.match(/test2/);

          done();
        });
      });

    });



    describe("with good parameters", function () {
      this.timeout(MAX_TIMEOUT);

      it("returns status 200", function (done) {
        formData = {
          input_data: "hi\nho\nha\nhou\nlol",
          logstash_filter: "filter{mutate{add_field=>{'test'=> 'test2'}}}"
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          done();
        });
      });

      it("should be succeed", function (done) {
        formData = {
          input_data: "hi\nho\nha\nhou\nlol",
          logstash_filter: "filter{mutate{add_field=>{'test'=> 'test2'}}}"
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(body.succeed).to.equal(true);
          done();
        });
      });

      it("should have the right output", function (done) {
        formData = {
          input_data: "hi\nho\nha\nhou\nlol",
          logstash_filter: "filter{mutate{add_field=>{'test'=> 'test2'}}}"
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(body.job_result.status).to.equal(0);
          expect(body.job_result.stdout).to.match(/hou/);
          expect(body.job_result.stdout).to.match(/test2/);

          done();
        });
      });

    });



    describe("without parameters", function () {

      it("returns status 400", function (done) {
        formData = {
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(response.statusCode).to.equal(400);
          done();
        });
      });

      it("should be failed", function (done) {
        formData = {
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(body.succeed).to.equal(false);
          done();
        });
      });

      it("should give the missings parameters", function (done) {
        formData = {
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(body.missing_fields.length).to.equal(2);
          expect(body.missing_fields).to.contain("logstash_filter");
          expect(body.missing_fields).to.contain("input_data");

          done();
        });
      });

    });



    describe("with missing parameters", function () {

      it("returns status 400", function (done) {
        formData = {
          input_data: "hi\nho\nha\nhou\nlol"
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(response.statusCode).to.equal(400);
          done();
        });
      });

      it("should be failed", function (done) {
        formData = {
          input_data: "hi\nho\nha\nhou\nlol"
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(body.succeed).to.equal(false);
          done();
        });
      });

      it("should give the missings parameters", function (done) {
        formData = {
          input_data: "hi\nho\nha\nhou\nlol"
        }
        request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(body.missing_fields.length).to.equal(1);
          expect(body.missing_fields).to.contain("logstash_filter");
          expect(body.missing_fields).not.to.contain("input_data");

          done();
        });
      });

    });


  });

});