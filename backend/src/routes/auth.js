import { Router } from 'express';

const router = Router();

function mockJwt(payload) {
  return Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64');
}

router.post('/login', (req, res) => {
  const { email, password, role = 'student' } = req.body || {};
  const normalizedRole = (role || '').toLowerCase();
  const validRole = ['student', 'staff', 'admin'].includes(normalizedRole) ? normalizedRole : 'student';
  const token = mockJwt({
    sub: email || 'user@institution.edu',
    role: validRole,
    name: validRole === 'admin' ? 'Alex Chen' : validRole === 'staff' ? 'Operator' : 'Student',
  });
  return res.json({
    token,
    user: {
      email: email || 'user@institution.edu',
      role: validRole,
      name: validRole === 'admin' ? 'Alex Chen' : validRole === 'staff' ? 'Operator' : 'Student',
    },
  });
});

export default router;
