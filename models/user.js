const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const { ObjectId } = mongoose.Schema.Types;

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    validate(value) {
      if (!value) throw new Error(`Name field is required.`);
    },
  },
  user_id: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate(value) {
      if (!validator.isStrongPassword(value))
        throw new Error(
          `Password must contain the following (i) Minimum 8 characters. (ii) A lowercase letter. (iii) A special character (@, $, !, &, etc). (iv) A number. (v) A uppercase letter.`
        );
    },
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid email address");
      }
    },
  },
  user_name: {
    type: String,
    unique: true,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    validate(value) {
      if (
        value.toLowerCase() !== "male" &&
        value.toLowerCase() !== "female" &&
        value.toLowerCase() !== "other"
      ) {
        throw new Error("Please input male/female/other as gender");
      }
    },
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isMobilePhone(value, "any", { strictMode: true })) {
        throw new Error("Invalid mobile number");
      }
    },
  },
  private: {
    type: Boolean,
    default: false,
  },
  Followers: [{ type: ObjectId, ref: "User" }],
  Following: [{ type: ObjectId, ref: "User" }],
  Bookmarks: [{ type: ObjectId, ref: "Post" }],
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.generateAuthToken = async function () {
  try {
    if (this.tokens.length > 1) this.tokens.splice(0, 1);
    const token = jwt.sign({ email:this.email }, process.env.JWT_SECRET_KEY);
    this.tokens.push({ token: token });
    return token;
  } catch (e) {
    return e;
  }
};

UserSchema.pre("findOneAndUpdate", function (next) {
  this.options.runValidators = true;
  next();
});

const User = new mongoose.model("user", UserSchema);

module.exports = User;
