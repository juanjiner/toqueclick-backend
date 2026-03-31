export interface Page {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    published: boolean;
    updatedAt: Date;
    sections?: PageSection[];
}

export interface PageSection {
    id: string;
    pageId: string;
    sectionKey: string;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    ctaText: string | null;
    ctaLink: string | null;
    ctaText2: string | null;
    ctaLink2: string | null;
    imageUrl: string | null;
    carouselEnabled: boolean;
    regulatoryText: string | null;
    sortOrder: number;
    updatedAt: Date;
    items?: PageItem[];
}

export interface PageItem {
    id: string;
    sectionId: string;
    icon: string | null;
    title: string | null;
    description: string | null;
    imageUrl: string | null;
    ctaText: string | null;
    ctaLink: string | null;
    sortOrder: number;
    features?: PageItemFeature[];
}

export interface PageItemFeature {
    id: string;
    itemId: string;
    text: string;
    sortOrder: number;
}

export interface UpdatePageDTO {
    published?: boolean;
}

export interface UpsertSectionDTO {
    sectionKey: string;
    title?: string;
    subtitle?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    ctaText2?: string;
    ctaLink2?: string;
    imageUrl?: string;
    carouselEnabled?: boolean;
    regulatoryText?: string;
    sortOrder?: number;
}

export interface CreateItemDTO {
    icon?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaLink?: string;
    ctaText2?: string;
    ctaLink2?: string;
    sortOrder?: number;
}

export interface UpdateItemDTO extends Partial<CreateItemDTO> { }

export interface ReorderItemsDTO {
    items: { id: string; sortOrder: number }[];
}

export interface CreateFeatureDTO {
    text: string;
    sortOrder?: number;
}