import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { validateRequest } from '../middleware/validateRequest';
import { randomUUID } from 'crypto';

const router = Router();

const createNoticeSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(['General', 'Event', 'Alert']),
  priority: z.enum(['Low', 'Medium', 'High']),
  imageUrl: z.string().url().optional(),
});

router.post('/', (req, res) => {
  const noticeId = randomUUID();
  const { title, content, category, priority, imageUrl, author } = req.body;

  console.log('This is req body', req.body);

  // Fetch the user_id based on the author's email
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(author);

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const authorId = user.id;
  console.log('this is user', user)

  // Insert the notice with the fetched author_id
  db.prepare(`
    INSERT INTO notices (id, title, content, category, priority, image_url, author_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    noticeId,
    title,
    content,
    category,
    priority,
    imageUrl,
    authorId
  );

  // Retrieve and return the newly created notice
  const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(noticeId);
  res.json(notice);
});


router.get('/', (req, res) => {
  const notices = db.prepare(`
    SELECT n.*, u.name as author_name, u.email as author_email
    FROM notices n
    JOIN users u ON n.author_id = u.id
    ORDER BY n.created_at DESC
  `).all();
  res.json(notices);
});

router.get('/:id', (req, res) => {
  const notice = db.prepare(`
    SELECT n.*, u.name as author_name, u.email as author_email
    FROM notices n
    JOIN users u ON n.author_id = u.id
    WHERE n.id = ?
  `).get(req.params.id);

  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }
  res.json(notice);
});

router.put('/:id', validateRequest(createNoticeSchema), (req, res) => {
  const { userId } = req.user!;
  const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(req.params.id);

  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  if (notice.author_id !== userId) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  db.prepare(`
    UPDATE notices
    SET title = ?, content = ?, category = ?, priority = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    req.body.title,
    req.body.content,
    req.body.category,
    req.body.priority,
    req.body.imageUrl,
    req.params.id
  );

  const updatedNotice = db.prepare('SELECT * FROM notices WHERE id = ?').get(req.params.id);
  res.json(updatedNotice);
});

router.delete('/:id', (req, res) => {
  // const { userId } = req.user!;
  const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(req.params.id);

  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  // if (notice.author_id !== userId) {
  //   return res.status(403).json({ message: 'Not authorized' });
  // }

  db.prepare('DELETE FROM notices WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

export { router as noticesRouter };