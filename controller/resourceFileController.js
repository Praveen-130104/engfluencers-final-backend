import { ref, uploadBytes, getDownloadURL , deleteObject } from "firebase/storage";
import fetch from "node-fetch";
import { Buffer } from "buffer";
import ResourceFile from "../model/resourceModel.js";
import { storage } from "../firebaseConfig.js";




//fetch Collection

export const fetchRsrcCollections = async (req, res) => {
  
    try {
      const collections = await ResourceFile.find({}, "name"); 
      
      res.status(200).json({ collections });
    } catch (error) {
      console.error("Error fetching collection names:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  //createCollection

  export const createRsrcCollection = async (req, res) => {

    try {
      const { RscCollectionTitle } = req.body;
  
      const existingCollection = await ResourceFile.findOne({ name: RscCollectionTitle });
  
      if (existingCollection) {
        return res.status(400).json({ error: "Collection with this title already exists" });
      }
  
      // Create a new collection and save it to MongoDB
      const newCollection = new ResourceFile({
        name: RscCollectionTitle,
        subcollections: [], // Initialize with an empty array of subcollections
      });
  
      await newCollection.save();
  
      res.status(201).json({ message: "Collection created successfully" });
    } 
    catch (error) {
      console.error("Error creating collection:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

  //edit collection

export const editRsrcCollection = async (req, res) => {

  try {
    const { collectionId } = req.params;
    const { collectionName } = req.body;


    // Check if the collection exists in the database
    const existingCollection = await ResourceFile.findById(collectionId);

    if (!existingCollection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const existingWithName = await ResourceFile.findOne({ name: collectionName });

    if (existingWithName && existingWithName._id.toString() !== collectionId) {
      return res.status(400).json({ error: 'Collection name already exists' });
    }

    // Update the collection's name 
    existingCollection.name = collectionName;
    await existingCollection.save();

    // Send a success response
    res.status(200).json({ message: 'Collection updated successfully' });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//delete collection

export const deleteRsrcCollection = async (req, res) => {
    try {
      const { collectionId } = req.params; 
  
      const existingCollection = await ResourceFile.findById(collectionId);
  
      if (!existingCollection) {
        return res.status(404).json({ error: 'Collection not found' });
      }
  
        // Delete the collection
        await existingCollection.deleteOne();
  
        // Send a success response
        res.status(200).json({ message: 'Collection deleted successfully' });
      } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };



    
//fetch subcollection

export const fetchRsrcSubCollection = async (req, res) => {


    try {
      const { selectedRscCollection } = req.params;
  
      // Find the collection by name
      const collection = await ResourceFile.findOne({ name: selectedRscCollection });
  
      // Check if the collection exists
      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }
  
      // Extract subcollections from the found collection
      const subCollections = collection.subcollections;
  
      // Reverse the order of subcollections to make them descending
      const descendingSubCollections = [...subCollections].reverse();
  
      // Return the subcollections in descending order as JSON response
      res.status(200).json({ subCollections: descendingSubCollections });
    } catch (error) {
      console.error('Error fetching subcollections:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  //create resource subcollection
  
  export const createRsrcSubCollection = async (req, res) => {
  
      const { selectedRscCollection } = req.params;
      const { name } = req.body;
    
  
    try {
      // Find the collection based on the provided collectionName
      const collection = await ResourceFile.findOne({ name: selectedRscCollection });
  
      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }
  
      // Check if the subcollection already exists in the collection
      const existingSubcollection = collection.subcollections.find(
        (subcollection) => subcollection.name === name
      );
  
      if (existingSubcollection) {
        return res.status(400).json({ error: 'Subcollection already exists' });
      }
  
      // Create a new subcollection and add it to the collection's subcollections array
      collection.subcollections.push({ name });
      await collection.save();
  
      return res.status(201).json({ message: 'Subcollection created successfully' });
    } catch (error) {
      console.error('Error creating subcollection:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };


  //rename RsrcSubCollection 
  
    export const renameRsrcSubCollection = async (req,res) => {

      const { selectedRscCollection } = req.params;
      const { currentSelectedRscSubcollection } = req.body;
      const { newsubname } = req.body;

      try {
        // Find the collection based on the provided collectionName
        const rscCollection = await ResourceFile.findOne({ name: selectedRscCollection });
    
        if (!rscCollection) {
          return res.status(404).json({ error: 'Collection not found' });
        }
    
        // Check if the subcollection already exists in the collection
        const existingSubcollectionName = rscCollection.subcollections.find(
          (subcollection) => subcollection.name === newsubname
        );

        if (existingSubcollectionName) {
          return res.status(400).json({ error: 'Subcollections with same name already present.' });
      }

      const rscSubcollectionName = rscCollection.subcollections.find(
        (subcollection) => subcollection.name === currentSelectedRscSubcollection
      );

      if (rscSubcollectionName) {
        rscSubcollectionName.name = newsubname;
      }

      // Save the changes
      await rscCollection.save();

      res.status(200).json({ message: 'Subcollection name updated successfully.' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error.' });
  }
  };
    


//delete resource subcollection


export const deleteRsrcSubCollection = async (req, res) => {
  try {
    const { subcollectionName } = req.params; 

    const existingSubcollection = await ResourceFile.findOne({ 'subcollections.name': subcollectionName });

    if (!existingSubcollection) {
      return res.status(404).json({ error: 'Subcollection not found.' });
    }

    //delete the subcollection
    await ResourceFile.updateOne(
      { 'subcollections.name': subcollectionName },
      {
        $pull: {
          subcollections: { name: subcollectionName },
        },
      }
    );
    res.status(200).json({ message: 'Subcollection deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
  
//upload resource pdf

export const fileRsrcUpload = async (req, res) => {
  console.log("fileUpload called");
  try {
    const { filename } = req.body;
    const { subcollectionName } = req.query;
    const file = req.file;

    console.log("filename = " , filename);
    console.log("subcollectionName = " , subcollectionName);
    console.log("file = " , file);

    if (!filename || !file || !subcollectionName) {
      return res.status(400).json({ error: "Invalid request data." });
    }

    // Find the subcollection by name
    const subcollection = await ResourceFile.findOne({
      "subcollections.name": subcollectionName,
    });

    if (!subcollection) {
      return res.status(404).json({ error: "Subcollection not found." });
    }

     // Check if the filename already exists in the subcollection
     const existingFile = subcollection.subcollections
     .find((sub) => sub.name === subcollectionName)
     .files.find((file) => file.filename === filename);

   if (existingFile) {
     return res.status(400).json({ error: "File with the same name already exists." });
   }

    // Create a new file document
    const storageRef = ref(storage, `pdfs/resources/${filename}`);
    await uploadBytes(storageRef, file.buffer, {
      contentType: "application/pdf",
    });
    const fileUrl = await getDownloadURL(storageRef);

    const newFile = {
      filename,
      fileurl: fileUrl,
    };

    subcollection.subcollections.find(
      (sub) => sub.name === subcollectionName
    ).files.push(newFile);

    await subcollection.save();

    res.status(201).json(newFile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};



//delete resource pdf

export const deleteRsrcPdfFile = async (req, res) => {
  console.log("deletePdfFile called");
  try {
    const { fileName } = req.query; 
    const { subcollectionName } = req.query;
    console.log("filename = " , fileName);
    console.log("subcollectionName = " , subcollectionName);

    if (!fileName || !subcollectionName) {
      return res.status(400).json({ error: "Invalid request data." });
    }

    // Find the subcollection by name
    const subcollection = await ResourceFile.findOne({
      "subcollections.name": subcollectionName,
    });

    if (!subcollection) {
      return res.status(404).json({ error: "Subcollection not found." });
    }

    // Delete the file from Firebase Storage
    const storageRef = ref(storage, `pdfs/resources/${fileName}`);

    await deleteObject(storageRef);

    // Delete the file from the subcollection
    await ResourceFile.updateOne(
      { "subcollections.name": subcollectionName },
      {
        $pull: {
          "subcollections.$.files": { filename: fileName },
        },
      }
    );
    res.status(200).json({ message: "File deleted successfully." });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};




//add video url

export const addRsrcVideoUrl = async (req, res) => {
  try {
 
    const { linkName, linkUrl } = req.body;
    console.log("linkName = " , linkName);
    const { subcollectionName } = req.query;

    if (!linkName || !linkUrl || !subcollectionName) {
      return res.status(400).json({ error: "Invalid request data." });
    }

    // Find the subcollection by name
    const subcollection = await ResourceFile.findOne({
      "subcollections.name": subcollectionName,
    });

    if (!subcollection) {
      return res.status(404).json({ error: "Subcollection not found." });
    }

    const sub = subcollection.subcollections.find((sub) => sub.name === subcollectionName);
    const existingLink = sub.videoUrl.find((video) => video.linkName === linkName);

    if (existingLink) {
      return res.status(400).json({ error: "LinkName already exists." });
    }

    const newVideoUrl = {
      linkName: linkName,
      link: linkUrl,
    };

    sub.videoUrl.push(newVideoUrl);
    await subcollection.save();

    res.status(201).json(newVideoUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
}

//delete video url using id

export const deleteRsrcVideoUrl = async (req, res) => {

  console.log("deleteVideoUrl called");
  try {
    const {subcollectionName ,videoUrlId } = req.query;

    console.log("subcollectionName = " , subcollectionName);
    console.log("videoUrlId = " , videoUrlId);

    if (!videoUrlId || !subcollectionName) {
      return res.status(400).json({ error: "Invalid request data." });
    }

    // Find the subcollection by name
    const subcollection = await ResourceFile.findOne({
      "subcollections.name": subcollectionName,
    });

    if (!subcollection) {
      return res.status(404).json({ error: "Subcollection not found." });
    }

    // Delete the link from the subcollection

    await ResourceFile.updateOne(
      { "subcollections.name": subcollectionName },
      {
        $pull: {
          "subcollections.$.videoUrl": { _id: videoUrlId },
        },
      }
    );

    res.status(200).json({ message: "Link deleted successfully." });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};










//User Resource side


//fetching all collections and subcollections

export const fetchRsrcworkSheets = async (req, res) => {
  try {

    // Use Mongoose to fetch all documents and project the 'name' and 'subcollections' fields
    const collections = await ResourceFile.find({}, 'name subcollections');

    // Check if there are any collections found
    if (!collections) {
      return res.status(404).json({ message: 'No collections found' });
    }

    // Respond with the collections data
    res.status(200).json(collections);
  } catch (error) {
    // Handle any errors that occur during the process
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



//download rsc pdf

export const downloadRscPdf = async (req , res) => {
  console.log("rsc download");
  const { url } = req.body
  console.log('url = ', url)
  try {
    //print the pdf file's size present at the url

    const response = await fetch(url)
    const pdfBuffer = await response.arrayBuffer()

    const buffer = Buffer.from(pdfBuffer)

    console.log('buffer = ', buffer.length)

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="downloaded.pdf"`
    )
    res.setHeader('Content-Type', 'application/pdf')

    console.log('pdfBuffer = ', buffer)
    res.send(buffer)
  } catch (error) {
    console.error('Error downloading PDF:', error)
    res.status(500).send('Error downloading PDF')
  }
}