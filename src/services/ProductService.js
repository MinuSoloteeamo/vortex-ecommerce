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
        images: { orderBy: { sortOrder: 'asc' }, take: 1 }
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
        images: { orderBy: { sortOrder: 'asc' }, take: 1 }
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
    const { name, slug, description, price, salePrice, stock, brand, categoryId, imageUrl, specs } = data;
    
    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stock: parseInt(stock),
        brand,
        categoryId,
        specs,
        isActive: true,
      }
    });

    // Add image if provided
    if (imageUrl) {
      await prisma.productImage.create({
        data: {
          url: imageUrl,
          sortOrder: 0,
          productId: product.id
        }
      });
    }

    return product;
  }

  /**
   * ADMIN: Update an existing product
   */
  static async updateProduct(id, data) {
    const { name, slug, description, price, salePrice, stock, brand, categoryId, isActive, imageUrl, specs } = data;
    
    const updateData = {
      name,
      slug,
      description,
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : null,
      stock: parseInt(stock),
      brand,
      categoryId,
      specs,
      isActive: isActive !== undefined ? isActive : true,
    };

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    // Handle image update (simplistic: delete old, add new if provided)
    if (imageUrl !== undefined) {
      // Find existing images
      const existingImages = await prisma.productImage.findMany({ where: { productId: id } });
      
      if (imageUrl === '') {
        // Clear image
        await prisma.productImage.deleteMany({ where: { productId: id } });
      } else if (existingImages.length > 0 && existingImages[0].url !== imageUrl) {
        // Update first image
        await prisma.productImage.update({
          where: { id: existingImages[0].id },
          data: { url: imageUrl }
        });
      } else if (existingImages.length === 0 && imageUrl) {
        // Create new
        await prisma.productImage.create({
          data: {
            url: imageUrl,
            sortOrder: 0,
            productId: id
          }
        });
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
