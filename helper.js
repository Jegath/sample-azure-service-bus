import { ServiceBusClient } from "@azure/service-bus";
import pg from "pg";
import { dbConnectionString } from "./secrets.js";

const pgClient = new pg.Client(dbConnectionString);
pgClient.connect();

export async function serviceBusSender(connectionString, queueName, messages) {
  // create a Service Bus client using the connection string to the Service Bus namespace
  const sbClient = new ServiceBusClient(connectionString);
  // createSender() can also be used to create a sender for a topic.
  const sender = sbClient.createSender(queueName);

  try {
    // Tries to send all messages in a single batch.
    // Will fail if the messages cannot fit in a batch.
    // await sender.sendMessages(messages);

    // create a batch object
    let batch = await sender.createMessageBatch();
    for (let i = 0; i < messages.length; i++) {
      // for each message in the array

      // try to add the message to the batch
      if (!batch.tryAddMessage(messages[i])) {
        // if it fails to add the message to the current batch
        // send the current batch as it is full
        await sender.sendMessages(batch);

        // then, create a new batch
        batch = await sender.createMessageBatch();

        // now, add the message failed to be added to the previous batch to this batch
        if (!batch.tryAddMessage(messages[i])) {
          // if it still can't be added to the batch, the message is probably too big to fit in a batch
          throw new Error("Message too big to fit in a batch");
        }
      }
    }

    // Send the last created batch of messages to the queue
    await sender.sendMessages(batch);
    console.log(`Sent a batch of messages to the queue: ${queueName}`);

    // Close the sender
    await sender.close();
  } finally {
    await sbClient.close();
  }
}

export async function serviceBusReciever(connectionString, queueName) {
  // create a Service Bus client using the connection string to the Service Bus namespace
  const sbClient = new ServiceBusClient(connectionString);
  // createReceiver() can also be used to create a receiver for a subscription.
  const receiver = sbClient.createReceiver(queueName);

  //   console.log(connectionString);
  //   console.log(queueName);
  //   console.log(receiver);

  // function to handle messages
  const myMessageHandler = async (messageReceived) => {
    // console.log(`Received message: ${messageReceived.body}`);
    try {
      let json = JSON.parse(messageReceived.body);
      json = json["custom_json_data"];
      //   console.log(json);
      var query =
        "insert into todos (id,userid,title,completed) values ($1,$2,$3,$4)";
      pgClient.query(query, [
        json["id"],
        json["userId"],
        json["title"],
        json["completed"],
      ]);
    } catch (err) {
      //   pgClient.end();
      console.log(err);
    }
  };

  // function to handle any errors
  const myErrorHandler = async (error) => {
    console.log(error);
  };

  // subscribe and specify the message and error handlers
  receiver.subscribe({
    processMessage: myMessageHandler,
    processError: myErrorHandler,
  });

  // Waiting long enough before closing the sender to send messages
  // await delay(5000);
  //   pgClient.end();
  // await receiver.close();
  // await sbClient.close();
}
