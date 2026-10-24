import crypto from 'crypto';
import { query, isPostgres } from '../db.js';

export async function getTasks(req, res) {
  try {
    const userId = req.user.id;
    const { status, search, sort, category } = req.query;

    let baseSql = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [userId];

    // Status filter: 'all' | 'pending' | 'completed' | 'todo' | 'in_progress'
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
    } else if (status === 'todo') {
      if (isPostgres) {
        baseSql += " AND (status = 'todo' OR (status IS NULL AND completed = FALSE))";
      } else {
        baseSql += " AND (status = 'todo' OR (status IS NULL AND completed = 0))";
      }
    } else if (status === 'in_progress') {
      baseSql += " AND status = 'in_progress'";
    }

    // Category filter
    if (category && typeof category === 'string' && category.trim() && category !== 'all') {
      baseSql += ' AND category = ?';
      params.push(category.trim());
    }

    // Search filter: matches on title or description (case-insensitive)
    if (search && search.trim()) {
      baseSql += ' AND (LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
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

    // Compute user's overall task counts (Total, Pending, Completed, Todo, In_Progress, Overdue)
    const todayStr = new Date().toISOString().split('T')[0];
    let countsSql;
    if (isPostgres) {
      countsSql = `
        SELECT 
          COUNT(*)::int AS total,
          COUNT(CASE WHEN completed = FALSE THEN 1 END)::int AS pending,
          COUNT(CASE WHEN completed = TRUE THEN 1 END)::int AS completed,
          COUNT(CASE WHEN (status = 'todo' OR status IS NULL) AND completed = FALSE THEN 1 END)::int AS todo,
          COUNT(CASE WHEN status = 'in_progress' AND completed = FALSE THEN 1 END)::int AS in_progress,
          COUNT(CASE WHEN completed = FALSE AND due_date IS NOT NULL AND due_date != '' AND due_date < ? THEN 1 END)::int AS overdue
        FROM tasks 
        WHERE user_id = ?
      `;
    } else {
      countsSql = `
        SELECT 
          COUNT(*) AS total,
          SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed,
          SUM(CASE WHEN (status = 'todo' OR status IS NULL) AND completed = 0 THEN 1 ELSE 0 END) AS todo,
          SUM(CASE WHEN status = 'in_progress' AND completed = 0 THEN 1 ELSE 0 END) AS in_progress,
          SUM(CASE WHEN completed = 0 AND due_date IS NOT NULL AND due_date != '' AND due_date < ? THEN 1 ELSE 0 END) AS overdue
        FROM tasks 
        WHERE user_id = ?
      `;
    }
    const countsResult = await query(countsSql, [todayStr, userId]);
    const counts = countsResult && countsResult.length > 0 ? {
      total: Number(countsResult[0].total) || 0,
      pending: Number(countsResult[0].pending) || 0,
      completed: Number(countsResult[0].completed) || 0,
      todo: Number(countsResult[0].todo) || 0,
      in_progress: Number(countsResult[0].in_progress) || 0,
      overdue: Number(countsResult[0].overdue) || 0,
    } : { total: 0, pending: 0, completed: 0, todo: 0, in_progress: 0, overdue: 0 };

    // Format boolean for completed and ensure status is populated
    const formattedTasks = tasks.map(t => {
      const isComp = Boolean(t.completed);
      let taskStatus = t.status;
      if (!taskStatus) {
        taskStatus = isComp ? 'completed' : 'todo';
      }
      return {
        ...t,
        category: t.category || 'General',
        completed: isComp,
        status: taskStatus
      };
    });

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
    const { title, description, priority, dueDate, status, category } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const cleanTitle = title.trim();
    const cleanDesc = description && typeof description === 'string' ? description.trim() : '';
    
    // Priority validation (Low / Medium / High, default Medium)
    const validPriorities = ['Low', 'Medium', 'High'];
    const finalPriority = validPriorities.includes(priority) ? priority : 'Medium';

    // Status validation
    const validStatuses = ['todo', 'in_progress', 'completed'];
    const finalStatus = validStatuses.includes(status) ? status : 'todo';

    const cleanCategory = category && typeof category === 'string' && category.trim()
      ? category.trim().substring(0, 50)
      : 'General';

    const cleanDueDate = dueDate && typeof dueDate === 'string' ? dueDate.trim() : null;
    const taskId = 'task-' + crypto.randomUUID();
    const isCompleted = finalStatus === 'completed'
      ? (isPostgres ? true : 1)
      : (isPostgres ? false : 0);

    await query(
      `INSERT INTO tasks (id, user_id, title, description, priority, category, due_date, completed, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [taskId, userId, cleanTitle, cleanDesc, finalPriority, cleanCategory, cleanDueDate, isCompleted, finalStatus]
    );

    const created = await query('SELECT * FROM tasks WHERE id = ?', [taskId]);

    return res.status(201).json({
      message: 'Task created successfully',
      task: {
        ...created[0],
        category: created[0].category || cleanCategory,
        completed: Boolean(created[0].completed),
        status: created[0].status || finalStatus
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
    const { title, description, priority, dueDate, completed, status, category } = req.body;

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

    const newCategory = (category !== undefined && typeof category === 'string' && category.trim())
      ? category.trim().substring(0, 50)
      : (current.category || 'General');

    const newDueDate = dueDate !== undefined ? (dueDate ? dueDate.trim() : null) : current.due_date;

    const validStatuses = ['todo', 'in_progress', 'completed'];
    let newStatus = current.status || (Boolean(current.completed) ? 'completed' : 'todo');
    let newCompleted = current.completed;

    if (status !== undefined && validStatuses.includes(status)) {
      newStatus = status;
      if (status === 'completed') {
        newCompleted = isPostgres ? true : 1;
      } else {
        newCompleted = isPostgres ? false : 0;
      }
    } else if (completed !== undefined) {
      const boolComp = Boolean(completed);
      newCompleted = isPostgres ? boolComp : (boolComp ? 1 : 0);
      if (boolComp) {
        newStatus = 'completed';
      } else if (newStatus === 'completed') {
        newStatus = 'todo';
      }
    }

    const nowIso = new Date().toISOString();

    await query(
      `UPDATE tasks 
       SET title = ?, description = ?, priority = ?, category = ?, due_date = ?, completed = ?, status = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [newTitle, newDescription, newPriority, newCategory, newDueDate, newCompleted, newStatus, nowIso, id, userId]
    );

    const updated = await query('SELECT * FROM tasks WHERE id = ?', [id]);

    return res.json({
      message: 'Task updated successfully',
      task: {
        ...updated[0],
        category: updated[0].category || newCategory,
        completed: Boolean(updated[0].completed),
        status: updated[0].status || newStatus
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

export async function clearCompletedTasks(req, res) {
  try {
    const userId = req.user.id;
    let result;
    if (isPostgres) {
      result = await query('DELETE FROM tasks WHERE user_id = $1 AND completed = TRUE', [userId]);
    } else {
      result = await query('DELETE FROM tasks WHERE user_id = ? AND completed = 1', [userId]);
    }

    return res.json({
      success: true,
      message: 'All completed tasks cleared successfully'
    });
  } catch (err) {
    console.error('clearCompletedTasks error:', err);
    return res.status(500).json({ error: 'Failed to clear completed tasks' });
  }
}
