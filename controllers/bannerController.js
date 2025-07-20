import prisma from "../utils/prisma.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import AppError from "../utils/appError.js";


// Helper function to upload buffer to Cloudinary via stream
const streamUpload = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Create a banner
export const createBanner = async (req, res, next) => {
  try {
    const { linkUrl, title } = req.body;

    if (!req.file) {
      return next(new AppError("Image file is required", 400));
    }

    const result = await streamUpload(req.file.buffer, "banners");

    const banner = await prisma.banner.create({
      data: {
        imageUrl: result.secure_url,
        linkUrl,
        title,
      },
    });

    res.status(201).json(banner);
  } catch (error) {
    next(error);
  }
};

// Get all banners
export const getBanners = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(banners);
  } catch (error) {
    next(error);
  }
};

// Get single banner
export const getBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await prisma.banner.findUnique({
      where: { id },
    });
    if (!banner) {
      return next(new AppError("Banner not found", 404));
    }
    res.json(banner);
  } catch (error) {
    next(error);
  }
};

// Update banner
export const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { linkUrl, title } = req.body;

    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      return next(new AppError("Banner not found", 404));
    }

    let imageUrl = banner.imageUrl;

    if (req.file) {
      const result = await streamUpload(req.file.buffer, "banners");
      imageUrl = result.secure_url;
    }

    const updated = await prisma.banner.update({
      where: { id },
      data: { imageUrl, linkUrl, title },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete banner
export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      return next(new AppError("Banner not found", 404));
    }

    // OPTIONAL: delete image from Cloudinary (if desired)
    // Extract public_id from imageUrl for deletion
    const publicId = banner.imageUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`banners/${publicId}`);

    await prisma.banner.delete({
      where: { id },
    });

    res.json({ message: "Banner deleted" });
  } catch (error) {
    next(error);
  }
};
