/**
 * Tests the User schema
 */

var should = require("should");
var assert = require("assert");
var helper = require('./specHelper');

var ERRORS = require('../../public/scripts/errors');
var CONFIG = require('../../config');

//Connect to MongoDB
var mongoose = helper.mongoose;
var db = mongoose.connection;

//Require User Module, passing mongoose
var User = require("../../models/User")(mongoose);
var Listing = require("../../models/Listing")(mongoose);

var newBob = helper.newBob;

var emptyDoc = function(cb) {
  Listing.removeAll(function() {
    User.model.remove({}, function(err) {
      if (typeof cb === "function") {
        cb(err);
      }
    });
  });
};

describe("Listing Model", function() {

  before(function(done) {
    emptyDoc(done);
  });

  afterEach(function(done) {
    emptyDoc(done);
  });

  after(function(done) {
    emptyDoc(done);
  });

  var bob;

  beforeEach(function() {
    bob = newBob(true);
  });

  describe("Create", function() {
    it("should create a new listing associated with a user", function(done) {
      User.register(bob, function(response) {
        var listingData = {
          user: response.data.users[0]._id,
          location: 'Wilmington, Delaware',
          description: "Best place ever!"
        };
        Listing.create(listingData, function(resp) {
          (resp.error === null).should.be.ok;
          resp.data.listings.length.should.equal(1);
          resp.data.listings[0].user.should.equal(listingData.user);
          done();
        });
      });
    });

    it("should return an error if the location is not specified", function(done) {
      User.register(bob, function(response) {
        var listingData = {
          user: response.data.users[0]._id,
        };
        Listing.create(listingData, function(resp) {
          resp.error.should.equal(ERRORS.listing.location.missing);
          done();
        });
      });
    });

    it("should return an error if the user is not specified", function(done) {
      User.register(bob, function(response) {
        var listingData = {
          location: "Wilmington, Delaware"
        };
        Listing.create(listingData, function(resp) {
          resp.error.should.equal(ERRORS.listing.user.missing);
          done();
        });
      });
    });
  });

  describe("Search", function() {
    it("should return zero listings when no listings exist", function(done) {
      emptyDoc(function() {
        Listing.search({}, function(resp) {
          (resp.error === null).should.be.ok;
          resp.data.listings.length.should.equal(0);
          done();
        });
      });
    });

    it("should return a listing when one exists", function(done) {
      User.register(newBob(true), function(resp1) {
        var user = resp1.data.users[0];
        Listing.create({ 'user': user._id, location: "A"}, function() {

          Listing.search({}, function(resp) {
            resp.data.listings.length.should.equal(1);
            resp.data.listings[0].user.id.should.equal(user._id.toString());
            done();
          });

        });
      });
    });

    it("should return two listings when two listings exist from different users", function(done) {
      User.register(newBob(true), function(resp1) {
        var userA = resp1.data.users[0];
          Listing.create({ 'user': userA._id, location: "A"}, function() {
          User.register(newBob(true), function(resp2) {
            var userB = resp2.data.users[0];
            Listing.create({ 'user': userB._id, location: "B"}, function() {

              Listing.search({}, function(resp) {
                resp.data.listings.length.should.equal(2);
                done();
              });

            });
          });
        });
      });
    });

    it("should return only the given user's listings when their id is provided", function(done) {
      User.register(newBob(true), function(resp1) {
        var userA = resp1.data.users[0];
          Listing.create({ 'user': userA._id, location: "A"}, function() {
          User.register(newBob(true), function(resp2) {
            var userB = resp2.data.users[0];
            Listing.create({ 'user': userB._id, location: "B"}, function() {

              var criterion = {
                'user': userA._id
              };
              Listing.search(criterion, function(resp) {
                resp.data.listings.length.should.equal(1);
                resp.data.listings[0].user.id.should.equal(userA._id.toString());
                done();
              });

            });
          });
        });
      });
    });
  });
});
