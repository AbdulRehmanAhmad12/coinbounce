const Joi = require("joi");
const Comments = require("../model/comment");
const commentDto = require("../dto/commentDto");

let mongoID = /^[0-9a-fA-F]{24}$/;

const CommentController = {
  async create(req, res, next) {
    const commentSchema = Joi.object({
      content: Joi.string().min(5).max(100).required(),
      blog: Joi.string().regex(mongoID).required(),
      author: Joi.string().regex(mongoID).required(),
    });

    const { error } = commentSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { content, blog, author } = req.body;

    try {
      const comment = await Comments.create({
        content,
        blog,
        author,
      });
      return res.status(200).json({ message: "Comment Created!", comment });
    } catch (error) {
      return next(error);
    }
  },
  async get(req, res, next) {
    const commentIDSchema = Joi.object({
      id: Joi.string().regex(mongoID).required(),
    });
    const { error } = commentIDSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    const { id } = req.params;
    try {
      let listOfComments = [];
      const comments = await Comments.find({ blog: id }).populate("author");
      comments.forEach((comment) => {
        const dto = new commentDto(comment);
        listOfComments.push(dto);
      });
      return res.status(200).json({ comments: listOfComments });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = CommentController;
