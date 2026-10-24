import crypto from 'crypto';
import { query, isPostgres } from '../db.js';

/**
 * Record a completed Pomodoro focus session
 * POST /api/focus/sessions
 */
export async function recordFocusSession(req, res) {
  try {
    const userId = req.user.id;
    const { durationMinutes, taskId, mode = 'focus' } = req.body;

    const parsedMinutes = Number(durationMinutes);
    if (!parsedMinutes || parsedMinutes <= 0) {
      return res.status(400).json({ error: 'Valid duration in minutes is required' });
    }

    // Optional task validation
    let validTaskId = null;
    if (taskId && typeof taskId === 'string') {
      const taskCheck = await query('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
      if (taskCheck && taskCheck.length > 0) {
        validTaskId = taskId;
      }
    }

    const sessionId = 'focus-' + crypto.randomUUID();
    const validModes = ['focus', 'short_break', 'long_break'];
    const sessionMode = validModes.includes(mode) ? mode : 'focus';

    await query(
      `INSERT INTO focus_sessions (id, user_id, task_id, duration_minutes, mode)
       VALUES (?, ?, ?, ?, ?)`,
      [sessionId, userId, validTaskId, Math.round(parsedMinutes), sessionMode]
    );

    const created = await query('SELECT * FROM focus_sessions WHERE id = ?', [sessionId]);

    return res.status(201).json({
      message: 'Focus session recorded successfully',
      session: created[0]
    });
  } catch (err) {
    console.error('recordFocusSession error:', err);
    return res.status(500).json({ error: 'Failed to record focus session' });
  }
}

/**
 * Get user focus sessions history
 * GET /api/focus/sessions
 */
export async function getFocusSessions(req, res) {
  try {
    const userId = req.user.id;
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const sessions = await query(
      `SELECT s.*, t.title AS task_title, t.priority AS task_priority
       FROM focus_sessions s
       LEFT JOIN tasks t ON s.task_id = t.id
       WHERE s.user_id = ?
       ORDER BY s.completed_at DESC
       LIMIT ${limit}`,
      [userId]
    );

    return res.json({ sessions });
  } catch (err) {
    console.error('getFocusSessions error:', err);
    return res.status(500).json({ error: 'Failed to fetch focus sessions' });
  }
}

/**
 * Get aggregate focus metrics and daily breakdown
 * GET /api/focus/stats
 */
export async function getFocusStats(req, res) {
  try {
    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    // Total and Today metrics
    let aggSql;
    if (isPostgres) {
      aggSql = `
        SELECT 
          COUNT(*)::int AS total_sessions,
          COALESCE(SUM(duration_minutes), 0)::int AS total_minutes,
          COUNT(CASE WHEN completed_at::date = $1::date THEN 1 END)::int AS today_sessions,
          COALESCE(SUM(CASE WHEN completed_at::date = $1::date THEN duration_minutes ELSE 0 END), 0)::int AS today_minutes
        FROM focus_sessions
        WHERE user_id = $2 AND mode = 'focus'
      `;
    } else {
      aggSql = `
        SELECT 
          COUNT(*) AS total_sessions,
          COALESCE(SUM(duration_minutes), 0) AS total_minutes,
          SUM(CASE WHEN date(completed_at) = date(?) THEN 1 ELSE 0 END) AS today_sessions,
          COALESCE(SUM(CASE WHEN date(completed_at) = date(?) THEN duration_minutes ELSE 0 END), 0) AS today_minutes
        FROM focus_sessions
        WHERE user_id = ? AND mode = 'focus'
      `;
    }

    const aggParams = isPostgres ? [todayStr, userId] : [todayStr, todayStr, userId];
    const aggResult = await query(aggSql, aggParams);
    const agg = aggResult && aggResult[0] ? aggResult[0] : {};

    // 7-day daily focus breakdown
    const dailyBreakdown = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });

      let daySql;
      if (isPostgres) {
        daySql = `SELECT COALESCE(SUM(duration_minutes), 0)::int AS minutes, COUNT(*)::int AS sessions 
                  FROM focus_sessions WHERE user_id = $1 AND completed_at::date = $2::date AND mode = 'focus'`;
      } else {
        daySql = `SELECT COALESCE(SUM(duration_minutes), 0) AS minutes, COUNT(*) AS sessions 
                  FROM focus_sessions WHERE user_id = ? AND date(completed_at) = date(?) AND mode = 'focus'`;
      }

      const dayRes = await query(daySql, [userId, dateStr]);
      const minutes = dayRes && dayRes[0] ? Number(dayRes[0].minutes) || 0 : 0;
      const sessions = dayRes && dayRes[0] ? Number(dayRes[0].sessions) || 0 : 0;

      dailyBreakdown.push({
        date: dateStr,
        day: dayName,
        minutes,
        sessions
      });
    }

    return res.json({
      totalSessions: Number(agg.total_sessions) || 0,
      totalMinutes: Number(agg.total_minutes) || 0,
      todaySessions: Number(agg.today_sessions) || 0,
      todayMinutes: Number(agg.today_minutes) || 0,
      dailyBreakdown
    });
  } catch (err) {
    console.error('getFocusStats error:', err);
    return res.status(500).json({ error: 'Failed to fetch focus stats' });
  }
}

