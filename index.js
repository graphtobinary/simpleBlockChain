const crypto = require("crypto");

class Transaction {
  constructor(amount, senderPublicKey, recieverPublicKey) {
    this.amount = amount;
    this.senderPublicKey = senderPublicKey;
    this.recieverPublicKey = recieverPublicKey;
  }

  // convert the data of the class to json so that
  // it can be converted into a hash
  toString() {
    return JSON.stringify(this);
  }
}

class Block {
  constructor(previousHash, transaction, timestamp = Date.now()) {
    this.previousHash = previousHash;
    this.transaction = transaction;
    this.timestamp = timestamp;
  }

  getHash() {
    const json = JSON.stringify(this);
    const hash = crypto.createHash("SHA256");
    hash.update(json).end();
    const hex = hash.digest("hex");
    return hex;
  }

  toString() {
    return JSON.stringify(this);
  }
}

class Chain {
  static instance = new Chain();

  // initializing our chain with no records
  constructor() {
    this.chain = [new Block("", new Transaction(100, "temp", "temp"))];
  }

  getPreviousBlockHash() {
    // sending the entire block itself
    return this.chain[this.chain.length - 1].getHash();
  }

  insertBlock(transaction, senderPublicKey, sig) {
    // create verifier
    const verify = crypto.createVerify("SHA256");
    // add the transaction JSON
    verify.update(transaction.toString());

    // Verify it with the sender's public key
    const isValid = verify.verify(senderPublicKey, sig);

    if (isValid) {
      const block = new Block(this.getPreviousBlockHash(), transaction);
      console.log("Block added", block.toString());
      this.chain.push(block);
    }
  }
}

class Wallet {
  constructor() {
    const keys = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    this.privateKey = keys.privateKey;
    this.publicKey = keys.publicKey;
  }

  send(amount, recieverPublicKey) {
    const transaction = new Transaction(
      amount,
      this.publicKey,
      recieverPublicKey
    );
    const shaSign = crypto.createSign("SHA256");
    // add the transaction json
    shaSign.update(transaction.toString()).end();
    // sign the SHA with the private key
    const signature = shaSign.sign(this.privateKey);
    Chain.instance.insertBlock(transaction, this.publicKey, signature);
  }
}

const prashant = new Wallet();
const mudit = new Wallet();
const satu = new Wallet();

prashant.send(50, mudit.publicKey);
mudit.send(23, satu.publicKey);
satu.send(5, prashant.publicKey);

console.log(Chain.instance);