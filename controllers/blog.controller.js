import Blog from "../models/blog.model.js"

export async function handleAddNewBlog(req, res) {
    try {
        const { title, description, content } = req.body;
        
        if (!title || !description || !content) {
            return res.status(400).json({ 
                message: "Missing required fields",
                required: ["title", "description", "content"]
            });
        }

        const newBlog = await Blog.create({
            title,
            description,
            content,
            image: req.file ? `/uploads/${req.file.filename}` : "",
            author: req.user._id
        });

        return res.status(201).json({
            message: "New blog created successfully",
            blog: newBlog
        });
    } catch (error) {
        console.error("Error creating blog:", error);
        return res.status(500).json({
            message: "Error creating blog",
            error: error.message
        });
    }
}


export async function handleGetAllBlogs(req, res){
    const allBlogs = await Blog.find({})

    if(!allBlogs){
        return res.json({message: "no blogs found!"})
    }

    return res.status(200).json({message: "blogs fetched", blogs: allBlogs})
}


export async function handleGetSingleBlog(req, res){
    let blogId = req.params.id;
    console.log(blogId)

    let blogData = await Blog.findOne({ _id: blogId })
    if(!blogData){
        return res.status(404).json({message: "blog not found"})
    }

    return res.status(200).json({message: "blog fetched", blog: blogData})
}


export async function handleDeleteSingleBlog(req, res){
    let blogId = req.params.id;

    console.log(blogId)

    if(!blogId){
        return res.json({message: "no id provided"})
    }

    let blogResult = await Blog.deleteOne({_id: blogId})

    console.log(blogResult)
    return res.status(200).json({message: "blogs deleted"})

    // if(!blogResult){
    //     return res.status(404).json({message: "blog not found"});
    // }

}