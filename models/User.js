import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
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
            address : {
                type: String,
                default: false,
            },
            phone: {
                type: String,
                default: "",
                validator:function(v){
                    return v==="" || /^\d{10}$/.test(v);
                },
                message: props => `${props.value} is not a valid phone number!`
            },
        }
    );
    
    export default mongoose.model("User", userSchema);
    