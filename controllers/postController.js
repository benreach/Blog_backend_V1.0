import prisma from "../utils/prisma.js";

export const createPost = async (req, res) => {
  const { title, category, contentUrl } = req.body;

  if (!title || !category || !contentUrl) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const post = await prisma.post.create({
      data: { title, category: category.toUpperCase(), contentUrl },
    });

    // ✅ Increment totalPosts in SiteStats singleton
    await prisma.siteStats.upsert({
      where: { id: "global" },
      update: { totalPosts: { increment: 1 } },
      create: {
        id: "global",
        totalPosts: 1,
        totalUsers: 0,
        totalMusic: 0,
        totalComments: 0,
        totalLikes: 0,
      },
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("Create post error:", err);
    res
      .status(500)
      .json({ message: "Failed to create post", error: err.message });
  }
};

export const getPosts = async (req, res) => {
  const { category } = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: category ? { category: category.toUpperCase() } : {},
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch posts", error: err.message });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) return res.status(404).json({ message: "Post not found" });

    await prisma.post.delete({ where: { id } });

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res
      .status(500)
      .json({ message: "Failed to delete post", error: err.message });
  }
};

// Update post
export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, category, contentUrl } = req.body;

  if (!title && !category && !contentUrl) {
    return res
      .status(400)
      .json({
        message:
          "At least one field (title, category, contentUrl) is required to update",
      });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) return res.status(404).json({ message: "Post not found" });

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(category && { category: category.toUpperCase() }),
        ...(contentUrl && { contentUrl }),
      },
    });

    res.json(updatedPost);
  } catch (err) {
    console.error("Update post error:", err);
    res
      .status(500)
      .json({ message: "Failed to update post", error: err.message });
  }
};
