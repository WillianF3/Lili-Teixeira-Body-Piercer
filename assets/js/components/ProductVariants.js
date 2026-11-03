/** Seleção por cor: uma única regra para cards, modal e compra pelo WhatsApp. */
export class ProductVariantSelector {
    constructor() {
        this.cards = [];
    }

    static label(color) {
        return { dourado: 'Dourado', prateado: 'Prateado' }[color] ?? '';
    }

    select(card, color) {
        if (!card || !['dourado', 'prateado'].includes(color)) return false;
        const path = color === 'dourado' ? card.dataset.imageGold : card.dataset.imageSilver;
        if (!path) return false;
        card.dataset.selectedColor = color;
        const image = card.querySelector('.card-photo');
        if (image) {
            image.src = path;
            image.alt = `${card.dataset.name || 'Joia'} — ${ProductVariantSelector.label(color)}`;
        }
        card.querySelectorAll('.color-option').forEach(button => {
            const active = button.dataset.color === color;
            button.classList.toggle('selected', active);
            button.setAttribute('aria-pressed', String(active));
        });
        return true;
    }

    init() {
        // O catálogo é carregado por fetch; capturamos os cards somente após a renderização.
        this.cards = [...document.querySelectorAll('#productGrid .product-card')];
        this.cards.forEach(card => {
            card.querySelectorAll('.color-option').forEach(button => {
                button.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.select(card, button.dataset.color);
                });
            });
        });
    }
}
