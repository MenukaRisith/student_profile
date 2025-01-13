require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs');

const app = express();
app.use(express.json());

const AES_KEY = process.env.AES_KEY || 'e8a7546332cc5fd4cf64cb8b3629017661a3a209bd730949e01f0f901ba8cf71';
const AES_IV = process.env.AES_IV || 'c8693d8a42b4c64df97de2e84c650a30';
const DATA_FILE = 'blockchain.json';

if (AES_KEY.length !== 64 || AES_IV.length !== 32) {
  console.error('[ERROR] AES_KEY must be 64 hex characters and AES_IV must be 32 hex characters.');
  process.exit(1);
}

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_profile',
});

function encryptData(data) {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(AES_KEY, 'hex'), Buffer.from(AES_IV, 'hex'));
  const jsonStr = JSON.stringify(data);
  let encrypted = cipher.update(jsonStr, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

function decryptData(encryptedBase64) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(AES_KEY, 'hex'), Buffer.from(AES_IV, 'hex'));
  let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

class Block {
  constructor(index, timestamp, data, previousHash, nonce, hash) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.hash = hash;
  }
}

class AdvancedBlockchain {
  constructor(difficulty = 3) {
    this.chain = [];
    this.currentData = [];
    this.difficulty = difficulty;
    this.loadChainFromFile();
  }

  saveChainToFile() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(this.chain, null, 2));
  }

  loadChainFromFile() {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      if (data.trim()) {
        const parsedChain = JSON.parse(data);
        this.chain = parsedChain.map(
          block => new Block(block.index, block.timestamp, block.data, block.previousHash, block.nonce, block.hash)
        );
      }
    }

    if (this.chain.length === 0) {
      const genesisBlock = this.createBlock('0', 0);
      this.chain.push(genesisBlock);
      this.saveChainToFile();
    }
  }

  createBlock(previousHash, nonceStart = 0) {
    const index = this.chain.length + 1;
    const timestamp = Date.now();
    const encryptedData = encryptData([...this.currentData]);
    this.currentData = [];
    const { validNonce, hash } = this.proofOfWork(index, timestamp, encryptedData, previousHash, nonceStart);
    return new Block(index, timestamp, encryptedData, previousHash, validNonce, hash);
  }

  proofOfWork(index, timestamp, encryptedData, previousHash, nonceStart) {
    let nonce = nonceStart;
    let hash = '';

    do {
      hash = this.calculateHash(index, timestamp, encryptedData, previousHash, nonce);
      nonce++;
    } while (!hash.startsWith('0'.repeat(this.difficulty)));

    return { validNonce: nonce - 1, hash };
  }

  calculateHash(index, timestamp, encryptedData, previousHash, nonce) {
    const payload = index + timestamp + encryptedData + previousHash + nonce;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  getLastBlock() {
    return this.chain.length ? this.chain[this.chain.length - 1] : null;
  }

  addCertificate(certData) {
    this.currentData.push(certData);
  }

  async mineBlock() {
    const lastBlock = this.getLastBlock();
    const previousHash = lastBlock ? lastBlock.hash : '0';
    const newBlock = this.createBlock(previousHash);
    this.chain.push(newBlock);
    this.saveChainToFile();

    for (const cert of this.currentData) {
      const { certId, studentId, issuedByUserId, issuedByName, dateIssued, description, behaviors, achievements, roles } = cert;
      await db.execute(
        'INSERT INTO certificates (certId, studentId, issuedByUserId, issuedByName, dateIssued, description, behaviors, achievements, roles, blockHash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          certId,
          studentId,
          issuedByUserId,
          issuedByName,
          dateIssued,
          description,
          JSON.stringify(behaviors || []),
          JSON.stringify(achievements || []),
          JSON.stringify(roles || []),
          newBlock.hash,
        ]
      );
    }

    return newBlock;
  }

  async verifyCertificate(certId) {
    const [results] = await db.query('SELECT * FROM certificates WHERE certId = ?', [certId]);
    return results.length ? results[0] : null;
  }

  isChainValid() {
    if (!this.chain.length) return false;

    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      const recalculated = this.calculateHash(current.index, current.timestamp, current.data, current.previousHash, current.nonce);

      if (recalculated !== current.hash || current.previousHash !== previous.hash || !current.hash.startsWith('0'.repeat(this.difficulty))) {
        return false;
      }
    }
    return true;
  }
}

const blockchain = new AdvancedBlockchain();

async function fetchStudentDetails(studentId) {
  const [behaviors] = await db.query(
    'SELECT type, description, date FROM behaviors WHERE studentId = ?',
    [studentId]
  );
  const [achievements] = await db.query(
    'SELECT description, date FROM achievements WHERE studentId = ?',
    [studentId]
  );
  const [roles] = await db.query(
    'SELECT roleName, societyName, yearAppointed, yearEnded FROM roles WHERE studentId = ?',
    [studentId]
  );

  return { behaviors, achievements, roles };
}

// API Routes
app.post('/issue', async (req, res) => {
  const { certId, studentId, issuedByUserId, issuedByName, dateIssued, description } = req.body;

  if (!certId || !studentId || !issuedByUserId || !issuedByName || !dateIssued || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [achievements] = await db.query('SELECT * FROM achievements WHERE studentId = ?', [studentId]);
    const [behaviors] = await db.query('SELECT * FROM behaviors WHERE studentId = ?', [studentId]);
    const [roles] = await db.query('SELECT * FROM roles WHERE studentId = ?', [studentId]);

    const certificateData = {
      certId,
      studentId,
      issuedByUserId,
      issuedByName,
      dateIssued,
      description,
      behaviors,
      achievements,
      roles,
    };

    blockchain.addCertificate(certificateData);
    const newBlock = await blockchain.mineBlock();

    await db.execute(
      'INSERT INTO certificates (certId, studentId, issuedByUserId, issuedByName, dateIssued, description, behaviors, achievements, societyDetails, blockHash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        certId,
        studentId,
        issuedByUserId,
        issuedByName,
        dateIssued,
        description,
        JSON.stringify(behaviors),
        JSON.stringify(achievements),
        JSON.stringify(roles),
        newBlock.hash,
      ]
    );

    res.status(201).json({ message: 'Certificate issued and block mined successfully', block: newBlock });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({ error: 'Failed to issue certificate' });
  }
});

app.get('/verify/:certId', async (req, res) => {
  const { certId } = req.params;
  try {
    const result = await blockchain.verifyCertificate(certId);

    if (result) {
      return res.status(200).json({
        message: 'Certificate verified',
        certificate: result,
      });
    }
    return res.status(404).json({ message: 'Certificate not found' });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return res.status(500).json({ error: 'Failed to verify certificate' });
  }
});

app.get('/chain', (req, res) => {
  res.json({
    chain: blockchain.chain,
    length: blockchain.chain.length,
    isChainValid: blockchain.isChainValid(),
  });
});

app.get('/certificates', async (req, res) => {
  try {
    const [certificates] = await db.query('SELECT * FROM certificates');
    res.status(200).json({
      message: 'Certificates retrieved successfully',
      certificates,
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Blockchain server running on port ${PORT}`);
});
