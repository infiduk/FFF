const moment = require('./moment');
const crypto = require('crypto');

const hash = crypto.createHash('sha256')

async function generate() {
    try {
        const now = moment().format("x")
        const random = await crypto.randomBytes(256);
        hash.update(now + random.toString('hex'));
        const index = hash.digest('hex')
        console.log(index);
    } catch (err) {
        console.log(err);
    }
}

module.exports = generate();