import { Router } from "express";
import { handleAddNewBlog, handleDeleteSingleBlog, handleGetAllBlogs, handleGetSingleBlog } from "../controllers/blog.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });


router.use(verifyAuth)

router.route("/addblog").post(upload.single('image'), handleAddNewBlog);


router.route("/").get(handleGetAllBlogs)

router.route("/:id").get(handleGetSingleBlog)
router.route("/:id").delete(handleDeleteSingleBlog)

export default router;