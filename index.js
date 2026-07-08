const axios = require("axios");
const fs = require("fs");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const PRODUCT_URL =
  "https://porima3d.com/products/porima-xpla-filament.js";

const STATE_FILE = "state.json";

async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await axios.post(url, {
    chat_id: CHAT_ID,
    text: message,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveState(state) {
  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify(state, null, 2)
  );
}

async function getProduct() {
  const { data } = await axios.get(PRODUCT_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  return data;
}

function isEcoVariant(title) {
  return title.toLowerCase().includes("eco");
}

(async () => {
  const state = loadState();

  const product = await getProduct();

  const variants = product.variants.filter(v =>
    isEcoVariant(v.title)
  );

  for (const variant of variants) {

    const inStock = variant.available;

    const key = variant.id.toString();

    if (!(key in state)) {
      state[key] = inStock;
      continue;
    }
