import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';
import { PageController } from './page.controller.js';
import {
    updatePageSchema,
    createPageSchema,
    upsertSectionSchema,
    createItemSchema,
    updateItemSchema,
    reorderItemsSchema,
    createFeatureSchema,
} from './page.validator.js';
import { uploadFactory } from '../../middlewares/uploadFactory.js';

const router = Router();
const controller = new PageController();
const upload = uploadFactory();

// Públicas — para el sitio web
router.get('/', asyncHandler(controller.getAll));
router.get('/category/:category', asyncHandler(controller.getByCategory));
router.get('/:slug', asyncHandler(controller.getBySlug));

// Protegidas — solo desde el CMS (admin/editor)
router.post('/',
    authenticate,
    requireRole('Superadmin', 'Editor'),
    validate(createPageSchema),
    asyncHandler(controller.createPage)
);
router.patch('/:slug',
    authenticate,
    requireRole('Superadmin', 'Editor'),
    validate(updatePageSchema),
    asyncHandler(controller.updatePage)
);
router.delete('/:id',
    authenticate,
    requireRole('Superadmin'),
    asyncHandler(controller.deletePage)
);

// Sections endpoints
router.delete('/sections/:id',
    authenticate,
    requireRole('Superadmin', 'Editor'),
    asyncHandler(controller.deleteSection)
);
router.put('/sections/reorder',
    authenticate,
    requireRole('Superadmin', 'Editor'),
    asyncHandler(controller.reorderSections)
);

router.put('/:slug/sections',
    authenticate,
    requireRole('Superadmin', 'Editor'),
    upload.single('image'),
    validate(upsertSectionSchema),
    asyncHandler(controller.upsertSection)
);

router.post('/:slug/sections/:sectionKey/items',
    authenticate,
    requireRole('Superadmin', 'Editor'),
    upload.single('image'),
    validate(createItemSchema),
    asyncHandler(controller.createItem)
);

router.patch('/items/:id',
    authenticate,
    requireRole('Superadmin', 'Editor'),
    upload.single('image'),
    validate(updateItemSchema),
    asyncHandler(controller.updateItem)
);

router.delete('/items/:id',
    authenticate,
    requireRole('Superadmin', 'Editor'),
    asyncHandler(controller.deleteItem)
);

router.put('/items/reorder',
    authenticate,
    requireRole('Superadmin', 'Editor'),
    validate(reorderItemsSchema),
    asyncHandler(controller.reorderItems)
);

router.post('/items/:itemId/features',
    authenticate,
    requireRole('Superadmin', 'Editor'),
    validate(createFeatureSchema),
    asyncHandler(controller.createFeature)
);

router.delete('/features/:id',
    authenticate,
    requireRole('Superadmin', 'Editor'),
    asyncHandler(controller.deleteFeature)
);

export default router;