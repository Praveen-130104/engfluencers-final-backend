import express from "express";
import multer from "multer";
import { fileUpload , fetchCollections , createCollection, editCollection , deleteCollection , fetchSubCollection, deleteSubCollection ,editSubCollection, createSubCollection , deletePdfFile} from "../controller/filesController.js";
import { fetchRsrcCollections ,createRsrcCollection,editRsrcCollection , deleteRsrcCollection , fetchRsrcSubCollection ,createRsrcSubCollection ,renameRsrcSubCollection , deleteRsrcSubCollection , fileRsrcUpload , deleteRsrcPdfFile  , addRsrcVideoUrl ,deleteRsrcVideoUrl} from "../controller/resourceFileController.js";


const router = express.Router();

const upload = multer();

//collections

router.get("/collections" , fetchCollections);
router.post("/collections" , createCollection);
router.put("/collections/:collectionId" , editCollection);
router.delete("/collections/:collectionId" , deleteCollection);


//subcollections

router.get("/subcollections/:collectionName" , fetchSubCollection);
router.post("/subcollections/:collectionName" , createSubCollection);
router.put("/worksheets/subcollections/:collectionName" , editSubCollection)
router.delete("/subcollections/:subcollectionName" , deleteSubCollection);



router.post("/fileupload" , upload.single("file") , fileUpload );
router.delete("/fileupload" , deletePdfFile );



//resource files collections
router.get("/resources" , fetchRsrcCollections);
router.post("/resources", createRsrcCollection);
router.put("/resources/:collectionId" , editRsrcCollection);
router.delete("/resources/:collectionId" , deleteRsrcCollection);

//resource files subcollections
router.get("/resources/subcollections/:selectedRscCollection" , fetchRsrcSubCollection);
router.post("/resources/subcollections/:selectedRscCollection" , createRsrcSubCollection);
router.put("/resources/subcollections/:selectedRscCollection" , renameRsrcSubCollection);
router.delete("/resources/subcollections/:subcollectionName" , deleteRsrcSubCollection);

//resources file upload
router.post("/resources/fileupload" , upload.single("file") , fileRsrcUpload );
router.delete("/resources/files/pdfs/del" , deleteRsrcPdfFile );

//resource link upload
router.post("/resources/links/videoUrl" , addRsrcVideoUrl );
router.delete("/resources/links/videoUrl" , deleteRsrcVideoUrl );


export default router;