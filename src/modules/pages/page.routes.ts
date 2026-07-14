import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { PageController } from './page.controller.js';
import {
    updatePageSchema,
    createPageSchema,
    upsertSectionSchema,
    createItemSchema,
    updateItemSchema,
    reorderItemsSchema,
} from './page.validator.js';
import { uploadFactory } from '../../middlewares/uploadFactory.js';

const router = Router();
const controller = new PageController();
const upload = uploadFactory();

// Públicas — para el sitio web
router.get('/', asyncHandler(controller.getAll));
router.get('/category/:category', asyncHandler(controller.getByCategory));
router.get('/:slug', asyncHandler(controller.getBySlug));

// Protegidas — solo desde el CMS
router.post('/',
    authenticate,
    validate(createPageSchema),
    asyncHandler(controller.createPage)
);
router.patch('/:slug',
    authenticate,
    validate(updatePageSchema),
    asyncHandler(controller.updatePage)
);

// Sections endpoints
router.delete('/sections/:id', authenticate, asyncHandler(controller.deleteSection));
router.put('/sections/reorder', authenticate, asyncHandler(controller.reorderSections));

router.put('/:slug/sections',
    authenticate,
    upload.single('image'),
    validate(upsertSectionSchema),
    asyncHandler(controller.upsertSection)
);

router.post('/:slug/sections/:sectionKey/items',
    authenticate,
    upload.single('image'),
    validate(createItemSchema),
    asyncHandler(controller.createItem)
);

router.patch('/items/:id',
    authenticate,
    upload.single('image'),
    validate(updateItemSchema),
    asyncHandler(controller.updateItem)
);

router.delete('/items/:id',
    authenticate,
    asyncHandler(controller.deleteItem)
);

router.put('/items/reorder',
    authenticate,
    validate(reorderItemsSchema),
    asyncHandler(controller.reorderItems)
);

router.post('/items/:itemId/features',
    authenticate,
    asyncHandler(controller.createFeature)
);

router.delete('/features/:id',
    authenticate,
    asyncHandler(controller.deleteFeature)
);

export default router;