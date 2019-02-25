const sqlite = require('sqlite')
const crypto = require('crypto')

let db = sqlite.open('./data/sqlite.db', { Promise });
function getDatabase() {
  return db;
}

getDatabase().then(db =>
  Promise.all([
    db.run(
      `CREATE TABLE IF NOT EXISTS tokens (
        id INTEGER PRIMARY KEY,
        token_value UNIQUE,
        expire_time,
        limit_money_ammout INTEGER,
        limit_used_times INTEGER,
        CHECK (limit_used_times >= 0)
      )`
    ),
    db.run(
      `CREATE TABLE IF NOT EXISTS wallets (
        id INTEGER PRIMARY KEY,
        zoop_buyer_id UNIQUE,
        android_id UNIQUE,
        saldo_cache,
        identification_json
      )`
    ),
    db.run(
      `CREATE TABLE IF NOT EXISTS wallets_tokens (
        id_token,
        id_wallet,
        FOREIGN KEY (id_token) REFERENCES tokens (id),
        FOREIGN KEY (id_wallet) REFERENCES wallets (id)
      )`
    )
  ])
)

function createToken(db, idWallet, tokenInfo = {expire_time, limit_money_ammout, limit_used_times}) {
  return new Promise(
    (resolve, reject) => crypto.randomBytes(128, async (err, buffer) => {
      if (err) return reject(err)

      tokenValue = buffer.toString('hex');
      expire_time = tokenInfo.expire_time || Date.now();
      limit_money_ammout = tokenInfo.limit_money_ammout || 1000;
      limit_used_times = tokenInfo.limit_used_times || 5;

      try {
        wallet = await db.get('SELECT * FROM wallets WHERE ? = id', [idWallet])
        await db.run(
          'INSERT INTO tokens (token_value, expire_time, limit_money_ammout, limit_used_times) VALUES (?, ?, ?, ?)',
          [ tokenValue, expire_time, limit_money_ammout, limit_used_times ]
        )
        token = await db.get('SELECT id FROM tokens WHERE ? = token_value', [tokenValue])
        const ret = await db.run(
          'INSERT INTO wallets_tokens (id_token, id_wallet) VALUES (?, ?)',
          [ token.id, idWallet ]
        )
        return resolve(
          await db.get('SELECT * FROM tokens WHERE token_value = ?', [ tokenValue ])
        )
      } catch (error) {
        return reject(error)
      }
    })
  )
}

async function spendToken(db, androidId, tokenValue, amount, p2pCallback) {
  // retrieve Wallet
  const receiverWallet = await db.get('SELECT * FROM wallets WHERE android_id = ?', [androidId])
  const senderToken = await db.get(
    `SELECT * FROM tokens WHERE limit_used_times > 0 AND expire_time >= ? AND
    token_value = ? AND limit_money_ammout >= ?`,
    [  Date.now(), tokenValue, amount ]
  )
  if (senderToken == null) {
    return Promise.reject('Não autorizado')
  }
  const senderWallet = await db.get('SELECT * FROM wallets JOIN wallets_tokens WHERE id_token = ?', [token.id])
  if (senderWallet == null) {
    return Promise.reject('Não autorizado')
  }

  try {
    await db.run('BEGIN TRANSACTION')
    await db.run(
      `UPDATE tokens
      SET limit_used_times = limit_used_times - 1
      WHERE id = ?`,
      [senderToken.id]
    )
    p2pCallback({
      to: receiverWallet.zoop_buyer_id,
      from: senderWallet.zoop_buyer_id,
      amount: amount
    })
    await db.run('COMMIT')
    return Promise.resolve({msg: 'Autorizado'});
  } catch (error) {
    await db.run('ROLLBACK')
    console.log({error})
    return Promise.reject({msg: 'Não autorizado', error});
  }
}

async function createWallet(db, androidId) {
  androidId = androidId || await new Promise((resolve, reject) => crypto.randomBytes(64, async (err, buffer) => {
    if (err) return reject(err)
    resolve(buffer.toString('hex'))
  }))
  try {
    await db.run(
      'INSERT INTO wallets (android_id, zoop_buyer_id, saldo_cache, identification_json) VALUES (?, ?, ?, ?)',
      [ androidId, null, null, null ]
    )
    wallet = await db.get(
      'SELECT * FROM wallets WHERE android_id = ?',
      [ androidId ]
    )
    return Promise.resolve(wallet)
  } catch (error) {
    return Promise.reject(error)
  }
}
async function updateWallet(db, androidId, zoopBuyerId, saldoCache, identificationJson) {
  try {
    await db.run(
      `UPDATE wallets SET
      android_id = ?,
      zoop_buyer_id = ?,
      saldo_cache = ?,
      identification_json = ?
      WHERE android_id = ?`,
      [ androidId, zoopBuyerId, saldoCache, identificationJson, androidId]
    )
    wallet = await db.get(
      'SELECT * FROM wallets WHERE android_id = ?',
      [ androidId ]
    )
    return Promise.resolve(wallet)
  } catch (error) {
    return Promise.reject(error)
  }
}


function test() {
  getDatabase().then(async (db) => {
    try {
      const w1 = await createWallet(db);
      // console.log({w1})
      const w2 = await createWallet(db);
      // console.log({w2})
      const token = await createToken(db, w1.id, {
        expire_time: Date.now() + (Date.parse('05 Jan 1970 00:00:00 GMT') - Date.parse('01 Jan 1970 00:00:00 GMT')),
        limit_money_ammout: 1500,
        limit_used_times: 10,
      })
      // console.log({token})
      const result = await spendToken(db, w2['android_id'], token['token_value'], 1000, () => true)
      console.log({'self-test': result})
    } catch (e) {
      console.log({'self-test-error': e})
    }
  })
}

test()

module.exports = {
  getDatabase,
  createToken,
  spendToken,
  createWallet,
  updateWallet,
};
