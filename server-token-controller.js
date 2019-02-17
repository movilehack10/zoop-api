const sqlite = require('sqlite')
const crypto = require('crypto')

const dbPromise = sqlite.open('./data/sqlite.db', { Promise });

dbPromise.then(db =>
  Promise.all([
    db.run(
      `CREATE TABLE IF NOT EXISTS tokens (
        id INTEGER PRIMARY KEY,
        tokenValue UNIQUE,
        expire_time,
        limit_money_ammout INTEGER,
        limit_used_times INTEGER
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
        FOREIGN KEY (id_token) REFERENCES token (id),
        FOREIGN KEY (id_token) REFERENCES token (id)
      )`
    )
  ])
)

function createToken(db, idWallet, tokenInfo = {expire_time, limit_money_ammout, limit_used_times}) {
  return new Promise(
    (resolve, reject) => crypto.randomBytes(128, async (err, buffer) => {
      if (err) return reject(err)

      tokenId = buffer.toString('hex');
      expire_time = tokenInfo.expire_time || Date.now();
      limit_money_ammout = tokenInfo.limit_money_ammout || 1000;
      limit_used_times = tokenInfo.limit_used_times || 5;

      try {
        wallet = await db.get('SELECT * FROM wallets WHERE ? = id', [idWallet])
        await db.run(
          'INSERT INTO tokens (tokenValue, expire_time, limit_money_ammout, limit_used_times) VALUES (?, ?, ?, ?)',
          [ tokenId, expire_time, limit_money_ammout, limit_used_times ]
        )
        token = await db.get('SELECT id FROM tokens WHERE ? = tokenValue', [tokenId])
        console.log({tokenId, wallet})
        await db.run(
          'INSERT INTO wallets_tokens (id_token, id_wallet) VALUES (?, ?)',
          [ tokenId, idWallet ]
        )
        return resolve(true)
      } catch (error) {
        return reject(error)
      }
    })
  )
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
  } catch (error) {
    return Promise.reject(error)
  }
}

function test() {
  sqlite.open('./data/sqlite.db', { Promise }).then(async (db) => {
    await createWallet(db);
    await createToken(db, wallet.id, {}).catch(e => console.log({'catch': e})).then(e => console.log({'result': e}))
  })
}

// module.exports = {
//   newWallet: newWallet
// };
