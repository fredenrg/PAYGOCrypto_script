import "dotenv/config";
import "../db/mongoose.mjs";

import { spawn } from "child_process";
import { Keypair, Server } from "stellar-sdk";

import { fetchDevice } from "../services/fetchDevice.mjs";
import { getMemo } from "../services/getMemo.mjs";
import { getNumOfDays } from "../services/getNumOfDays.mjs";
import { parseEventMessage } from "../services/parseEventMessage.mjs";
import { isUSDC } from "../validators/isUSDC.mjs";
import { pythonPath } from "../constants/variables.mjs";
import { generateInputObject } from "../services/generateInputObject.mjs";
import EventSource from "eventsource";
import { isSubValid } from "../validators/isSubValid.mjs";
import { sendTransaction } from "../services/sendTransaction.mjs";
import { saveTransaction } from "../services/saveTransaction.mjs";
import { parsePythonData } from "../services/parsePythonData.mjs";
import { updateDevice } from "../services/updateDevice.mjs";
import { getTransObj } from "../services/getTransObj.mjs";
// NOTE: Don't delete
import { Customer } from "../models/customer.mjs";
import { fetchPaymentPlan } from "../services/fetchPaymentPlan.mjs";

const generatePaygoToken = async () => {
  const server = new Server("https://horizon.stellar.org");
  const sourceKeys = Keypair.fromSecret(process.env.PAYGO_ACCOUNT_SECRET_KEY);
  const es = new EventSource(
    `https://horizon.stellar.org/accounts/${process.env.PAYGO_ACCOUNT_PUBLIC_KEY}/payments?cursor=now`
  );

  es.onmessage = async function (message) {
    console.log("Event received...");
    let transObj;

    try {
      const result = parseEventMessage(message);

      if (result.from === sourceKeys.publicKey()) return;

      const usdc = isUSDC(result);

      const memo = await getMemo(result.transaction_hash);

      console.log(memo);

      const device = await fetchDevice(memo);

      const paymentPlan = await fetchPaymentPlan(device?.PaymentPlan);

      const days = getNumOfDays(+result.amount, paymentPlan);

      const isValid = isSubValid(usdc, device, days, memo);

      if (!isValid[0]) {
        transObj = getTransObj(result, "script<->refund");

        await sendTransaction(transObj, isValid[1]);
        console.log("refunded, transaction sent...");

        await saveTransaction(result, isValid[1], device, "refunded");
        return;
      }

      const inputObject = generateInputObject(device, days);

      const childPython = spawn("python3", [pythonPath, inputObject]);

      childPython.stdout.on("data", async (data) => {
        const pythonData = parsePythonData(data);

        const token = pythonData[2];
        const count = pythonData[6];
        let memo = `${days} day${days > 1 ? "s" : ""} token: ${token}`;

        transObj = getTransObj(result, "sript->customer", device);

        await sendTransaction(transObj, memo);
        console.log("successful, transaction sent to customer...");

        if (device.Customer.wallet !== result.from) {
          transObj = getTransObj(result, "sript->sender", device);

          await sendTransaction(transObj, memo);
          console.log("successful, transaction sent to sender...");
        }

        // 3. send distributor transaction (payment)
        transObj = getTransObj(result, "sript->distributor", device);
        memo = `${device.Plan} plan % revenue`;
        let res = await sendTransaction(transObj, memo, "sript->distributor");
        console.log("successful, transaction sent to distributor...");

        // 4. save customer transaction.
        memo = `${days} day${days > 1 ? "s" : ""} token: ${token}`;
        await saveTransaction(result, memo, device, "successful", token);
        console.log("successful, customer, transaction saved...");

        // 5. TODO: save distributor transaction in another schema.
        // memo = `${device.Plan} plan % revenue`;
        // res = { ...res, amount: transObj.amount };
        // await saveTransaction(res, memo, device, "successful", token);
        // console.log("successful, distributor transaction saved...");

        // 6. update device total amount and count
        await updateDevice(device, count, result.amount);
        console.log("successful, device updated...");
      });
      childPython.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });
      childPython.on("close", (code) => {
        console.log("childPython closed on code", code);
      });
    } catch (err) {
      console.log("main.mjs...", err.message);
    }
  };
};

generatePaygoToken();
