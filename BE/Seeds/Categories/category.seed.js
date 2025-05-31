const Category = require('../../Models/Categories');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'category.seed.json');

module.exports = async function seedCategories() {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const categories = JSON.parse(rawData);

  for (const cat of categories) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (existing) {
      console.log(`Category already exists: ${cat.name}`);
      continue;
    }
    await new Category(cat).save();
    console.log(`Category added: ${cat.name}`);
  }
  console.log('Category seeding completed.');
};
