-- Migración: Actualizaciones para Módulo de Campañas y CMS Landing Pages
-- 1. Cambios en la tabla toque.campaigns (Soporte múltiples imágenes y Kill Switch)
ALTER TABLE toque.campaigns
ADD COLUMN banner_image_urls text [];
ALTER TABLE toque.campaigns
ADD COLUMN is_active boolean DEFAULT true;
-- 2. Cambios en la tabla toque.promotions (Fechas y CTAs)
ALTER TABLE toque.promotions
ADD COLUMN start_date date;
ALTER TABLE toque.promotions
ADD COLUMN cta_text character varying(50);
ALTER TABLE toque.promotions
ADD COLUMN cta_url text;
-- 3. Nueva tabla para Banners Múltiples de Campaña
CREATE TABLE toque.campaign_banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES toque.campaigns(id) ON DELETE CASCADE,
    business_id UUID REFERENCES toque.businesses(id),
    image_url TEXT NOT NULL,
    title VARCHAR(255),
    cta_text VARCHAR(50) DEFAULT 'Ver promociones',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--Eliminar la columna de text[] antigua ya no se usará
ALTER TABLE toque.campaigns DROP COLUMN banner_image_urls;
-- 4. Cambios para el CMS de Landing Pages
ALTER TABLE toque.pages
ADD COLUMN category VARCHAR(50);
ALTER TABLE toque.page_sections
ADD COLUMN settings JSONB DEFAULT '{}';
-- 5. Nueva tabla para Pop-ups
CREATE TABLE toque.popups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(70) NOT NULL,
    description VARCHAR(250),
    icon VARCHAR(20) NOT NULL CHECK (icon IN ('INFO', 'WARNING', 'GIFT', 'MEGAPHONE')),
    position VARCHAR(20) NOT NULL CHECK (position IN ('CENTER', 'BOTTOM_RIGHT')),
    cta_text VARCHAR(30),
    cta_link VARCHAR(255),
    is_active BOOLEAN DEFAULT false,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    display_rules JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);