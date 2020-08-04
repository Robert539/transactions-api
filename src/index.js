const express = require("express");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());

const transactions = [];

function logRequest(request, response, next) {
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel);

  next();

  console.timeEnd(logLabel);
}

function validateTransactionId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response
      .status(400)
      .json({ error: `Param sent is not a valid UUID` });
  }

  next();
}

app.use(logRequest);

//Metodo de listar transações

app.get("/transactions", (request, response) => {
  const { title } = request.query;

  const results = title
    ? transactions.filter((transaction) => transaction.include(title))
    : transactions;

  return response.status(200).json(results);
});

//Metodo de criar transações

app.post("/transactions", (request, response) => {
  const { title, value, type } = request.body;

  const transaction = { id: uuid(), title, value, type };

  transactions.push(transaction);

  return response.status(201).json(transaction);
});

//Metodo de atualizar transações

app.put("/transactions/:id", validateTransactionId, (request, response) => {
  const { id } = request.params;

  const { title, value, type } = request.body;

  const transactionIndex = transactions.findIndex(
    (transaction) => transaction.id == id
  );

  if (transactionIndex < 0) {
    return response.status(404).json({ error: "transaction not found." });
  }

  const transaction = {
    id,
    title,
    value,
    type,
  };

  transactions[transactionIndex] = transaction;

  return response.status(202).json(transaction);
});

//Metodo de delete transações

app.delete("/transactions/:id", validateTransactionId, (request, response) => {
  const { id } = request.params;

  const transactionIndex = transactions.findIndex(
    (transaction) => transaction.id === id
  );

  if (transactionIndex < 0) {
    return response.status(404).json({ error: "transaction not found." });
  }

  transactions.splice(transactionIndex, 1);

  return response.status(204).send();
});

const port = 3333;

app.listen(3333, () => {
  console.log(`Server up and running on PORT ${port}`);
});
