const express = require("express");
const bodyparser = require("body-parser");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const validarCuerpo = require("./middlewares/valid.js");
const validarToken = require("./middlewares/token.js");
const cors = require("cors");
const bcrypt = require("bcrypt");
const PORT = 3000;

const app = express();
app.use(bodyparser.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Middleware para cargar usuarios y sitios desde el archivo JSON
const cargarDatos = () => JSON.parse(fs.readFileSync("data.json", "utf-8"));

// Registro de personas
app.post("/register", validarCuerpo, (req, res) => {
  const { email, password, name, phone } = req.body;
  const users = cargarDatos().users;

  // Verificar si el usuario ya existe
  const userExist = users.some((user) => user.email == email);
  if (userExist) {
    return res.status(409).send({ error: "El usuario ya existe." });
  }

  // Hash de la contraseña y guardar el nuevo usuario
  const hashPassword = bcrypt.hashSync(password, 10);
  const newUser = { email, password: hashPassword, name, phone, visits: [] };
  users.push(newUser);
  fs.writeFileSync("data.json", JSON.stringify({ users, sites }), "utf-8");

  res.status(200).send("Usuario añadido correctamente");
});

// Crear nuevo sitio
app.post("/sites", validarCuerpo, (req, res) => {
  const { name, address, reference, type } = req.body;
  const sites = cargarDatos().sites;

  // Agregar nuevo sitio
  const newSite = { name, address, reference, type, visitors: [] };
  sites.push(newSite);
  fs.writeFileSync("data.json", JSON.stringify({ users, sites }), "utf-8");

  res.status(200).send("Sitio añadido correctamente");
});

// Crear visita
app.post("/visits", validarToken, (req, res) => {
  const { email, siteId } = req.body;
  const { users, sites } = cargarDatos();
  const user = users.find((u) => u.email === email);
  const site = sites.find((s) => s.id === siteId);

  // Verificar si el usuario y el sitio existen
  if (!user || !site) {
    return res.status(404).json({ error: "Usuario o sitio no encontrado" });
  }

  // Registrar la visita
  user.visits.push(siteId);
  site.visitors.push(user.email);
  fs.writeFileSync("data.json", JSON.stringify({ users, sites }), "utf-8");

  res.status(200).send("Visita registrada correctamente");
});

// Ver cuantas personas han visitado un lugar
app.get("/sites/:siteId/visitors", (req, res) => {
  const { siteId } = req.params;
  const { sites } = cargarDatos();
  const site = sites.find((s) => s.id === siteId);

  if (!site) {
    return res.status(404).json({ error: "Sitio no encontrado" });
  }

  res.json({ totalVisitors: site.visitors.length });
});

// Ver cuantos lugares ha visitado una persona especifica
app.get("/users/:email/visited-sites", (req, res) => {
  const { email } = req.params;
  const { users } = cargarDatos();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  res.json({ totalVisitedSites: user.visits.length });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
