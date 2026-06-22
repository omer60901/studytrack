import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task';
import { checkAndAwardBadges } from '../utils/achievements';

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { user: userId };
    let sortObj: Record<string, 1 | -1> = { dueDate: 1 };

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    if (req.query.completed !== undefined) {
      filter.completed = req.query.completed === 'true';
    }
    if (req.query.category) {
      filter.category = { $regex: req.query.category, $options: 'i' };
    }
    if (req.query.tag) {
      filter.tags = { $in: [req.query.tag] };
    }
    if (req.query.sort) {
      const sortField = req.query.sort as string;
      const sortOrder = req.query.order === 'desc' ? -1 : 1;
      sortObj = { [sortField]: sortOrder };
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sortObj).skip(skip).limit(limit),
      Task.countDocuments(filter)
    ]);

    res.json({
      data: tasks,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const task = await Task.findOne({ _id: req.params.id, user: userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const task = await Task.create({ ...req.body, user: userId });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, description, dueDate, priority, category, tags, dependsOn, completed } = req.body;
    const updates = { title, description, dueDate, priority, category, tags, dependsOn, completed };
    Object.keys(updates).forEach((key) => {
      if (updates[key as keyof typeof updates] === undefined) {
        delete updates[key as keyof typeof updates];
      }
    });
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      updates,
      { returnDocument: 'after' }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (completed === true) {
      const newBadges = await checkAndAwardBadges(new mongoose.Types.ObjectId(userId));
      if (newBadges.length > 0) {
        return res.json({ ...task.toObject(), newBadges });
      }
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};
