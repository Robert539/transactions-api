const express = require("express");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());

const baseTransacoes = {
  transactions: [
    {
      id: "uuid",
      title: "Salário",
      value: 4000,
      type: "income",
    },
    {
      id: "uuid",
      title: "Freela",
      value: 2000,
      type: "income",
    },
    {
      id: "uuid",
      title: "Pagamento da fatura",
      value: 4000,
      type: "outcome",
    },
  ],
  balance: {
    income: 0,
    outcome: 0,
    total: 0,
  },
};

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

function validateContents(request, response, next) {
  const { title, value, type } = request.body;

  if (!title) {
    return response.status(400).json({ error: `Título não informado` });
  } else if (!value) {
    return response.status(400).json({ error: `Valor não informado` });
  } else if (!type) {
    return response.status(400).json({ error: `Tipo não informado` });
  }
  next();
}

function createBalance(objetoPassado) {
  objetoPassado.balance.income = 0;
  objetoPassado.balance.outcome = 0;
  objetoPassado.balance.total = 0;

  const entradas = objetoPassado.transactions.reduce(
    (acl, vlrAt) => (vlrAt.type === "income" ? acl + vlrAt.value : acl),
    0
  );
  objetoPassado.balance.income = entradas;

  const saidas = objetoPassado.transactions.reduce(
    (acl, vlrAt) => (vlrAt.type === "outcome" ? acl + vlrAt.value : acl),
    0
  );
  objetoPassado.balance.outcome = saidas;

  const total = entradas - saidas;
  objetoPassado.balance.total = total;
}

app.use(logRequest);

//Metodo de listar transações

app.get("/transactions", (request, response) => {
  const { title, value } = request.query;

  const importTransacoes = baseTransacoes.transactions;

  createBalance(baseTransacoes);

  const results = title
    ? importTransacoes.filter((transaction) => transaction.include(title))
    : importTransacoes;

  return response.status(200).json(baseTransacoes);
});

//Metodo de criar transações

app.post("/transactions", validateContents, (request, response) => {
  const { title, value, type } = request.body;

  const transaction = { id: uuid(), title, value, type };

  transaction.push(transaction);

  return response.status(201).json(transaction);
});

//Metodo de atualizar transações

app.put(
  "/transactions/:id",
  validateTransactionId,
  validateContents,
  (request, response) => {
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
  }
);

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
