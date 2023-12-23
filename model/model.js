  import mongoose from "mongoose";

  const fileSchema = new mongoose.Schema({
    filename: {
      type: String,
      required: true,
    },
    fileurl: {
      type: String,
      required: true,
    },
  });

  const subcollectionSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },    
    files: [fileSchema], // Embed the file schema as an array
  });

  const collectionSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true, // Ensure unique collection names
    },
    subcollections: [subcollectionSchema],
  });

  const File = mongoose.model("File", collectionSchema); // Use singular form "Collection" as the model name

  export default File;
