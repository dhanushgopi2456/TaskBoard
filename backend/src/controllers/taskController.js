import crypto from 'crypto';
import { query, isPostgres } from '../db.js';

export async function getTasks(req, res) {
  try {
    const userId = req.user.id;
    const { status, search, sort } = req.query;

    let baseSql = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [userId];

    // Status filter: 'all' | 'pending' | 'completed'
    if (status === 'pending') {
      if (isPostgres) {
        baseSql += ' AND completed = FALSE';
      } else {
        baseSql += ' AND completed = 0';
      }
    } else if (status === 'completed') {
      if (isPostgres) {
        baseSql += ' AND completed = TRUE';
      } else {
        baseSql += ' AND completed = 1';
      }
    }

    // Search filter: matches on title (case-insensitive)
    if (search && search.trim()) {
      baseSql += ' AND LOWER(title) LIKE LOWER(?)';
      params.push(`%${search.trim()}%`);
    }

    // Sorting
    // Priority order: High > Medium > Low
    if (sort === 'priority' || sort === 'priority_desc') {
      baseSql += ` ORDER BY 
        CASE priority 
          WHEN 'High' THEN 1 
          WHEN 'Medium' THEN 2 
          WHEN 'Low' THEN 3 
          ELSE 4 
        END ASC, created_at DESC`;
    } else if (sort === 'priority_asc') {
      baseSql += ` ORDER BY 
        CASE priority 
          WHEN 'Low' THEN 1 
          WHEN 'Medium' THEN 2 
          WHEN 'High' THEN 3 
          ELSE 4 
        END ASC, created_at DESC`;
    } else if (sort === 'due_date' || sort === 'dueDate_asc') {
      // Put tasks with due date first in ascending order, tasks without due date last
      baseSql += ` ORDER BY CASE WHEN due_date IS NULL OR due_date = '' THEN 1 ELSE 0 END, due_date ASC, created_at DESC`;
    } else if (sort === 'dueDate_desc') {
      baseSql += ` ORDER BY CASE WHEN due_date IS NULL OR due_date = '' THEN 1 ELSE 0 END, due_date DESC, created_at DESC`;
    } else {
      // Default: recently updated or created
      baseSql += ' ORDER BY created_at DESC';
    }

    const tasks = await query(baseSql, params);

    // Compute user's overall task counts (Total, Pending, Completed)
    let countsSql;
    if (isPostgres) {
      countsSql = `
        SELECT 
          COUNT(*)::int AS total,
          COUNT(CASE WHEN completed = FALSE THEN 1 END)::int AS pending,
          COUNT(CASE WHEN completed = TRUE THEN 1 END)::int AS completed
        FROM tasks 
        WHERE user_id = $1
      `;
    } else {
      countsSql = `
        SELECT 
          COUNT(*) AS total,
          SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed
        FROM tasks 
        WHERE user_id = ?
      `;
    }
    const countsResult = await query(countsSql, [userId]);
    const counts = countsResult && countsResult.length > 0 ? {
      total: Number(countsResult[0].total) || 0,
      pending: Number(countsResult[0].pending) || 0,
      completed: Number(countsResult[0].completed) || 0
    } : { total: 0, pending: 0, completed: 0 };

    // Format boolean for completed
    const formattedTasks = tasks.map(t => ({
      ...t,
      completed: Boolean(t.completed)
    }));

    return res.json({
      tasks: formattedTasks,
      counts
    });
  } catch (err) {
    console.error('getTasks error:', err);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

export async function createTask(req, res) {
  try {
    const userId = req.user.id;
    const { title, description, priority, dueDate } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const cleanTitle = title.trim();
    const cleanDesc = description && typeof description === 'string' ? description.trim() : '';
    
    // Priority validation (Low / Medium / High, default Medium)
    const validPriorities = ['Low', 'Medium', 'High'];
    const finalPriority = validPriorities.includes(priority) ? priority : 'Medium';

    const cleanDueDate = dueDate && typeof dueDate === 'string' ? dueDate.trim() : null;
    const taskId = 'task-' + crypto.randomUUID();
    const isCompleted = isPostgres ? false : 0;

    await query(
      `INSERT INTO tasks (id, user_id, title, description, priority, due_date, completed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [taskId, userId, cleanTitle, cleanDesc, finalPriority, cleanDueDate, isCompleted]
    );

    const created = await query('SELECT * FROM tasks WHERE id = ?', [taskId]);

    return res.status(201).json({
      message: 'Task created successfully',
      task: {
        ...created[0],
        completed: Boolean(created[0].completed)
      }
    });
  } catch (err) {
    console.error('createTask error:', err);
    return res.status(500).json({ error: 'Failed to create task' });
  }
}

export async function updateTask(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, priority, dueDate, completed } = req.body;

    // Check ownership
    const existing = await query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    const current = existing[0];

    // Validate title if provided
    let newTitle = current.title;
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      newTitle = title.trim();
    }

    const newDescription = description !== undefined ? description.trim() : current.description;

    const validPriorities = ['Low', 'Medium', 'High'];
    const newPriority = (priority !== undefined && validPriorities.includes(priority))
      ? priority
      : current.priority;

    const newDueDate = dueDate !== undefined ? (dueDate ? dueDate.trim() : null) : current.due_date;

    let newCompleted = current.completed;
    if (completed !== undefined) {
      if (isPostgres) {
        newCompleted = Boolean(completed);
      } else {
        newCompleted = completed ? 1 : 0;
      }
    }

    const nowIso = new Date().toISOString();

    await query(
      `UPDATE tasks 
       SET title = ?, description = ?, priority = ?, due_date = ?, completed = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [newTitle, newDescription, newPriority, newDueDate, newCompleted, nowIso, id, userId]
    );

    const updated = await query('SELECT * FROM tasks WHERE id = ?', [id]);

    return res.json({
      message: 'Task updated successfully',
      task: {
        ...updated[0],
        completed: Boolean(updated[0].completed)
      }
    });
  } catch (err) {
    console.error('updateTask error:', err);
    return res.status(500).json({ error: 'Failed to update task' });
  }
}

export async function deleteTask(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check ownership
    const existing = await query('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    await query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);

    return res.json({
      success: true,
      message: 'Task deleted successfully',
      id
    });
  } catch (err) {
    console.error('deleteTask error:', err);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
}
