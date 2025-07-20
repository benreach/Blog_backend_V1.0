import prisma from '../utils/prisma.js';

// Create music

export const createMusic = async (req, res) => {
  try {
    const { title, artist, album, genre, lyrics } = req.body;

    // req.file.location will have the S3 URL
    const url = req.file.location;

    const newMusic = await prisma.music.create({
      data: {
        title,
        artist,
        album,
        genre,
        url,
        lyrics,
        coverImage: req.body.coverImage, // optional
      },
    });

    res.status(201).json(newMusic);
  } catch (error) {
    console.error('Error creating music:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all music
export const getAllMusic = async (req, res) => {
  try {
    const musics = await prisma.music.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(musics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch music' });
  }
};

// Get single music
export const getMusicById = async (req, res) => {
  try {
    const { id } = req.params;
    const music = await prisma.music.findUnique({
      where: { id },
    });
    if (!music) {
      return res.status(404).json({ message: 'Music not found' });
    }
    res.json(music);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch music' });
  }
};

// Update music
export const updateMusic = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, album, genre, url, lyrics, coverImage } = req.body;
    const music = await prisma.music.update({
      where: { id },
      data: { title, artist, album, genre, url, lyrics, coverImage },
    });
    res.json(music);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update music' });
  }
};

// Delete music
export const deleteMusic = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.music.delete({
      where: { id },
    });
    res.json({ message: 'Music deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete music' });
  }
};
