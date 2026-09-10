const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  slug: {
    type: String,
    required: true,
    unique: true,
  },

  logo: {
    type: String,
    default: "",
  },

  type: {
    type: String,
    enum: ["company", "university"],
    default: "company",
  },
});

module.exports = mongoose.model("Provider", providerSchema);