import Express from "express";
import request from "request";
import path from "path";
import { serviceBusConnectionString, queueName } from "./secrets.js";
import { serviceBusSender, serviceBusReciever } from "./helper.js";

var __dirname = path.resolve();

const app = Express();
app.use(Express.static(__dirname + "/public"));
const port = "8080";

app.get("/", (req, res) => {
  serviceBusReciever(serviceBusConnectionString, queueName).catch((err) => {
    console.log("Error occurred: ", err);
  });
  res.sendFile("sender.html", { root: "./public" });
});

app.get("/send_todos", (req, res) => {
  let options = { json: true };

  let users_url = "https://jsonplaceholder.typicode.com/todos";

  let messages = [];

  request(users_url, options, (error, res, body) => {
    if (error) {
      return console.log(error);
    }

    if (!error && res.statusCode == 200) {
      for (let i = 0; i < body.length; i++) {
        messages.push({ body: JSON.stringify({ custom_json_data: body[i] }) });
      }
      serviceBusSender(serviceBusConnectionString, queueName, messages).catch(
        (err) => {
          console.log("Error occurred: ", err);
        }
      );
    }
  });
  res.contentType("json");
  res.send({ status: "success" });
});

app.listen(port, () => console.log("listening on port " + port));
