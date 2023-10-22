// @ts-nocheck
const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

let _CURRENT_TOKEN_ID = 1;
/**
 * generates a new token id for each it block
 * @returns {number}
 */
function getGlobalTokenId() {
  return _CURRENT_TOKEN_ID++;
}

describe("StarNotary tests", function () {
  let instance;
  beforeEach(async () => {
    instance = await StarNotary.deployed();
  });
  it("can Create a Star", async () => {
    let tokenId = getGlobalTokenId();
    await instance.createStar("Awesome Star!", tokenId, "", {
      from: accounts[0]
    });
    let star = await instance.tokenIdToStarInfo.call(tokenId);
    assert.equal(star.name, "Awesome Star!");
    assert.equal(star.symbol, "SNT");
  });

  it("can Create a star with different symbol", async () => {
    let tokenId = getGlobalTokenId();
    await instance.createStar("Awesome Star!", tokenId, "EZ", {
      from: accounts[0]
    });
    let star = await instance.tokenIdToStarInfo.call(tokenId);
    assert.equal(star.name, "Awesome Star!");
    assert.equal(star.symbol, "EZ");
  });

  it("lets user1 put up their star for sale", async () => {
    let user1 = accounts[1];
    let starId = getGlobalTokenId();
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar("awesome star", starId, "", { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    assert.equal(await instance.starsForSale.call(starId), starPrice);
  });

  it("lets user1 get the funds after the sale", async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = getGlobalTokenId();
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar("awesome star", starId, "", { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, { from: user2, value: balance });
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
  });

  it("lets user2 buy a star, if it is put up for sale", async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = getGlobalTokenId();
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar("awesome star", starId, "", { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance });
    assert.equal(await instance.ownerOf.call(starId), user2);
  });

  // Implement Task 2 Add supporting unit tests

  it("can add the star name and star symbol properly", async () => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let starId = getGlobalTokenId();
    let name = "STAR";
    let user1 = accounts[1];
    await instance.createStar(name, starId, "", { from: user1 });
  });

  it("lets 2 users exchange stars", async () => {
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed
    let starId1 = getGlobalTokenId();
    let starId2 = getGlobalTokenId();
    let owner1 = accounts[1];
    console.log("$ ~ file: TestStarNotary.js:124 ~ it ~ owner1:", owner1);
    let owner2 = accounts[2];
    console.log("$ ~ file: TestStarNotary.js:126 ~ it ~ owner2:", owner2);

    await instance.createStar("Star1", starId1, "", { from: owner1 });
    await instance.createStar("Star2", starId2, "", { from: owner2 });
    assert.equal(await instance.ownerOf.call(starId1), owner1);
    assert.equal(await instance.ownerOf.call(starId2), owner2);

    await instance.exchangeStars(starId1, starId2, { from: owner1 });
    assert.equal(await instance.ownerOf.call(starId1), owner2);
    assert.equal(await instance.ownerOf.call(starId2), owner1);
  });

  it("lets a user transfer a star", async () => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
    let starId = getGlobalTokenId();
    await instance.createStar("Test transfer", starId, "", {
      from: accounts[0]
    });
    await instance.transferStar(accounts[1], starId, { from: accounts[0] });
    assert.equal(await instance.ownerOf.call(starId), accounts[1]);
  });

  it("lookUptokenIdToStarInfo test", async () => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    let starId = getGlobalTokenId();
    await instance.createStar("Harsheet's star", starId, "", {
      from: accounts[0]
    });

    let starName = await instance.lookUptokenIdToStarInfo.call(starId);
    assert.equal(starName, "Harsheet's star");
  });
});
