import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'
import dotenv from "dotenv";
import fetch from 'node-fetch'
import { Buffer } from 'buffer'

//model
import File from '../model/model.js'

import { storage } from '../firebaseConfig.js'
import { GraphQLClient, gql } from 'graphql-request'

dotenv.config({path:"../.env"});

// const graphqlAPI = process.env.VITE_GRAPHQL_ENDPOINT
// const graphCmsToken = process.env.VITE_GRAPHCMS_TOKEN
const graphqlAPI = "https://api-ap-south-1.hygraph.com/v2/clqqf885o4c4u01t6ebcs65k0/master"
const graphCmsToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE3MDM4NDM1NDUsImF1ZCI6WyJodHRwczovL2FwaS1hcC1zb3V0aC0xLmh5Z3JhcGguY29tL3YyL2NscXFmODg1bzRjNHUwMXQ2ZWJjczY1azAvbWFzdGVyIiwibWFuYWdlbWVudC1uZXh0LmdyYXBoY21zLmNvbSJdLCJpc3MiOiJodHRwczovL21hbmFnZW1lbnQuZ3JhcGhjbXMuY29tLyIsInN1YiI6ImYzNjg0MTBiLWFjMDktNDllOC1iMmNiLTIxMzQ3ZWUyM2U1NCIsImp0aSI6ImNscXFnZ2RybDRmNmYwMXVpNXEzaThzM2cifQ.lC_nRDZPk1lXTRfAGP3wmVvWAL2SDnsHwP_j_m5SWdtdgxotHT5RaVaxCjNG2qnY8ayi8yEc3BACc5E7RX1d4aUb8Jjm7vEmE9advqgJzX-0vG6hRE4i6yHE9a-LA5mwa9jOITbiVOAzA-mxL6qxiFAmv0RoySkfePWM_65YAVIln9zcqM5WKxY0dj8Pepuxhz2Orj46xv-gzeIl-Ku4JJ1Hr2MXnyO4aW4hwrc3PWeuEpVXm5ACltm9Fl4DLRS5bPCyRqLqYu2npjrDZvNnSrfqvZn2-jmDIp2cgWdAhdFaCHY84_s43V6RiO8qWHEcs8wLg6zb39fsc9GgopA6_qtGybEQqj13YpteMSBIAitEBGG3XpQ8RjBDTWjJWpgevXvHf4FjegKp3uRMe1_hc8eLhioYZtggqjWAC9mdFI1nlYemdBIgzbPly7JBlOo-DlXW7aa957TMnGc0ZDxH_VhjFepx5AzpsvYjTIopDOvDTjmU78NzSBwKD37ssR_dhqz4PyWqGJNT8zeFR-_xi42kiEShXmYfyijn-W_-rsZyE2OQ8q0tGWzC-EE5wJZp-xe8KJZjs3Ta0w6sF9r14j4x2o4JQttyE2rTXOxVvS6W-o31w9voO7Fc9uhRF860WdocAM8VyyTkkHNZK53wLPXeFmWFPNHQ-bhuC2yim8w"



//submit comment submitComment
export const submitComment = async (req, res) => {
  //post the comment to graph content management system using graph 
  console.log("inside comment !!!!!!!");

  const graphQLClient = new GraphQLClient(graphqlAPI ,{
    headers: {
      authorization: `Bearer ${graphCmsToken}`
  }
})

  const query = gql`
  mutation CreateComment($name: String!, $email: String!, $comment: String!, $slug: String!) {
    createComment(data: {name: $name, email: $email, comment: $comment, post: {connect: {slug: $slug}}}) { id }
  }
  `;

  const result = await graphQLClient.request(query, {
  name: req.body.name,
  email: req.body.email,
  comment: req.body.comment,
  slug: req.body.slug,
  });

  console.log(result);
  res.status(200).json({ message: "Comment submitted successfully" });
};

//create Collections

export const createCollection = async (req, res) => {
  try {
    const { collectionTitle } = req.body

    const existingCollection = await File.findOne({ name: collectionTitle })

    if (existingCollection) {
      return res
        .status(400)
        .json({ error: 'Collection with this title already exists' })
    }

    // Create a new collection and save it to MongoDB
    const newCollection = new File({
      name: collectionTitle,
      subcollections: [] // Initialize with an empty array of subcollections
    })

    await newCollection.save()

    res.status(201).json({ message: 'Collection created successfully' })
  } catch (error) {
    console.error('Error creating collection:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

//Fetch Collections

export const fetchCollections = async (req, res) => {
  try {
    const collections = await File.find({}, 'name')

    // console.log("collections = " , collections);

    // const collectionNames = collections.map((collection) => collection.name);

    res.status(200).json({ collections })
  } catch (error) {
    console.error('Error fetching collection names:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

//edit Collections

export const editCollection = async (req, res) => {
  try {
    const { collectionId } = req.params
    const { collectionName } = req.body

    // Check if the collection exists in the database
    const existingCollection = await File.findById(collectionId)

    if (!existingCollection) {
      return res.status(404).json({ error: 'Collection not found' })
    }

    const existingWithName = await File.findOne({ name: collectionName })

    if (existingWithName && existingWithName._id.toString() !== collectionId) {
      return res.status(400).json({ error: 'Collection name already exists' })
    }

    // Update the collection's name
    existingCollection.name = collectionName
    await existingCollection.save()

    // Send a success response
    res.status(200).json({ message: 'Collection updated successfully' })
  } catch (error) {
    console.error('Error updating collection:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

//delete collections

export const deleteCollection = async (req, res) => {
  try {
    const { collectionId } = req.params

    const existingCollection = await File.findById(collectionId)

    if (!existingCollection) {
      return res.status(404).json({ error: 'Collection not found' })
    }

    // Delete the collection
    await existingCollection.deleteOne()

    // Send a success response
    res.status(200).json({ message: 'Collection deleted successfully' })
  } catch (error) {
    console.error('Error deleting collection:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

//Subcollections

//fetch subcollections

export const fetchSubCollection = async (req, res) => {
  try {
    const { collectionName } = req.params

    // Find the collection by name
    const collection = await File.findOne({ name: collectionName })

    // Check if the collection exists
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' })
    }

    // Extract subcollections from the found collection
    const subCollections = collection.subcollections

    // Reverse the order of subcollections to make them descending
    const descendingSubCollections = [...subCollections]

    // Return the subcollections in descending order as JSON response
    res.status(200).json({ subCollections: descendingSubCollections })
  } catch (error) {
    console.error('Error fetching subcollections:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

//create subcollections

export const createSubCollection = async (req, res) => {
  const { collectionName } = req.params
  const { name } = req.body

  try {
    // Find the collection based on the provided collectionName
    const collection = await File.findOne({ name: collectionName })

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' })
    }

    // Check if the subcollection already exists in the collection
    const existingSubcollection = collection.subcollections.find(
      subcollection => subcollection.name === name
    )

    if (existingSubcollection) {
      return res.status(400).json({ error: 'Subcollection already exists' })
    }

    // Create a new subcollection and add it to the collection's subcollections array
    collection.subcollections.push({ name })
    await collection.save()

    return res
      .status(201)
      .json({ message: 'Subcollection created successfully' })
  } catch (error) {
    console.error('Error creating subcollection:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

//edit subcollection

export const editSubCollection = async (req, res) => {
  const { collectionName } = req.params
  const { currentSelectedSubcollection } = req.body
  const { newsubname } = req.body

  try {
    const collection = await File.findOne({ name: collectionName })

    // Check if the collection exists
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' })
    }

    // Check if the subcollection already exists in the collection
    const existingSubcollectionName = collection.subcollections.find(
      subcollection => subcollection.name === newsubname
    )

    if (existingSubcollectionName) {
      return res
        .status(400)
        .json({ error: 'Subcollections with same name already present.' })
    }

    const subcollectionName = collection.subcollections.find(
      subcollection => subcollection.name === currentSelectedSubcollection
    )

    if (subcollectionName) {
      subcollectionName.name = newsubname
    }

    await collection.save()

    return res
      .status(200)
      .json({ message: 'Subcollection updated successfully' })
  } catch (error) {
    console.error('Error updating subcollection:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

//delete subcollections

export const deleteSubCollection = async (req, res) => {
  try {
    const { subcollectionName } = req.params

    const existingSubcollection = await File.findOne({
      'subcollections.name': subcollectionName
    })

    if (!existingSubcollection) {
      return res.status(404).json({ error: 'Subcollection not found.' })
    }

    //delete the subcollection
    await File.updateOne(
      { 'subcollections.name': subcollectionName },
      {
        $pull: {
          subcollections: { name: subcollectionName }
        }
      }
    )
    res.status(200).json({ message: 'Subcollection deleted successfully.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

//File uploading

export const fileUpload = async (req, res) => {
  console.log('fileUpload called')

  try {
    const { filename } = req.body
    const { subcollectionName } = req.query
    const file = req.file

    console.log('filename = ', filename)
    console.log('subcollectionName = ', subcollectionName)
    console.log('file = ', file)

    if (!filename || !file || !subcollectionName) {
      return res.status(400).json({ error: 'Invalid request data.' })
    }

    // Find the subcollection by name
    const subcollection = await File.findOne({
      'subcollections.name': subcollectionName
    })

    if (!subcollection) {
      return res.status(404).json({ error: 'Subcollection not found.' })
    }

    // Create a new file document
    const storageRef = ref(storage, `pdfs/${filename}`)
    await uploadBytes(storageRef, file.buffer, {
      contentType: 'application/pdf'
    })
    const fileUrl = await getDownloadURL(storageRef)

    const newFile = {
      filename,
      fileurl: fileUrl
    }

    subcollection.subcollections
      .find(sub => sub.name === subcollectionName)
      .files.push(newFile)

    await subcollection.save()

    res.status(201).json(newFile)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

//File deleting

export const deletePdfFile = async (req, res) => {
  console.log('deletePdfFile called')
  try {
    const { fileName } = req.query
    const { subcollectionName } = req.query
    console.log('filename = ', fileName)
    console.log('subcollectionName = ', subcollectionName)

    if (!fileName || !subcollectionName) {
      return res.status(400).json({ error: 'Invalid request data.' })
    }

    // Find the subcollection by name
    const subcollection = await File.findOne({
      'subcollections.name': subcollectionName
    })

    if (!subcollection) {
      return res.status(404).json({ error: 'Subcollection not found.' })
    }

    // Delete the file from Firebase Storage
    const storageRef = ref(storage, `pdfs/${fileName}`)
    await deleteObject(storageRef)

    await File.updateOne(
      { 'subcollections.name': subcollectionName },
      {
        $pull: {
          'subcollections.$.files': { filename: fileName }
        }
      }
    )

    res.status(200).json({ message: 'File deleted successfully.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

//User side

//fetching all collections and subcollections

export const fetchworkSheets = async (req, res) => {
  try {
    // Use Mongoose to fetch all documents and project the 'name' and 'subcollections' fields
    const collections = await File.find({}, 'name subcollections')

    // Check if there are any collections found
    if (!collections) {
      return res.status(404).json({ message: 'No collections found' })
    }

    // Respond with the collections data
    res.status(200).json(collections)
  } catch (error) {
    // Handle any errors that occur during the process
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

//download pdf

export const downloadPdf = async (req, res) => {
  console.log('downloadPdf called')
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
