## Description

Demo node application to send and recieve data to azure service bus.

The data is taken from https://jsonplaceholder.typicode.com/todos, and is in json format which is sent to service bus. The reciever application will revieve the json data/message and insert the data to postgres database

### Input data sample

{
"userId": 1,
"id": 1,
"title": "delectus aut autem",
"completed": false
}

### Final data output in db

| id  | userid | title              | completed |
| --- | ------ | ------------------ | --------- |
| 1   | 1      | delectus aut autem | false     |

#### Notes

<mark>This is not a production ready code<mark>

To build and run the application a secrets.js file should be created in the root directory and the following contents needs to be added

```
export const serviceBusConnectionString = "connection-string";
export const queueName = "queue-name";
export const dbConnectionString = "db-connection-string";
```

1. Using the provided Dockerfile the application can be built

   ```
   docker build -t job-challenge:latest Dockerfile
   ```

2. To run the application
   ```
   docker run --name app -d -p 8080:8080 job-challenge:todo
   ```
