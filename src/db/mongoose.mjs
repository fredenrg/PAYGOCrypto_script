import mongoose, { connect } from "mongoose";

mongoose.set("strictQuery", false);
connect(process.env.PAYGO_MONGODB_URL);
