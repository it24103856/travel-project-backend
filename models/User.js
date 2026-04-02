import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        isblocked: {
            type: Boolean,
            default: false,
        },
        isemailverified: {
            type: Boolean,
            default: false,
        },
        image: {
            type: String,
            default: "/default-profile.png",
        },
        address: {
            type: String,
            default: "", // මෙතැන 'false' වෙනුවට හිස් string එකක් යොදන්න
        },
        phone: {
            type: String,
            default: "",
            validate: { // 'validator' ලෙස නොව 'validate' ලෙස තිබිය යුතුය
                validator: function(v) {
                    return v === "" || /^\d{10}$/.test(v);
                },
                message: props => `${props.value} is not a valid phone number!`
            }
        },
        interests: { // අලුතින් එකතු කළ කොටස
            type: [String],
            default: [],
        },
    },
    { timestamps: true } // CreatedAt සහ UpdatedAt ස්වයංක්‍රීයව එකතු වේ
);

export default mongoose.model("User", userSchema);