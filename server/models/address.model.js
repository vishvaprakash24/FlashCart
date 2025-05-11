import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    address_line: {
        type: String,
        default: ""
    }, 
    city: {
        type: String,
        default: "" //not compulsory to write this
    },
    state: {
        type: String,
        default: ""
    },
    pincode: {
        type: String,
        default: ""
    },
    country: {
        type: String,
        default: ""
    },
    mobile: {
        type: Number,
        default: null
    },
    // initially not added this.
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

const AddressModel = mongoose.model('address', addressSchema);
export default AddressModel;