const { assert } = require('chai');

const { getUserByEmail } = require('../helpers');

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

describe('getUserByEmail', function() {
  it("should return a user object when provided with an email that exists in the database", function() { 
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
    assert.strictEqual(user.email, "user@example.com");
  });

  it("should return undefined when provided with an email that doesn't exist in the database", function() {
    const user = getUserByEmail("noemail@example.com", testUsers)
    assert.strictEqual(user, undefined);
  });
});