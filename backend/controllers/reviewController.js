import Product from "../models/Product.js";

const recalculateRating = (product) => {
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;
};

export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    const product = await Product.findById(req.params.productId || req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Each user may only review a product once
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });

    recalculateRating(product);
    await product.save();

    res.status(201).json({ message: "Review added successfully" });
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only the review author can edit it
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this review" });
    }

    review.rating = rating ? Number(rating) : review.rating;
    review.comment = comment ?? review.comment;

    recalculateRating(product);
    await product.save();

    res.status(200).json({ message: "Review updated successfully" });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Author or admin may delete
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    review.deleteOne(); // remove subdocument
    recalculateRating(product);
    await product.save();

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId).select(
      "reviews rating numReviews"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      reviews: product.reviews,
      rating: product.rating,
      numReviews: product.numReviews,
    });
  } catch (err) {
    next(err);
  }
};
