const {
  sequelize,
  User,
  Category,
  Book,
  Member,
  Borrow,
} = require("../models");

const syncDatabase = async () => {
  // Mode "force": suppression/recréation totale. (Optionnel: SEQUELIZE_SYNC_FORCE=true)
  const forceSync = ["true", "1", "yes"].includes(
    String(process.env.SEQUELIZE_SYNC_FORCE ?? "")
      .trim()
      .toLowerCase(),
  );

  const normalizeTableName = (t) => {
    // Sequelize peut renvoyer soit une string, soit un objet { schema, tableName }.
    if (!t) return "";
    if (typeof t === "string") return t;
    return (
      t.tableName ||
      t.TABLE_NAME ||
      t.table_name ||
      // Fallback: prend la première valeur du mapping (ex: { Tables_in_xxx: 'users' })
      (Object.values(t)[0] ? String(Object.values(t)[0]) : "")
    );
  };

  try {
    await sequelize.authenticate();

    // Tables attendues (dérivées des modèles pour éviter les erreurs de noms).
    const requiredTables = [
      User.getTableName(),
      Category.getTableName(),
      Book.getTableName(),
      Member.getTableName(),
      Borrow.getTableName(),
    ].map((t) => normalizeTableName(t).toLowerCase());

    // Liste des tables déjà présentes dans la base.
    const existingTablesRaw = await sequelize
      .getQueryInterface()
      .showAllTables();
    const existingTables = new Set(
      existingTablesRaw.map((t) => normalizeTableName(t).toLowerCase()),
    );

    // On ne synchronise/migre que si au moins une table manque.
    const missingTables = requiredTables.filter(
      (t) => !existingTables.has(t),
    );

    if (forceSync) {
      console.log("🧹 FORCE: suppression/recréation de toutes les tables...");

      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

      // Ordre inverse des dépendances (Borrow -> ... -> Category -> User)
      for (const table of [...requiredTables].reverse()) {
        await sequelize.query(`DROP TABLE IF EXISTS \`${table}\``);
      }

      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
      await sequelize.sync({ force: true });
      console.log("✅ Base de données recréée (mode FORCE)");
    } else if (missingTables.length > 0) {
      console.log(
        `🧩 Tables manquantes (${missingTables.join(", ")}). Création via sequelize.sync()...`,
      );

      // IMPORTANT: pas de { alter: true } => évite les requêtes inutiles quand tout existe.
      await sequelize.sync();
      console.log("✅ Tables manquantes créées");
    } else {
      console.log("✅ Schéma déjà présent: aucune synchronisation requise");
    }

    // ========== CRÉATION DES DONNÉES PAR DÉFAUT ==========

    // 1. Créer un utilisateur admin par défaut
    console.log("📝 Initialisation utilisateur admin...");
    const [_, adminCreated] = await User.findOrCreate({
      where: { email: "admin@bibliotheque.com" },
      defaults: {
        name: "Administrateur",
        email: "admin@bibliotheque.com",
        password: "admin123",
      },
    });

    if (adminCreated) {
      console.log(
        "✅ Compte administrateur créé: admin@bibliotheque.com / admin123",
      );
    } else {
      console.log(
        "ℹ️ Compte administrateur existe déjà: admin@bibliotheque.com",
      );
    }

    // 2. Créer les catégories par défaut (idempotent via unique sur `name`)
    console.log("📝 Initialisation catégories...");
    const categories = [
      { name: "Roman", description: "Littérature romanesque" },
      { name: "Science", description: "Livres scientifiques" },
      { name: "Histoire", description: "Livres d'histoire" },
      { name: "Informatique", description: "Programmation et technologies" },
      { name: "Art", description: "Art, peinture, musique" },
    ];

    // `ignoreDuplicates` évite les doublons si les catégories existent déjà.
    await Category.bulkCreate(categories, { ignoreDuplicates: true });

    console.log("✅ Initialisation de la base de données terminée");
  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation:", error);
    throw error;
  }
};

module.exports = syncDatabase;
