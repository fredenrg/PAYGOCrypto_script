import axios from "axios";

export const getMemo = async (transHash) => {
  const {
    data: { memo },
  } = await axios.get(`https://horizon.stellar.org/transactions/${transHash}`);

  return memo.split("-");
};
