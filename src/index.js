const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userAlreadyExists = users.some((user) => user.username === username);
  if (!userAlreadyExists) {
    return response.status(404).json({ error: "Username not found" });
  }
  request.username = username;
  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);
  if (userAlreadyExists) {
    return response.status(400).json({ error: "Username already exists" });
  }
  const user = {
    id: uuidv4(),
    name,
    todos: [],
    username,
  };

  users.push(user);
  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const user = users.find((user) => user.username === username);
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  const user = users.find((user) => user.username === username);
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const user = users.find((user) => user.username === username);

  const todoAlreadyExists = user.todos.find((todo) => todo.id === id);
  if (!todoAlreadyExists) {
    return response.status(404).json({ error: "todo not found" });
  }

  const todo = user.todos.find((todo) => todo.id === id);

  Object.assign(todo, {
    title,
    deadline: new Date(deadline),
  });

  return response.status(201).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);

  const todoAlreadyExists = user.todos.find((todo) => todo.id === id);
  if (!todoAlreadyExists) {
    return response.status(404).json({ error: "todo not found" });
  }

  const todo = user.todos.find((todo) => todo.id === id);

  todo.done = true;
  return response.status(201).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);

  const todoAlreadyExists = user.todos.find((todo) => todo.id === id);
  if (!todoAlreadyExists) {
    return response.status(404).json({ error: "todo not found" });
  }

  const todo = user.todos.findIndex((todo) => todo.id === id);

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;
