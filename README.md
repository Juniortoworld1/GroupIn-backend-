SignUp fields 
fullName: 
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },      // URL to profile image
  coverImage: { type: String, default: "" },  // URL to cover image
  refreshToken:{
    type:String
  } , 
  // Array of ObjectIds pointing to other Users
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
