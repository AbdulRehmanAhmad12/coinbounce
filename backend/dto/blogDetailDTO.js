class blogDetailDto {
  constructor(blog) {
    (this._id = blog._id),
      (this.title = blog.title),
      (this.content = blog.content),
      (this.photo = blog.photoPath);
      this.createdAt = blog.createdAt,
    this.authName = blog.author.name;
    this.authorEmail = blog.author.email;
  }
}

module.exports = blogDetailDto;
