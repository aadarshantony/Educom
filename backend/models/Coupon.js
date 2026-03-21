import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, "Discount value must be positive"],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    maxUsage: {
      type: Number,
      default: 100,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

couponSchema.virtual("isValid").get(function () {
  return (
    this.isActive &&
    this.usageCount < this.maxUsage &&
    new Date() < this.expiresAt
  );
});

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
