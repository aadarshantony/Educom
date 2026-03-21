import User from "../models/User.js";
import Product from "../models/Product.js";

export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "wishlist",
      "name price images rating numReviews countInStock isFeatured"
    );

    res.status(200).json({ wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user._id);

    // Prevent duplicate entries
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({ message: "Added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );

    await user.save();

    res.status(200).json({ message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user._id);
    const isInWishlist = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isInWishlist) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    res.status(200).json({
      message: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
      isInWishlist: !isInWishlist,
      wishlist: user.wishlist,
    });
  } catch (err) {
    next(err);
  }
};
