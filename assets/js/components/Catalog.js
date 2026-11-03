import { normalizeText } from "../utils/TextSearch.js?v=13";

/**
 * Interação do catálogo: filtros, modal e botões de compra.
 * POO: cada classe encapsula seus dados (constructor) e suas ações (métodos).
 * Arquivo ES module; exportações são importadas pelo SiteApp.
 */

// WhatsAppService é injetado pelo SiteApp: as classes não precisam conhecer o número de contato.

/**
 * Controla os filtros da página de produtos.
 * Mostra somente os cards pertencentes à categoria selecionada.
 */
export class ProductFilter {
    constructor() {
        this.buttons = [...document.querySelectorAll(".filter-btn")];
        this.grid = document.getElementById("productGrid");
        this.cards = [...(this.grid?.querySelectorAll(".product-card") ?? [])];
        this.search = document.getElementById("catalog-search");
        this.sort = document.getElementById("catalog-sort");
        this.results = document.getElementById("catalog-results");
        this.noResults = document.getElementById("catalog-no-results");
        this.activeButton = this.buttons.find(button => button.classList.contains("active"));
        this.searchText = this.cards.map(card => normalizeText([
            card.querySelector("h3")?.textContent,
            card.querySelector(".product-category")?.textContent,
            card.dataset.name,
            card.dataset.description
        ].join(" ")));
    }

    filter() {
        const category = this.activeButton?.dataset.filter ?? "todos";
        const terms = normalizeText(this.search?.value ?? "").split(/\s+/);
        let count = 0;

        this.cards.forEach((card, index) => {
            const matchesCategory = category === "todos" || card.dataset.category === category;
            const visible = matchesCategory && terms.every(term => this.searchText[index].includes(term));
            card.hidden = !visible;
            if (visible) {
                count += 1;
                card.classList.add("show");
            }
        });

        if (this.results) this.results.textContent = count === 1 ? "1 joia encontrada" : `${count} joias encontradas`;
        if (this.noResults) this.noResults.hidden = count > 0;
    }

    orderCards() {
        const ordered = [...this.cards];
        if (this.sort && this.sort.value !== "original") {
            const price = card => Number(card.dataset.price.replaceAll(".", "").replace(",", "."));
            const direction = this.sort.value === "ascending" ? 1 : -1;
            ordered.sort((a, b) => direction * (price(a) - price(b)));
        }
        this.grid.append(...ordered);
    }

    init() {
        if (!this.buttons.length || !this.cards.length) return;

        const select = selected => {
            this.activeButton = selected;
            this.buttons.forEach(button => {
                const active = button === selected;
                button.classList.toggle("active", active);
                button.setAttribute("aria-pressed", String(active));
            });
            this.filter();
        };
        this.buttons.forEach(button => button.addEventListener("click", () => select(button)));
        this.search?.addEventListener("input", () => this.filter());
        this.sort?.addEventListener("change", () => this.orderCards());
        if (this.search) this.search.closest(".catalog-controls").hidden = false;
        select(this.activeButton);
    }
}

/**
 * Gerencia o modal de produtos e serviços.
 * Preenche imagem, título, descrição, preço e botão do WhatsApp
 * de acordo com o card selecionado.
 */
export class ProductModal {
    constructor(whatsApp, variants) {
        this.whatsApp = whatsApp;
        this.variants = variants;
        this.modal = document.getElementById("product-modal");
        this.image = document.getElementById("modal-image");
        this.title = document.getElementById("modal-title");
        this.description = document.getElementById("modalDescription");
        this.price = document.getElementById("modalPrice");
        this.buyLink = document.getElementById("modalBuy");
        this.category = document.getElementById("modalCategory") ?? this.modal?.querySelector(".modal-info .product-category");
        this.closeButton = this.modal?.querySelector(".modal-close") ?? null;
        this.productCards = [...document.querySelectorAll("#productGrid .product-card")];
        this.serviceButtons = [...document.querySelectorAll(".service-card .service-quick-view")];
    }

    // Lê os dados do card e padroniza as informações usadas pelo modal.
    getCardData(card) {
        const titleElement = card.querySelector("h3");
        const isService = card.dataset.type === "service" || card.classList.contains("service-card");

        return {
            name: titleElement?.textContent.trim() || (isService ? "este serviço" : "esta joia"),
            description: (card.dataset.description || card.querySelector("p")?.textContent || "").trim(),
            price: card.dataset.price || "",
            isService,
            soldOut: card.dataset.soldOut === "1",
            color: card.dataset.selectedColor || ''
        };
    }

    // Copia para o modal a imagem, joia ilustrativa ou ícone disponível no card.
    renderImage(card) {
        if (!this.image) return;

        this.image.innerHTML = "";
        const photo = card.querySelector(".card-photo.loaded") ?? card.querySelector(".card-photo");
        const jewel = card.querySelector(".jewel");
        const serviceIcon = card.querySelector(".product-image > i");

        if (photo?.src) {
            const modalPhoto = document.createElement("img");
            modalPhoto.className = "modal-photo";
            modalPhoto.src = photo.src;
            modalPhoto.alt = photo.alt || "Imagem do item";
            this.image.appendChild(modalPhoto);
        } else if (jewel) {
            this.image.appendChild(jewel.cloneNode(true));
        } else if (serviceIcon) {
            const icon = serviceIcon.cloneNode(true);
            icon.setAttribute("aria-hidden", "true");
            this.image.appendChild(icon);
        }

        const productImage = card.querySelector(".product-image");
        const imageClasses = productImage
            ? [...productImage.classList].filter(className => className.startsWith("image-"))
            : [];

        this.image.className = ["modal-image", ...imageClasses].join(" ");
    }

    // Preenche textos, preço, categoria e mensagem do WhatsApp no modal.
    renderContent(card) {
        const data = this.getCardData(card);

        if (this.title) this.title.textContent = data.name;
        if (this.description) this.description.textContent = data.description;
        if (this.category) this.category.textContent = data.isService ? "SERVIÇO" : "PIERCING";

        if (this.price) {
            const showPrice = !data.isService && Boolean(data.price);
            this.price.textContent = showPrice ? `R$ ${data.price}` : "";
            this.price.style.display = showPrice ? "" : "none";
        }

        if (this.buyLink) {
            const message = data.isService
                ? this.whatsApp.serviceMessage(data.name)
                : this.whatsApp.productMessage(data.name, data.color);

            if (data.soldOut) {
                this.buyLink.removeAttribute("href");
                this.buyLink.setAttribute("aria-disabled", "true");
                this.buyLink.style.pointerEvents = "none";
            } else {
                this.buyLink.href = this.whatsApp.buildUrl(message);
                this.buyLink.removeAttribute("aria-disabled");
                this.buyLink.style.pointerEvents = "";
            }
            this.buyLink.innerHTML = data.soldOut ? "Produto esgotado" : data.isService
                ? '<i class="fa-brands fa-whatsapp"></i> Quero agendar'
                : '<i class="fa-brands fa-whatsapp"></i> Quero essa joia';
        }
    }

    // Os botões do modal refletem a escolha do card e trocam a foto imediatamente.
    renderColors(card) {
        if (!this.modal || !this.price) return;
        let group = this.modal.querySelector('#modalColors');
        if (!group) {
            group = document.createElement('div');
            group.id = 'modalColors';
            group.className = 'modal-color-picker';
            group.setAttribute('role', 'group');
            group.setAttribute('aria-label', 'Escolha a cor da joia');
            this.price.before(group);
        }
        group.replaceChildren();
        const colors = [['dourado', card.dataset.imageGold], ['prateado', card.dataset.imageSilver]]
            .filter(([, path]) => Boolean(path));
        group.hidden = colors.length < 2;
        if (group.hidden) return;
        for (const [color] of colors) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `color-option color-${color}`;
            button.dataset.color = color;
            button.classList.toggle('selected', card.dataset.selectedColor === color);
            button.setAttribute('aria-pressed', String(card.dataset.selectedColor === color));
            const swatch = document.createElement('span');
            swatch.className = 'color-dot';
            swatch.setAttribute('aria-hidden', 'true');
            const text = document.createElement('span');
            text.textContent = color === 'dourado' ? 'Dourado' : 'Prateado';
            button.append(swatch, text);
            button.addEventListener('click', () => {
                if (!this.variants.select(card, color)) return;
                this.renderImage(card);
                this.renderContent(card);
                this.renderColors(card);
            });
            group.append(button);
        }
    }

    // Abre o modal com as informações do card selecionado.
    open(card) {
        if (!this.modal || !card) return;

        this.renderImage(card);
        this.renderContent(card);
        this.renderColors(card);
        this.modal.classList.add("active");
        document.body.classList.add("modal-open");
    }

    // Fecha o modal e libera novamente a rolagem da página.
    close() {
        if (!this.modal) return;
        this.modal.classList.remove("active");
        document.body.classList.remove("modal-open");
    }

    // Faz cada card abrir o modal, exceto quando o clique ocorre no botão Comprar.
    bindCards() {
        this.productCards.forEach(card => {
            card.addEventListener("click", event => {
                if (event.target.closest(".buy-btn, .color-option")) return;
                this.open(card);
            });
        });

        this.serviceButtons.forEach(button => {
            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                this.open(button.closest(".service-card"));
            });
        });
    }

    // Permite fechar pelo X, pela tecla ESC ou clicando fora de .modal-content.
    bindCloseEvents() {
        this.closeButton?.addEventListener("click", () => this.close());

        this.modal?.addEventListener("click", event => {
            // Se o clique não aconteceu dentro da caixa .modal-content, fecha o modal.
            if (!event.target.closest(".modal-content")) this.close();
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && this.modal?.classList.contains("active")) {
                this.close();
            }
        });
    }

    init() {
        if (!this.modal) return;
        this.bindCards();
        this.bindCloseEvents();
    }
}

/**
 * Controla os botões de compra e contato.
 * Ao clicar, cria uma mensagem personalizada e abre a conversa no WhatsApp.
 */
export class PurchaseButtons {
    constructor(whatsApp) {
        this.whatsApp = whatsApp;
        this.buttons = [...document.querySelectorAll(".buy-btn")];
        this.contactLinks = [...document.querySelectorAll('a[href="#contato"]')];
    }

    init() {
        this.buttons.forEach(button => {
            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();

                const card = button.closest(".product-card");
                const productName = card?.querySelector("h3")?.textContent.trim() || "produto";
                this.whatsApp.open(this.whatsApp.productMessage(productName, card?.dataset.selectedColor));
            });
        });

        this.contactLinks.forEach(link => {
            link.addEventListener("click", event => {
                event.preventDefault();
                this.whatsApp.open("Olá! Gostaria de saber mais sobre os produtos e serviços.");
            });
        });
    }
}
