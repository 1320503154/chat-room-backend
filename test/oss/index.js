const OSS = require('ali-oss');
const dotenv = require('dotenv');
dotenv.config();
const client = new OSS({
  region: process.env.ALI_OSS_REGION,
  bucket: process.env.ALI_OSS_BUCKET,
  accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET,
});

async function put() {
  try {
    const result = await client.put('cat.png', './mao.png');
    console.log(result);
  } catch (e) {
    console.log(e);
  }
}

put();
