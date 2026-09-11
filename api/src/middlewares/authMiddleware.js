import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur introuvable' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token invalide' });
    }
  } else {
    return res.status(401).json({ message: 'Pas de token fourni' });
  }
};