-- Catálogo e painel da Lili Teixeira (MySQL 8 / MariaDB).
-- Crie o banco pelo hPanel e selecione-o no phpMyAdmin antes de importar.
-- A importação inicial dos produtos usa IDs 1 a 12 e não altera os já cadastrados.
SET NAMES utf8mb4;
CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(30) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  image_path VARCHAR(255) NOT NULL DEFAULT '',
  badge VARCHAR(45) NOT NULL DEFAULT '',
  active TINYINT(1) NOT NULL DEFAULT 1,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  stock_quantity INT UNSIGNED DEFAULT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 100,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_visibility_order(active,sort_order,id),
  INDEX idx_category(category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Produtos existentes no HTML da versão 10:

INSERT INTO products (id,name,description,category,price,image_path,badge,active,featured,stock_quantity,sort_order) VALUES (1,'Navete em zircônia Gold','Design delicado com duas pedras em formato de folha, trazendo brilho e sofisticação para a composição.','labret',107.00,'images/joias/argola-dourada.webp','MAIS VENDIDO',1,1,NULL,10) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO products (id,name,description,category,price,image_path,badge,active,featured,stock_quantity,sort_order) VALUES (2,'Clúster zircônia','Composição de pedras em diferentes formatos que cria um visual moderno, delicado e cheio de brilho.','cluster',145.00,'images/joias/pedrinha-crystal.webp','',1,1,NULL,20) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO products (id,name,description,category,price,image_path,badge,active,featured,stock_quantity,sort_order) VALUES (3,'Navel Piercing Heart','Uma combinação delicada de ponto de luz com pedra em formato de coração, ideal para quem ama brilho e romantismo.','especial',145.00,'images/joias/heart-piercing.webp','NOVO',1,1,NULL,30) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO products (id,name,description,category,price,image_path,badge,active,featured,stock_quantity,sort_order) VALUES (4,'Argola tripla trançada','Argola com acabamento torcido e visual minimalista, perfeita para composições modernas e elegantes.','argola',78.00,'images/joias/argola-premium.webp','',1,1,NULL,40) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO products (id,name,description,category,price,image_path,badge,active,featured,stock_quantity,sort_order) VALUES (5,'Duplo Marquise e Zircônia Dourado','Piercing dourado com duas hastes delicadas, zircônias navete e pontos de luz. Ideal para tragus, hélix ou flat..','labret',107.00,'images/joias/duplo-marquise-zirconia-dourado.webp','',1,0,NULL,50) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO products (id,name,description,category,price,image_path,badge,active,featured,stock_quantity,sort_order) VALUES (6,'Barbell Ornamentado com Zircônias','Piercing em arco com zircônias crescentes, feito em titânio grau médico. Design delicado, minimalista e elegante.','especial',145.00,'images/joias/mamilo.webp','',1,0,NULL,60) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO products (id,name,description,category,price,image_path,badge,active,featured,stock_quantity,sort_order) VALUES (7,'Cluster Tiara Marquise Dourado','Piercing Clúster  dourado em formato de tiara, com zircônias cristal. Elegante e ideal para hélix, conch ou flat..','cluster',180.00,'images/joias/cluster-tiara-dourado.webp','',1,0,NULL,70) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO products (id,name,description,category,price,image_path,badge,active,featured,stock_quantity,sort_order) VALUES (8,'Estrela em Zircônias Dourado','Piercing dourado com topo geométrico e zircônias, de design delicado e moderno.','labret',120.00,'images/joias/estrela-zirconia-dourada.webp','',1,0,NULL,80) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO products (id,name,description,category,price,image_path,badge,active,featured,stock_quantity,sort_order) VALUES (9,'Ramalhete Folha Dourado','Piercing dourado com design de folhas e zircônias brilhantes, feito em titânio biocompatível..','labret',120.00,'images/joias/ramalhete-zirconias-dourado.webp','',1,0,NULL,90) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO products (id,name,description,category,price,image_path,badge,active,featured,stock_quantity,sort_order) VALUES (10,'Labret Florzinha','Piercing dourado com três zircônias, delicado e elegante, ideal para tragus ou hélix.','labret',150.00,'images/joias/florzinha.webp','',1,0,NULL,100) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO products (id,name,description,category,price,image_path,badge,active,featured,stock_quantity,sort_order) VALUES (11,'Piercing Duplo Baguete e Marquise Dourado','Piercing dourado com zircônias baguete e marquise, em design moderno e assimétrico.','labret',107.00,'images/joias/duplo-baguete-marquise.webp','',1,0,NULL,110) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO products (id,name,description,category,price,image_path,badge,active,featured,stock_quantity,sort_order) VALUES (12,'Cubic zirconia navel','Joia em Titânio com zircônias navete lapidadas e ponto de luz na parte superior, ideal para perfuração em Umbigo','especial',145.00,'images/joias/piercing-umbigo-zirconias.webp','',1,0,NULL,120) ON DUPLICATE KEY UPDATE id=id;
