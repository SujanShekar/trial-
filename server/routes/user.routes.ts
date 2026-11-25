import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { sendError } from "../utils";
import { requireAdmin } from "../middleware/requireAdmin";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.patch('/me', async (req, res) => {
  try {
    const { fullName, phone, password, currentPassword } = req.body;
    const data: { fullName?: string; phone?: string | null; password?: string } = {};

    if (fullName !== undefined) data.fullName = fullName;
    if (phone !== undefined) data.phone = phone || null;
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Your current password is required to set a new password' });
      }
      const account = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { password: true },
      });
      if (!account || !await bcrypt.compare(currentPassword, account.password)) {
        return res.status(400).json({ error: 'The current password is incorrect' });
      }
      data.password = await bcrypt.hash(password, 12);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Provide a name, phone number, or password to update' });
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: { id: true, fullName: true, email: true, phone: true, role: true },
    });
    res.json(user);
  } catch (error) {
    sendError(res, error, 'Failed to update your profile');
  }
});

router.use(requireRole(['Admin']));

/**
 * GET /api/users
 * Get all users
 */
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        fullName: "asc",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isRootAdmin: true,
        isActive: true,
      },
    });

    res.json(users);
  } catch (error) {
    sendError(res, error, "Failed to fetch users");
  }
});

/**
 * POST /api/users
 * Create a new user
 */
router.post("/", async (req, res) => {
  try {
    const { fullName, password, phone, role } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();

    // Basic validation
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        error: "Full name, email, password and role are required",
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });

    if (existingUser) {
      return res.status(409).json({
        error: "A user with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        phone: phone || null,
        role,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isRootAdmin: true,
        isActive: true,
      },
    });

    res.status(201).json(user);
  } catch (error: any) {
    if (error?.code === 'P2002') return res.status(409).json({ error: 'A user with this email already exists' });
    sendError(res, error, "Failed to create user");
  }
});

/**
 * PUT /api/users/:id
 * Update an existing user
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { fullName, email, password, phone, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Check email uniqueness if email is being changed
    if (email && email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const emailExists = await prisma.user.findFirst({ where: { email: { equals: String(email).trim(), mode: 'insensitive' }, NOT: { id } } });

      if (emailExists) {
        return res.status(409).json({
          error: "A user with this email already exists",
        });
      }
    }

    const updateData: {
      fullName?: string;
      email?: string;
      phone?: string | null;
      role?: string;
      password?: string;
    } = {};

    if (fullName !== undefined) {
      updateData.fullName = fullName;
    }

    if (email !== undefined) {
      updateData.email = String(email).trim().toLowerCase();
    }

    if (phone !== undefined) {
      updateData.phone = phone || null;
    }

    if (role !== undefined) {
      updateData.role = role;
    }

    // Password is optional during update
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    res.json(updatedUser);
  } catch (error: any) {
    if (error?.code === 'P2002') return res.status(409).json({ error: 'A user with this email already exists' });
    sendError(res, error, "Failed to update user");
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (existingUser.isRootAdmin) {
      return res.status(403).json({ error: "Cannot delete the root admin account" });
    }

    if (id === req.user!.id) {
      return res.status(403).json({ error: "You cannot delete your own account" });
    }

    await prisma.user.update({
      where: {
        id,
      },
      data: { isActive: false },
    });

    res.status(204).send();
  } catch (error) {
    sendError(res, error, "Failed to delete user");
  }
});

export default router;
