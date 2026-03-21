import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }
  return cart;
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name images price countInStock"
    );

    if (!cart) {
      return res.status(200).json({ items: [], totalPrice: 0 });
    }

    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.countInStock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const cart = await getOrCreateCart(req.user._id);

    // Check if item already in cart — if so, increase quantity
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex >= 0) {
      const newQty = cart.items[existingItemIndex].quantity + quantity;

      if (newQty > product.countInStock) {
        return res.status(400).json({ message: "Not enough stock for requested quantity" });
      }

      cart.items[existingItemIndex].quantity = newQty;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price, // snapshot price at time of adding
      });
    }

    await cart.save(); // triggers totalPrice recalculation

    const populated = await cart.populate("items.product", "name images price countInStock");
    res.status(200).json({ message: "Item added to cart", cart: populated });
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex < 0) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    // Verify stock
    const product = await Product.findById(productId);
    if (product.countInStock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const populated = await cart.populate("items.product", "name images price countInStock");
    res.status(200).json({ message: "Cart updated", cart: populated });
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const populated = await cart.populate("items.product", "name images price countInStock");
    res.status(200).json({ message: "Item removed from cart", cart: populated });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    next(err);
  }
};
