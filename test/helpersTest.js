const { assert } = require('chai');

const { getUserByEmail } = require('../helpers');
const { urlsForUser } = require('../express_server');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const sampleUrlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "user1"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "user2"
  },
  "abc123": {
    longURL: "http://www.example.com",
    userId: "user1"
  }
};

describe('getUserByEmail', function() {
  it("should return a user object when provided with an email that exists in the database", function() { 
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID, "User ID should match expected ID");
    assert.strictEqual(user.email, "user@example.com", "Email should match provided email");
  });

  it("should return undefined when provided with an email that doesn't exist in the database", function() {
    const user = getUserByEmail("noemail@example.com", testUsers)
    assert.strictEqual(user, undefined, "Should return undefined for non-existent email");
  });
});

describe('urlsForUser', function() {
  it('should return urls that belong to the specified user', function() {
    const result = urlsForUser("user1", sampleUrlDatabase);
    const expected = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userId: "user1"
      },
      "abc123": {
        longURL: "http://www.example.com",
        userId: "user1"
      }
    };
    assert.deepEqual(result, expected);
  });

  it('should return an empty object if no urls belong to the specified user', function() {
    const result = urlsForUser("user3", sampleUrlDatabase);
    assert.deepEqual(result, {});
  });

  it('should return an empty object if the urlDatabase is empty', function() {
    const result = urlsForUser("user1", {});
    assert.deepEqual(result, {});
  });

  it('should not return any urls that do not belong to the specified user', function() {
    const result = urlsForUser("user2", sampleUrlDatabase);
    const notExpectedKey = "abc123";
    assert.notProperty(result, notExpectedKey);
  });
});