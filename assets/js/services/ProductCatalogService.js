/** Carrega o catálogo do PHP/MySQL antes de registrar os eventos dos cards.
 * Se a API ainda não foi instalada, preserva os cards HTML da versão original.
 */
export class ProductCatalogService {
  constructor() {
    this.grid = document.querySelector('#productGrid');
    this.isCatalogPage = /(?:^|\/)produtos\.html$/i.test(window.location.pathname);
    this.categoryNames = {labret: 'LABRET', argola: 'ARGOLA', especial: 'ESPECIAL', cluster: 'CLÚSTER'};
  }

  async init() {
    if (!this.grid) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetch('api/products.php', {signal: controller.signal, cache: 'no-store'});
      if (!response.ok) throw new Error('Catálogo indisponível');
      const payload = await response.json();
      if (!payload || !Array.isArray(payload.products)) throw new Error('Resposta inválida');
      const products = this.isCatalogPage
        ? payload.products
        : payload.products.filter(product => Number(product.featured) === 1);
      this.render(products);
    } catch (error) {
      // Primeiro upload sem banco configurado: o HTML estático continua acessível.
      console.info('Catálogo estático em uso:', error.message);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  /** Evita injeção HTML: todos os textos vêm de textContent, e imagens são caminhos locais. */
  node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = String(text);
    return el;
  }

  safeImage(path) {
    const candidate = String(path ?? '');
    if (/^(?:images\/joias|uploads\/products)\/[\w/-]+\.(?:png|jpg|jpeg|webp)$/i.test(candidate) && !candidate.includes('..')) return candidate;
    return null;
  }

  createCard(item) {
    const article = this.node('article', 'product-card reveal');
    article.dataset.category = String(item.category ?? '');
    article.dataset.description = String(item.description ?? '');
    article.dataset.price = Number(item.price ?? 0).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
    article.dataset.name = String(item.name ?? '');
    article.id = `joia-${item.id}`;

    const imageWrap = this.node('div', 'product-image image-gold');
    const goldPath = this.safeImage(item.image_gold_path);
    const silverPath = this.safeImage(item.image_silver_path);
    const imagePath = goldPath || silverPath || this.safeImage(item.image_path);
    if (goldPath) article.dataset.imageGold = goldPath;
    if (silverPath) article.dataset.imageSilver = silverPath;
    if (goldPath || silverPath) article.dataset.selectedColor = goldPath ? 'dourado' : 'prateado';
    if (imagePath) {
      const image = this.node('img', 'card-photo');
      image.src = imagePath;
      image.alt = String(item.name ?? 'Joia');
      image.loading = 'lazy';
      imageWrap.append(image);
    }
    if (item.badge) imageWrap.append(this.node('span', 'product-tag', item.badge));
    imageWrap.append(this.node('div', 'jewel', '◇'));
    const quickView = this.node('button', 'quick-view');
    quickView.type = 'button';
    quickView.setAttribute('aria-label', `Ver ${String(item.name ?? 'produto')}`);
    const eye = this.node('i', 'fa-solid fa-eye');
    eye.setAttribute('aria-hidden', 'true');
    quickView.append(eye);
    imageWrap.append(quickView);

    const info = this.node('div', 'product-info');
    info.append(this.node('span', 'product-category', this.categoryNames[item.category] ?? 'JOIA'));
    info.append(this.node('h3', '', item.name ?? 'Produto'));
    if (goldPath && silverPath) {
      const colors = this.node('div', 'product-color-options');
      colors.setAttribute('role', 'group');
      colors.setAttribute('aria-label', 'Escolha a cor da joia');
      for (const [color, label] of [['dourado', 'Dourado'], ['prateado', 'Prateado']]) {
        const button = this.node('button', `color-option color-${color}${color === 'dourado' ? ' selected' : ''}`);
        button.type = 'button';
        button.dataset.color = color;
        button.setAttribute('aria-pressed', String(color === 'dourado'));
        const dot = this.node('span', 'color-dot');
        dot.setAttribute('aria-hidden', 'true');
        button.append(dot, this.node('span', '', label));
        colors.append(button);
      }
      info.append(colors);
    } else if (goldPath || silverPath) {
      info.append(this.node('span', 'product-color-single', `Cor: ${goldPath ? 'Dourado' : 'Prateado'}`));
    }
    info.append(this.node('p', '', item.description ?? ''));
    const bottom = this.node('div', 'product-bottom');
    bottom.append(this.node('strong', '', `R$ ${article.dataset.price}`));
    if (item.stock_quantity !== null && Number(item.stock_quantity) === 0) {
      article.dataset.soldOut = '1';
      bottom.append(this.node('span', 'stock-out', 'Esgotado'));
    } else {
      const buy = this.node('button', 'buy-btn', 'Comprar ');
      buy.type = 'button';
      const icon = this.node('i', 'fa-brands fa-whatsapp');
      icon.setAttribute('aria-hidden', 'true');
      buy.append(icon);
      bottom.append(buy);
    }
    info.append(bottom);
    article.append(imageWrap, info);
    return article;
  }

  render(products) {
    const fragment = document.createDocumentFragment();
    if (products.length === 0) {
      const empty = this.node('p', 'catalog-empty', this.isCatalogPage
        ? 'Nenhuma joia disponível no momento. Consulte nossa equipe pelo WhatsApp.'
        : 'Confira nossa coleção completa de joias na página de produtos.');
      fragment.append(empty);
    } else {
      products.forEach(item => fragment.append(this.createCard(item)));
    }
    this.grid.replaceChildren(fragment);
    if (this.isCatalogPage) {
      // Categorias sem itens continuam visíveis, mas desabilitadas.
      const available = new Set(products.map(item => item.category));
      document.querySelectorAll('.filter-btn').forEach(button => {
        if (button.dataset.filter !== 'todos') button.disabled = !available.has(button.dataset.filter);
      });
    }
  }
}
