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

const videoUrlSchema = new mongoose.Schema({
    linkName: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    });

const subcollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },    
  files: [fileSchema],
  videoUrl: [videoUrlSchema], // Embed the file schema as an array
});

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure unique collection names
  },
  subcollections: [subcollectionSchema],
});

const Resourcefile = mongoose.model("resources", collectionSchema);

export default Resourcefile;
