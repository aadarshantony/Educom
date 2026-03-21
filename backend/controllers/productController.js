import Product from "../models/Product.js";

export const getAllProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      brand,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    if (keyword) {
      filter.$text = { $search: keyword };
    }
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sort mapping
    const sortOptions = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
    };
    const sortQuery = sortOptions[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      products,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      price,
      countInStock,
      images,
      isFeatured,
    } = req.body;

    const product = await Product.create({
      name: name || "New Product",
      description: description || "Product description",
      category: category || "Uncategorised",
      brand: brand || "",
      price: price || 0,
      countInStock: countInStock || 0,
      images: images || ["/images/sample.jpg"],
      isFeatured: isFeatured || false,
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const fields = [
      "name",
      "description",
      "category",
      "brand",
      "price",
      "countInStock",
      "images",
      "isFeatured",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });

    const updated = await product.save();
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await product.deleteOne();
    res.status(200).json({ message: "Product removed successfully" });
  } catch (err) {
    next(err);
  }
};

export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => r.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added successfully" });
  } catch (err) {
    next(err);
  }
};
