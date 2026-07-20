import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { PopupController } from './popup.controller.js';
import { createPopupSchema, updatePopupSchema } from './popup.validator.js';

const router = Router();
const controller = new PopupController();

// Endpoint público para que la web cliente obtenga popups activos por página
router.get('/active', asyncHandler(controller.getActivePopups));

// Rutas protegidas (CMS)
router.get('/', authenticate, asyncHandler(controller.getAllPopups));
router.get('/:id', authenticate, asyncHandler(controller.getPopupById));
router.post('/', authenticate, validate(createPopupSchema), asyncHandler(controller.createPopup));
router.patch('/:id', authenticate, validate(updatePopupSchema), asyncHandler(controller.updatePopup));
router.delete('/:id', authenticate, asyncHandler(controller.deletePopup));

export default router;
