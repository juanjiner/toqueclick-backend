import { z } from 'zod';

const upsertSectionSchema = z.object({
    sectionKey: z.string().min(1),
    title: z.string().nullable().optional(),
    subtitle: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    ctaText: z.string().nullable().optional(),
    ctaLink: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    sortOrder: z.coerce.number().optional(),
    settings: z.any().optional().transform(val => {
        if (typeof val === 'string') {
            try { val = JSON.parse(val); } catch { return undefined; }
        }
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            return val;
        }
        return undefined;
    }),
});

const body = {
  "carouselEnabled": false,
  "ctaLink": null,
  "ctaText": null,
  "description": null,
  "sectionKey": "grid_1783975262179",
  "settings": {
    "alignItems": "",
    "backgroundColor": "#ffffff",
    "buttonBgColor": null,
    "buttonTextColor": null,
    "cardBgColor": "#ffffff",
    "cardIconSize": 40,
    "cardShadow": false,
    "cardStyle": "inline",
    "cardTextColor": null,
    "cardTitleColor": null,
    "columns": 3,
    "imagePosition": null,
    "imageWidth": null,
    "justifyContent": "",
    "layoutOrder": "row-reverse",
    "padding": "",
    "textAlign": "",
    "textColor": null,
    "textWidth": null,
    "titleColor": null,
    "videoUrl": ""
  },
  "sortOrder": 2,
  "subtitle": "Sigue estos pasos",
  "title": "Como obtener beneficios"
};

try {
  const result = upsertSectionSchema.parse(body);
  console.log("Validation passed:", JSON.stringify(result, null, 2));
} catch (error) {
  console.error("Validation failed:", error.issues);
}
