const { default: mongoose } = require("mongoose");

const tokenSchema = new mongoose.Schema({
    userId: {
        required: true,
        type : String
      },
      token: {
          required: true,
          type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,
      },
});

module.exports = mongoose.model('Token', tokenSchema);