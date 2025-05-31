const fs = require('fs');
const path = require('path');
const Product = require('../../Models/Products');
const Category = require('../../Models/Categories');

const filePath = path.join(__dirname, 'products.seed.json');

async function getNextProductId() {
  const lastProduct = await Product.findOne().sort({ productId: -1 }).exec();
  return lastProduct ? lastProduct.productId + 1 : 1;
}

module.exports = async function seedProducts() {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const products = JSON.parse(rawData);

  for (const item of products) {
    
    const categories = await Category.find({ slug: { $in: item.basicInformation.categories } });
    
    if (categories.length === 0) {
      console.warn(`No categories found for product ${item.basicInformation.productName}. Skipping.`);
      continue;
    }

    const categoryIds = categories.map(cat => cat._id);

    const existing = await Product.findOne({ 'basicInformation.sku': item.basicInformation.sku });
    if (existing) {
      console.log(`Product already exists: ${item.basicInformation.productName}`);
      continue;
    }

    const nextProductId = await getNextProductId();

    const product = new Product({
      basicInformation: {
        productName: item.basicInformation.productName,
        sku: item.basicInformation.sku,
        categoryIds: categoryIds,
        brand: item.basicInformation.brand
      },
      pricingAndInventory: item.pricingAndInventory,
      media: item.media,
      description: item.description,
      technicalDetails: item.technicalDetails,
      seo: item.seo,
      policy: item.policy,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    });

    await product.save();
    console.log(`Product added: ${item.basicInformation.productName}`);
  }
  console.log('Product seeding completed.');
};
