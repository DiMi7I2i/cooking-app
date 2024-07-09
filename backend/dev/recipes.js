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
		preparationDuration: {
			$dateFromParts: {
				'hour': 0,
				'minute': 30
			}
		},
		cookDuration: {
			$dateFromParts: {
				'hour': 0,
				'minute': 15
			}
		},
		breakDuration: null,
		steps: [
			{
				num_order: 1,
				description: "Faire chauffer un wok ou une grosse poêle."
			},
			{
				num_order: 2,
				description: "Ajouter 1 cuillère d'huile, ajouter le basilic, le laisser frire pendant une minute."
			},
			{
				num_order: 3,
				description: "L'enlever et l'essorer sur du papier."
			},
			{
				num_order: 4,
				description: "Ajouter un autre cuillère d'huile à la poêle, faire revenir le poulet, ajouter le sel et le paprika, faire cuire pendant 4 à 5 minutes."
			},
			{
				num_order: 5,
				description: "Ajouter les œufs et bien mélanger (ça doit ressembler à des œufs brouillés)."
			},
			{
				num_order: 6,
				description: "Enlever le tout et mettre dans un plat. Ajouter la dernière cuillère d'huile dans la poêle. Mettre l'ail, le vinaigre le nuoc nam et le sucre, faire cuire pendant 2 minutes."
			},
			{
				num_order: 7,
				description: "Ajouter les pâtes (que vous avez fait cuire) dans cette sauce. Mettre le piment et les arachides, rajouter le poulet et les légumes au tout et bien mélanger."
			},
			{
				num_order: 8,
				description: "Mettre le tout dans un plat, décorer avec le basilic frit et des tranches de citron."
			}
		]
    }
])