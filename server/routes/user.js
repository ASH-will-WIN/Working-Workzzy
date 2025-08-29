const express = require("express");
const router = express.Router();
const { prisma } = require("../db");
const authMiddleware = require("../middleware/auth");

// Add this route for user search
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    // Search users by name
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
          { id: { not: req.user.id } }, // Don't return current user
        ],
      },
      take: 10,
      select: {
        id: true,
        name: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("User search error:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

module.exports = router;
