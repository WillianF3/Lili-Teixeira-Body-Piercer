-- Atualização V14 para bancos existentes de Lili Body.
-- Faça backup antes de importar; execute APENAS SE as colunas ainda não existirem.
-- O painel /admin/index.php também tenta realizar esta atualização automaticamente.
ALTER TABLE `products`
  ADD COLUMN `image_gold_path` VARCHAR(255) NULL DEFAULT NULL,
  ADD COLUMN `image_silver_path` VARCHAR(255) NULL DEFAULT NULL;
