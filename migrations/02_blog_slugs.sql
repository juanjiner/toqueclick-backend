-- Migración: Añadir campo slug a blog_articles y generar slugs existentes

-- 1. Añadir la columna (puede ser nula temporalmente para evitar errores con filas existentes)
ALTER TABLE toque.blog_articles 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- 2. Asegurarnos que la extensión unaccent exista (muy útil para limpiar tildes)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 3. Generar el slug a partir del título para los artículos existentes
-- Reemplaza espacios y caracteres raros por guiones, y convierte a minúsculas
UPDATE toque.blog_articles 
SET slug = REGEXP_REPLACE(LOWER(UNACCENT(title)), '[^a-z0-9]+', '-', 'g')
WHERE slug IS NULL;

-- 4. Si por alguna razón los títulos tuvieran guiones al inicio o al final, los limpiamos
UPDATE toque.blog_articles 
SET slug = TRIM(BOTH '-' FROM slug);

-- 5. Hacer que la columna sea única y no nula
ALTER TABLE toque.blog_articles 
ADD CONSTRAINT blog_articles_slug_key UNIQUE (slug);

ALTER TABLE toque.blog_articles 
ALTER COLUMN slug SET NOT NULL;
