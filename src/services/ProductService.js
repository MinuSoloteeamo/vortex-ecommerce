import { prisma } from '@/lib/prisma';
import { removeVietnameseDiacritics } from '@/lib/utils';

export class ProductService {
  /**
   * Get all products with optional filtering
   */
  static async getAllProducts(filters = {}) {
    const { category, group, brand, minPrice, maxPrice, search, sortBy, specs } = filters;
    const where = { isActive: true };

    if (category) {
      where.category = Array.isArray(category) ? { slug: { in: category } } : { slug: category };
    } else if (group) {
      where.category = Array.isArray(group) ? { parentGroup: { in: group } } : { parentGroup: group };
    }

    if (brand) {
      where.brand = Array.isArray(brand) ? { in: brand } : brand;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.OR = [
        {
          salePrice: {
            ...(minPrice !== undefined && { gte: parseFloat(minPrice) }),
            ...(maxPrice !== undefined && { lte: parseFloat(maxPrice) }),
          }
        },
        {
          salePrice: null,
          price: {
            ...(minPrice !== undefined && { gte: parseFloat(minPrice) }),
            ...(maxPrice !== undefined && { lte: parseFloat(maxPrice) }),
          }
        }
      ];
    }

    if (search) {
      where.name = { contains: search };
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        variants: { include: { images: true } }
      },
      orderBy
    });

    // In-memory filter for specs (since SQLite JSON query is limited)
    if (specs && Object.keys(specs).length > 0) {
      return products.filter(product => {
        if (!product.specs) return false;
        try {
          const productSpecs = JSON.parse(product.specs);
          // Check if product satisfies ALL requested spec filters
          for (const [key, values] of Object.entries(specs)) {
            // values could be an array if multiple are selected for the same key
            const requiredValues = Array.isArray(values) ? values : [values];
            if (!productSpecs[key]) return false;
            // Product must match at least one of the selected values for this key
            if (!requiredValues.includes(productSpecs[key])) return false;
          }
          return true;
        } catch (e) {
          return false;
        }
      });
    }

    return products;
  }

  /**
   * Search products by keyword (Vietnamese diacritics-insensitive)
   */
  static async searchProducts(keyword, limit = 8) {
    if (!keyword || keyword.trim() === '') return [];

    const normalizedKeyword = removeVietnameseDiacritics(keyword.trim());

    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        variants: { include: { images: true } }
      }
    });

    return products
      .filter(product => {
        const fields = [
          product.name,
          product.brand,
          product.category?.name,
          product.description
        ];
        return fields.some(field =>
          removeVietnameseDiacritics(field).includes(normalizedKeyword)
        );
      })
      .slice(0, limit);
  }

  /**
   * Get search suggestions: matching categories + products
   */
  static async getSearchSuggestions(keyword) {
    if (!keyword || keyword.trim() === '') return { categories: [], products: [] };

    const normalizedKeyword = removeVietnameseDiacritics(keyword.trim());

    // Fetch categories
    const allCategories = await prisma.category.findMany();
    const categories = allCategories.filter(cat =>
      removeVietnameseDiacritics(cat.name).includes(normalizedKeyword)
    );

    // Fetch products (reuse searchProducts)
    const products = await this.searchProducts(keyword, 5);

    return { categories, products };
  }

  /**
   * Get product by slug including relations
   */
  static async getProductBySlug(slug) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, avatar: true } }
          }
        }
      }
    });
  }

  /**
   * ADMIN: Create a new product
   */
  static async createProduct(data) {
    const { name, slug, description, price, salePrice, stock, brand, categoryId, imageUrl, specs, variants } = data;
    
    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        baseVariantName: data.baseVariantName || null,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stock: parseInt(stock),
        brand,
        categoryId,
        specs: Array.isArray(specs) ? JSON.stringify(specs.filter(s => s.key && s.value)) : (specs || null),
        features: Array.isArray(data.features) ? JSON.stringify(data.features.filter(f => f.key && f.value)) : (data.features || null),
        isActive: true,
      }
    });

    // Add images if provided
    const imageUrls = data.imageUrls || (data.imageUrl ? [data.imageUrl] : []);
    for (let i = 0; i < imageUrls.length; i++) {
      if (imageUrls[i]) {
        await prisma.productImage.create({
          data: {
            url: imageUrls[i],
            sortOrder: i,
            productId: product.id
          }
        });
      }
    }

    // Add variants if provided
    if (variants && variants.length > 0) {
      for (const v of variants) {
        if (!v.name) continue;
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: v.name,
            sku: v.sku || null,
            stock: parseInt(v.stock) || 0,
            priceOffset: parseFloat(v.priceOffset) || 0,
            specs: Array.isArray(v.specs) ? JSON.stringify(v.specs.filter(s => s.key && s.value)) : null,
            features: Array.isArray(v.features) ? JSON.stringify(v.features.filter(f => f.key && f.value)) : null,
          }
        });
        
        if (v.imageUrls && v.imageUrls.length > 0) {
          for (let si = 0; si < v.imageUrls.length; si++) {
            await prisma.productImage.create({
              data: {
                url: v.imageUrls[si],
                sortOrder: si,
                productId: product.id,
                variantId: variant.id
              }
            });
          }
        } else if (v.imageUrl) {
          await prisma.productImage.create({
            data: {
              url: v.imageUrl,
              sortOrder: 0,
              productId: product.id,
              variantId: variant.id
            }
          });
        }
      }
    }

    return product;
  }

  /**
   * ADMIN: Update an existing product
   */
  static async updateProduct(id, data) {
    const { name, slug, description, price, salePrice, stock, brand, categoryId, isActive, imageUrl, specs, variants } = data;
    
    const updateData = {
      name,
      slug,
      description,
      baseVariantName: data.baseVariantName || null,
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : null,
      stock: parseInt(stock),
      brand,
      categoryId,
      specs: Array.isArray(specs) ? JSON.stringify(specs.filter(s => s.key && s.value)) : (typeof specs === 'string' ? specs : null),
      features: Array.isArray(data.features) ? JSON.stringify(data.features.filter(f => f.key && f.value)) : (typeof data.features === 'string' ? data.features : null),
      isActive: isActive !== undefined ? isActive : true,
    };

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    // Handle images update
    const imageUrls = data.imageUrls || (imageUrl ? [imageUrl] : null);
    if (imageUrls !== null) {
      // Delete old base product images (not variant images)
      await prisma.productImage.deleteMany({ where: { productId: id, variantId: null } });
      // Create new ones
      for (let i = 0; i < imageUrls.length; i++) {
        if (imageUrls[i]) {
          await prisma.productImage.create({
            data: {
              url: imageUrls[i],
              sortOrder: i,
              productId: id
            }
          });
        }
      }
    }

    // Handle Variants Update
    if (variants) {
      // Get existing variants
      const existingVariants = await prisma.productVariant.findMany({ where: { productId: id } });
      
      // Delete variants not in incoming list
      for (const ev of existingVariants) {
        const match = variants.find(v => (v.id === ev.id) || (v.name === ev.name));
        if (!match) {
          await prisma.productVariant.delete({ where: { id: ev.id } });
        }
      }

      // Upsert incoming variants
      for (const v of variants) {
        if (!v.name) continue;
        const match = existingVariants.find(ev => (v.id === ev.id) || (v.name === ev.name));
        let savedVariant;
        
        if (match) {
          savedVariant = await prisma.productVariant.update({
            where: { id: match.id },
            data: {
              name: v.name,
              sku: v.sku || null,
              stock: parseInt(v.stock) || 0,
              priceOffset: parseFloat(v.priceOffset) || 0,
              specs: Array.isArray(v.specs) ? JSON.stringify(v.specs.filter(s => s.key && s.value)) : null,
              features: Array.isArray(v.features) ? JSON.stringify(v.features.filter(f => f.key && f.value)) : null,
            }
          });
        } else {
          savedVariant = await prisma.productVariant.create({
            data: {
              productId: id,
              name: v.name,
              sku: v.sku || null,
              stock: parseInt(v.stock) || 0,
              priceOffset: parseFloat(v.priceOffset) || 0,
              specs: Array.isArray(v.specs) ? JSON.stringify(v.specs.filter(s => s.key && s.value)) : null,
              features: Array.isArray(v.features) ? JSON.stringify(v.features.filter(f => f.key && f.value)) : null,
            }
          });
        }

        // Handle variant images (remove old, add new)
        const variantImageUrls = v.imageUrls || (v.imageUrl ? [v.imageUrl] : []);
        await prisma.productImage.deleteMany({
          where: { variantId: savedVariant.id }
        });
        for (let si = 0; si < variantImageUrls.length; si++) {
          if (variantImageUrls[si]) {
            await prisma.productImage.create({
              data: {
                url: variantImageUrls[si],
                sortOrder: si,
                productId: id,
                variantId: savedVariant.id
              }
            });
          }
        }
      }
    }

    return product;
  }

  /**
   * ADMIN: Soft Delete a product (set isActive = false)
   */
  static async deleteProduct(id) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false }
    });
  }

  /**
   * Get frequently bought together products
   */
  static async getFrequentlyBoughtTogether(productId, limit = 4) {
    // 1. Find all orderIds that contain this product
    const orderItemsWithProduct = await prisma.orderItem.findMany({
      where: { productId },
      select: { orderId: true }
    });

    if (orderItemsWithProduct.length === 0) {
      return [];
    }

    const orderIds = orderItemsWithProduct.map(item => item.orderId);

    // 2. Find all other products in those orders
    const otherProductsInOrders = await prisma.orderItem.findMany({
      where: {
        orderId: { in: orderIds },
        productId: { not: productId }
      },
      include: {
        product: {
          include: { images: true, category: true }
        }
      }
    });

    // 3. Count frequencies
    const productFrequency = {};
    for (const item of otherProductsInOrders) {
      // only count active products
      if (!item.product || !item.product.isActive) continue;
      
      if (!productFrequency[item.productId]) {
        productFrequency[item.productId] = {
          product: item.product,
          count: 0
        };
      }
      productFrequency[item.productId].count += 1;
    }

    // 4. Sort by frequency and take top `limit`
    const sortedProducts = Object.values(productFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(p => p.product);

    return sortedProducts;
  }
}
