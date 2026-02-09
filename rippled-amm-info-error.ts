'use strict'

require('dotenv').config();
var xrpl = require('xrpl')
import {
    confirmAmm,
    createAmm,
    getAmmcost,
    get_new_token,
    AmmInfo
} from './lib/amm';
import {
  WS_URL
} from './util/consts';

async function main() {
  const client = new xrpl.Client(WS_URL);
  await client.connect()

  const wallet = (await client.fundWallet()).wallet

  const token_ETH_amount = await get_new_token(client, wallet, "USD", "100")
  const xrp_amount = {
    "value": xrpl.xrpToDrops(10),
    "issuer": null,
    "currency": null
  };

  const amm_fee_drops = await getAmmcost(client);

  await createAmm(client, wallet, token_ETH_amount, xrp_amount, amm_fee_drops)

  // create AMM Info
  const amm_info_request: AmmInfo = {
    "command": "amm_info",
    "asset": {
      "currency": token_ETH_amount.currency!,
      "issuer": token_ETH_amount.issuer!,
    },
    "asset2": {
      "currency": 'XRP'
    },
    "ledger_index": "current"
  }

  await confirmAmm(client, wallet, amm_info_request)

  setTimeout(async () => {
      await confirmAmm(client, wallet, amm_info_request);
      await client.disconnect()
  }, 10000);
}

main()
