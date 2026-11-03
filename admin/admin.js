/** Busca administrativa isolada, reutilizando a normalização do catálogo. */
import { normalizeText } from "../assets/js/utils/TextSearch.js?v=13";

class AdminProductSearch {
    constructor() {
        this.input = document.getElementById("productSearch");
        this.cards = [...document.querySelectorAll(".admin-product")];
        this.count = document.getElementById("searchCount");
        this.empty = document.getElementById("searchEmpty");
    }

    filter() {
        if (!this.input) return;
        const term = normalizeText(this.input.value);
        let visible = 0;
        this.cards.forEach(card => {
            const found = normalizeText(card.dataset.search).includes(term);
            card.hidden = !found;
            if (found) visible++;
        });
        if (this.count) this.count.textContent = `${visible} de ${this.cards.length} joias exibidas`;
        if (this.empty) this.empty.hidden = visible !== 0 || this.cards.length === 0;
    }

    init() {
        if (!this.input) return;
        this.input.addEventListener("input", () => this.filter());
        this.filter();
    }
}

new AdminProductSearch().init();

/** Prévia local das duas imagens antes de enviá-las ao servidor. */
class VariantImagePreview {
    init() {
        document.querySelectorAll('[data-preview-target]').forEach(input => {
            input.addEventListener('change', () => {
                const preview = document.getElementById(input.dataset.previewTarget);
                if (!preview || !input.files?.[0]) return;
                const file = input.files[0];
                if (!['image/jpeg','image/png','image/webp'].includes(file.type)) return;
                const url = URL.createObjectURL(file);
                const image = document.createElement('img');
                image.alt = 'Prévia da imagem escolhida';
                image.onload = () => URL.revokeObjectURL(url);
                image.src = url;
                preview.replaceChildren(image);
            });
        });
    }
}
new VariantImagePreview().init();
