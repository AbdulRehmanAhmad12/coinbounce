const Joi = require("joi");
const fs = require("fs");
const Blogs = require("../model/blog");
const DTO = require("../dto/blog");
const blogDetailDto = require("../dto/blogDetailDTO");
const Comments = require("../model/comment");

let mongoID = /^[0-9a-fA-F]{24}$/;

const blogController = {
  async create(req, res, next) {
    const createBlogScheama = Joi.object({
      title: Joi.string().required().min(4).max(10),
      content: Joi.string().required().min(10).max(100),
      author: Joi.string().regex(mongoID).required(),
      photoPath: Joi.string().required(),
    });

    const { error } = createBlogScheama.validate(req.body);

    if (error) {
      console.log("Hellooooooooo");
      return next(error);
    }

    const { title, content, photoPath, author } = req.body;

    //read Buffer
    const buffer = Buffer.from(
      photoPath.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
      "base64"
    );

    //allot a random number
    const imagePath = `${Date.now()}-${author}.png`;

    //save locally
    try {
      fs.writeFileSync(`storage/${imagePath}`, buffer);
    } catch (error) {
      return next(error);
    }

    let blog;
    try {
      blog = await Blogs.create({
        title,
        content,
        author,
        photoPath: `http://localhost:3000/storage/${imagePath}`,
      });
    } catch (error) {
      return next(error);
    }

    const dto = new DTO(blog);
    return res.status(201).json({ blog: dto });
  },
  async getAll(req, res, next) {
    try {
      const blogs = await Blogs.find({});
      let blogsCollection = [];

      blogs.forEach((blog) => {
        const dto = new DTO(blog);
        blogsCollection.push(dto);
        return res.status(200).json({ blogs: blogsCollection });
      });
    } catch (error) {
      return next(error);
    }
  },
  async getById(req, res, next) {
    const blogIdScheama = Joi.object({
      id: Joi.string().regex(mongoID).required(),
    });

    const { error } = blogIdScheama.validate(req.params);

    if (error) {
      return next(error);
    }

    const { id } = req.params;

    try {
      const blog = await Blogs.findById({ _id: id }).populate("author");
      const dto = new blogDetailDto(blog);
      return res.status(200).json({ blog: dto });
    } catch (error) {
      return next(error);
    }
  },
  async update(req, res, next) {
    const updateBlogScheama = Joi.object({
      title: Joi.string().min(4).max(10),
      content: Joi.string().min(10).max(100).required(),
      author: Joi.string().regex(mongoID).required(),
      blogId: Joi.string().regex(mongoID).required(),
      photoPath: Joi.string(),
    });

    const { error } = updateBlogScheama.validate(req.body);

    if (error) {
      return next(error);
    }

    const { title, content, author, blogId, photoPath } = req.body;

    let blog;
    try {
      blog = await Blogs.findOne({ _id: blogId });
    } catch (error) {
      return next(error);
    }

    if (photoPath) {
      let previousPhoto = blog.photoPath;
      previousPhoto = previousPhoto.split("/").at(-1);
      //delete photo
      fs.unlinkSync(`storage/${previousPhoto}`);

      //read Buffer
      const buffer = Buffer.from(
        photoPath.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
        "base64"
      );

      //allot a random number
      const imagePath = `${Date.now()}-${author}.png`;

      //save locally
      try {
        fs.writeFileSync(`storage/${imagePath}`, buffer);
      } catch (error) {
        return next(error);
      }

      const updatedBlog = await Blogs.updateOne(
        { _id: blogId },
        {
          title,
          content,
          photoPath: `http://localhost:3000/storage/${imagePath}`,
        }
      );
    } else {
      const updatedBlog = await Blogs.updateOne(
        { _id: blogId },
        {
          title,
          content,
        }
      );
    }
    return res.status(200).json({ message: "Blog Updated!" });
  },
  async delete(req, res, next) {
    const deleteBlogSchema = Joi.object({
      id: Joi.string().required().regex(mongoID),
    });

    const { error } = req.params;

    if (error) {
      return next(error);
    }

    const { id } = req.params;
    try {
      const blog = await Blogs.deleteOne({ _id: id });

      await Comments.deleteMany({blog: id})
    //   const dto = new blogDetailDto(blog);

      return res
        .status(200)
        .json({ message: "Blog deleted!"});
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = blogController;
