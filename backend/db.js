const mongoose =  require("mongoose");


mongoose.connect('mongodb+srv://Admin:QVMlg92Wjkphtoho@cluster0.vnfthan.mongodb.net/')

const userSchema = new mongoose.Schema({
username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
},
password: {
    type: String,
    required: true,
    minLength: 6
},
firstName: {
    type: String,
    required: true,
    trim: true,
},
lastName: {
    type: String,
    required: true,
    trim: true,
}

})

const accountSchema = new mongoose.Schema({
    userId: {
        type : mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required :true
    }, 
    balance: {
        type: Number,
        required: true
    }
});



const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accountSchema);

module.exports = { User, Account };