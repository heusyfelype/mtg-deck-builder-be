import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate, createUserSchema, updateUserSchema } from '../middlewares/validationMiddleware';

const userRoutes = Router();

/**
 * @route   POST /api/users
 * @desc    Criar novo usuário (admin apenas)
 * @access  Public (pode ser restrito para admin)
 */
userRoutes.post('/', validate(createUserSchema), userController.createUser);

/**
 * @route   GET /api/users/profile
 * @desc    Obter perfil do usuário logado
 * @access  Private
 */
userRoutes.get('/profile', authMiddleware, userController.getProfile);

/**
 * @route   GET /api/users
 * @desc    Obter todos os usuários (admin apenas)
 * @access  Private
 */
userRoutes.get('/', authMiddleware, userController.getAllUsers);

/**
 * @route   GET /api/users/search
 * @desc    Buscar usuários por nome ou email (paginado)
 * @access  Private
 */
userRoutes.get('/search', authMiddleware, userController.searchUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obter usuário por ID
 * @access  Private
 */
userRoutes.get('/:id', authMiddleware, userController.getUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Atualizar usuário
 * @access  Private
 */
userRoutes.put('/:id', authMiddleware, validate(updateUserSchema), userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Deletar usuário
 * @access  Private
 */
userRoutes.delete('/:id', authMiddleware, userController.deleteUser);

export { userRoutes };