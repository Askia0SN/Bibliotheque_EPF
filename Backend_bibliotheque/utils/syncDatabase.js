const {
  sequelize,
  User,
  Category,
  Book,
  Member,
  Borrow,
} = require("../models");
const bcrypt = require("bcryptjs");

const syncDatabase = async () => {
  const syncOptions =
    process.env.SEQUELIZE_SYNC_FORCE === "true"
      ? { force: true }
      : { alter: true };
  const maxAttempts = 3;
  let attempt = 0;

  try {
    while (attempt < maxAttempts) {
      try {
        attempt += 1;
        // Synchroniser tous les modèles
        // { alter: true } modifie les tables existantes pour correspondre aux modèles
        // { force: true } supprime et recrée les tables (ATTENTION: perd les données!)
        await sequelize.sync(syncOptions);
        console.log(
          `✅ Base de données synchronisée avec succès (tentative ${attempt})`,
        );
        break;
      } catch (error) {
        if (
          error.parent &&
          error.parent.code === "ER_LOCK_DEADLOCK" &&
          attempt < maxAttempts
        ) {
          console.warn(
            `⚠️ Deadlock détecté, nouvelle tentative (${attempt}/${maxAttempts})...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        if (
          error.name === "SequelizeUnknownConstraintError" &&
          !syncOptions.force
        ) {
          console.warn(
            "⚠️ Contrainte inconnue détectée (books_ibfk_1). Tentative de synchronisation avec force.",
          );
          await sequelize.sync({ force: true });
          console.log(
            "✅ Base de données synchronisée avec succès en mode force",
          );
          break;
        }

        throw error;
      }
    }

    // Créer un utilisateur admin par défaut si aucun n'existe
    const userCount = await User.count();
    if (userCount === 0) {
      await User.create({
        name: "Administrateur",
        email: "admin@bibliotheque.com",
        password: "admin123",
      });
      console.log(
        "✅ Compte administrateur créé: admin@bibliotheque.com / admin123",
      );
    }

    // Créer quelques catégories par défaut
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
      const categories = [
        { name: "Roman", description: "Littérature romanesque" },
        { name: "Science", description: "Livres scientifiques" },
        { name: "Histoire", description: "Livres d'histoire" },
        { name: "Informatique", description: "Programmation et technologies" },
        { name: "Art", description: "Art, peinture, musique" },
      ];
      await Category.bulkCreate(categories);
      console.log("✅ Catégories par défaut créées");
    }

    console.log("✅ Initialisation de la base de données terminée");
  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation:", error);
    throw error;
  }
};

module.exports = syncDatabase;
