import {
  Asset,
  Keypair,
  Memo,
  Networks,
  Operation,
  Claimant,
  Server,
  TransactionBuilder,
} from "stellar-sdk";

export const sendTransaction = async (
  { from: destination, asset_code, asset_issuer, amount },
  memo,
  type
) => {
  const server = new Server("https://horizon.stellar.org");
  const sourceKeys = Keypair.fromSecret(process.env.PAYGO_ACCOUNT_SECRET_KEY);

  const asset =
    asset_code && asset_issuer
      ? new Asset(asset_code, asset_issuer)
      : Asset.native();

  let attempt = 0;
  const maxRetries = 3;
  const retryDelay = 1000;

  const sourceAccount = await server.loadAccount(sourceKeys.publicKey());

  try {
    let transaction = new TransactionBuilder(sourceAccount, {
      fee: "100000",
      networkPassphrase: Networks.PUBLIC,
    });

    if (asset.issuer) {
      console.log("checking trustline...");
      const destinationAccount = await server.loadAccount(destination);
      const hasUSDCTrustline =
        destinationAccount.balances.filter(
          (bal) =>
            bal.asset_code === "USDC" &&
            bal.asset_issuer ===
              "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
        ).length > 0;
      console.log("trustline...", hasUSDCTrustline);
      if (hasUSDCTrustline) {
        console.log("sending direct payment...");
        transaction.addOperation(
          Operation.payment({ destination, asset, amount })
        );
      } else {
        console.log("sending claimable...");
        let userCond = Claimant.predicateUnconditional();
        let ownerCond = Claimant.predicateUnconditional();
        transaction.addOperation(
          Operation.createClaimableBalance({
            asset: new Asset(
              "USDC",
              "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
            ),
            amount: amount,
            claimants: [
              new Claimant(destination, userCond),
              new Claimant(sourceKeys.publicKey(), ownerCond),
            ],
          })
        );
      }
    } else {
      console.log("sending direct payment...");
      transaction.addOperation(
        Operation.payment({ destination, asset, amount })
      );
    }

    transaction.addMemo(Memo.text(memo));
    transaction.setTimeout(18640);
    transaction = transaction.build();
    transaction.sign(sourceKeys);

    const sendPayment = async () => {
      attempt++;
      try {
        const response = await server.submitTransaction(transaction);
        return response;
      } catch (err) {
        if (attempt < maxRetries) {
          console.log(
            err?.response?.data?.extras
              ? err?.response?.data?.extras?.result_codes
              : err?.response?.data,
            "retrying transaction:",
            attempt
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          await sendPayment();
        }
        throw err;
      }
    };

    return await sendPayment();
  } catch (err) {
    console.log(err.message, "sendTransaction.mjs...:");
    throw err;
  }
};
