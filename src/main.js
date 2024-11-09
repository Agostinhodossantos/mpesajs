import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { Client } from "../payment/client.js";
import { SANDBOX, PRODUCTION } from "../payment/constants.js";

dotenv.config();

const client = new Client({
  apiKey: process.env.API_KEY,
  publicKey: process.env.PUBLIC_KEY,
  serviceProviderCode: process.env.SERVICE_PROVIDER_CODE,
  // initiatorIdentifier: '<REPLACE>', // Initiator Identifier,
  // securityIdentifier: '<REPLACE>',  // Security Credential
  // timeout: '<REPLACE>',             // time in seconds
  debugging: false,
  verifySSL: false,
    timeout: 50,
  // userAgent: '<REPLACE>',
  environment: PRODUCTION,
});

const app = express();

app.use(cors({
    origin: '*'
}));

app.use(
  express.json({
    limit: "15kb",
  })
);

app.get("/", (req, res) => {
    return res.send({status: "Hello World"})
})


app.post("/b2c", async  (req, res) => {
    const { amount, to, reference, transaction } = req.body;
    const paymentData = {
        to: to, // Customer MSISDN
        reference: reference, // Third Party Reference
        transaction: transaction, // Transaction Reference
        amount: amount, // Amount
    };

    await client
        .send(paymentData)
        .then((r) => {
            return res.status(200).send(r)
        })
        .catch((e) => {
            return res.status(500).send(e)
        });
})


app.post("/c2b", async (req, res) => {
  const { amount, from, reference, transaction } = req.body;
  const paymentData = {
    from: from, // Customer MSISDN
    reference: reference, // Third Party Reference
    transaction: transaction, // Transaction Reference
    amount: amount, // Amount
  };

   await client
      .receive(paymentData)
      .then((r) => {
          console.log(r)
        return res.status(200).send(r)
      })
    .catch((e) => {

        console.log("Error")
        console.log(e)
        return res.status(500).send(e)
    });
});


app.post("/query", async (req, res) => {
    const { reference, subject } = req.body;

    const reversionData = {
        reference: reference, // Third Party Reference
        subject: subject, // Query Reference
    };


    console.log(reversionData)

    try {
        await client
            .query(reversionData)
            .then((r) => {
                return res.status(200).send(r);
            })
            .catch((e) => {
                return res.status(500).send(e);
            });
    } catch (e) {
        return res.status(500).send({ error: e });
    }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Application is running on port ${port}`);
});
