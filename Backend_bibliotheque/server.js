const app = require("./app");
const syncDatabase = require("./utils/syncDatabase");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

syncDatabase()
  .then(() => {
    console.log("Base de données synchronisée");
    app.listen(PORT, () => {
      console.log(`Serveur lancé sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      "Impossible de démarrer le serveur à cause d'une erreur de base de données:",
      error,
    );
    process.exit(1);
  });
