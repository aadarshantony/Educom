import Coupon from "../models/Coupon.js";

export const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxUsage, expiresAt } =
      req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxUsage,
      expiresAt,
    });

    res.status(201).json({ message: "Coupon created", coupon });
  } catch (err) {
    next(err);
  }
};

export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.status(200).json({ count: coupons.length, coupons });
  } catch (err) {
    next(err);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    const fields = [
      "discountType",
      "discountValue",
      "minOrderAmount",
      "maxUsage",
      "expiresAt",
      "isActive",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) coupon[f] = req.body[f];
    });

    const updated = await coupon.save();
    res.status(200).json({ message: "Coupon updated", coupon: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    await coupon.deleteOne();
    res.status(200).json({ message: "Coupon deleted" });
  } catch (err) {
    next(err);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) return res.status(400).json({ message: "Coupon code is required" });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ message: "Invalid or inactive coupon" });
    }
    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: "Coupon has expired" });
    }
    if (coupon.usageCount >= coupon.maxUsage) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }
    if (cartTotal !== undefined && cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
      });
    }

    // Calculate preview discount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = parseFloat(((cartTotal * coupon.discountValue) / 100).toFixed(2));
    } else {
      discount = coupon.discountValue;
    }

    res.status(200).json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
    });
  } catch (err) {
    next(err);
  }
};
