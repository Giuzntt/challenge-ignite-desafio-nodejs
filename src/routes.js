import { Database } from "./database.js";
import { randomUUID } from "crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: async (req, res) => {
      const { search } = req.query;

      const users = await database.select(
        "tasks",
        search ? { name: search, email: search } : null
      );
      res.setHeader("Content-Type", "application/json");

      return res.end(JSON.stringify(users));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: async (req, res) => {
      res.writeHead(201, { "Content-Type": "application/json" });
      const { title, description } = req.body;

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      database.insert("tasks", task);

      return res.end("Criação de Usuários");
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/task/:id"),
    handler: async (req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      const { id } = req.params;

      const task = await database.select("tasks", { id });

      if (task.length === 0) {
        return res.end("Task não encontrada");
      }

      database.delete("tasks", id);

      return res.end("Task deletada!");
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/task/:id"),
    handler: async (req, res) => {
      const { id } = req.params;

      res.writeHead(201, { "Content-Type": "application/json" });
      const { title, description, completed_at, created_at } = req.body;

      const existingTask = await database.select("tasks", { id });

      if (existingTask.length === 0) {
        return res.end("Tarefa não encontrada");
      }

      const updatedTask = {
        ...existingTask[0],
        title,
        description,
        completed_at: completed_at || existingTask[0].completed_at,
        created_at: created_at || existingTask[0].created_at,
        updated_at: new Date().toISOString(),
      };

      database.update("tasks", id, updatedTask);

      return res.end("Tarefa atualizada");
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/task/:id/complete"),
    handler: async (req, res) => {
      const { id } = req.params;

      res.writeHead(201, { "Content-Type": "application/json" });

      const existingTask = await database.select("tasks", { id });

      if (existingTask[0].completed_at) {
        return res.end("Tarefa já completada");
      }

      if (existingTask.length === 0) {
        return res.end("Tarefa não encontrada");
      }

      const updatedTask = {
        ...existingTask[0],
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      database.update("tasks", id, updatedTask);

      return res.end("Tarefa Completada!");
    },
  },
];
