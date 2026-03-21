// Ingrédients

// Recipes
db.recipes.drop();
db.recipes.insertMany([
    {
        title: "Pad Thaï",
        thumbnail: null,
        description: "Plat traditionnel acidulé-sucré-salé-épicé de la cuisine thaïlandaise, à base de nouilles de riz sautées au wok, très apprécié et très consommé à titre de plat national dans toute la Thaïlande",
        categoryCode: "PLAT",
        difficultyCode: "EASY",
        costCode: "CHEAP",
        servings: 4,
        preparationDuration: 30,
        cookDuration: 15,
        breakDuration: null,
        ingredients: [
            { name: "Nouilles de riz", quantity: 200, unit: "g" },
            { name: "Poulet", quantity: 150, unit: "g" },
            { name: "Œufs", quantity: 2 },
            { name: "Huile végétale", quantity: 3, unit: "cuillères à soupe" },
            { name: "Basilic thaï" },
            { name: "Ail", quantity: 2, unit: "gousses" },
            { name: "Nuoc-mâm", quantity: 2, unit: "cuillères à soupe" },
            { name: "Sucre", quantity: 1, unit: "cuillère à soupe" },
            { name: "Vinaigre de riz", quantity: 1, unit: "cuillère à soupe" },
            { name: "Cacahuètes concassées", quantity: 30, unit: "g" },
            { name: "Piment", quantity: 1 },
            { name: "Citron vert", quantity: 1 },
            { name: "Sel" },
            { name: "Paprika" }
        ],
        steps: [
            "Faire chauffer un wok ou une grosse poêle.",
            "Ajouter 1 cuillère d'huile, ajouter le basilic, le laisser frire pendant une minute.",
            "L'enlever et l'essorer sur du papier.",
            "Ajouter un autre cuillère d'huile à la poêle, faire revenir le poulet, ajouter le sel et le paprika, faire cuire pendant 4 à 5 minutes.",
            "Ajouter les œufs et bien mélanger (ça doit ressembler à des œufs brouillés).",
            "Enlever le tout et mettre dans un plat. Ajouter la dernière cuillère d'huile dans la poêle. Mettre l'ail, le vinaigre le nuoc nam et le sucre, faire cuire pendant 2 minutes.",
            "Ajouter les pâtes (que vous avez fait cuire) dans cette sauce. Mettre le piment et les arachides, rajouter le poulet et les légumes au tout et bien mélanger.",
            "Mettre le tout dans un plat, décorer avec le basilic frit et des tranches de citron."
        ]
    }
])