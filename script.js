/**
 * Lili Body Piercing
 * Arquitetura orientada a objetos (POO) com classes ES6.
 * Cada classe possui uma responsabilidade específica e é inicializada por SiteApp.
 */

/**
 * Controla a tela de carregamento inicial do site.
 * Remove o preloader assim que a página estiver pronta e também possui
 * um tempo limite de segurança para evitar que ele fique preso na tela.
 */
class Preloader {
    constructor(selector = "#preloader") {
        this.element = document.querySelector(selector);
        this.fallbackTimer = null;
    }

    // Esconde o preloader e depois o remove do HTML.
    hide() {
        if (!this.element || this.element.classList.contains("hide")) return;

        this.element.classList.add("hide");
        window.setTimeout(() => this.element?.remove(), 220);
    }

    // Inicializa o preloader assim que o DOM estiver disponível.
    init() {
        if (!this.element) return;

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => this.hide(), { once: true });
        } else {
            this.hide();
        }

        this.fallbackTimer = window.setTimeout(() => this.hide(), 900);
    }
}

/**
 * Controla o menu de navegação em dispositivos móveis.
 * Responsável por abrir, fechar e atualizar os atributos de acessibilidade
 * do botão de menu.
 */
class MobileMenu {
    constructor() {
        this.toggle = document.getElementById("menu-toggle");
        this.nav = document.querySelector(".nav");
        this.header = document.querySelector(".header");
    }

    // Define explicitamente se o menu móvel deve ficar aberto ou fechado.
    setOpen(open) {
        if (!this.toggle || !this.nav) return;

        this.toggle.classList.toggle("active", open);
        this.nav.classList.toggle("active", open);
        this.toggle.setAttribute("aria-expanded", String(open));
        this.toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    }

    // Retorna true quando o menu móvel está aberto.
    isOpen() {
        return Boolean(this.nav?.classList.contains("active"));
    }

    // Registra os eventos de clique, redimensionamento e clique fora do menu.
    bindEvents() {
        this.toggle?.addEventListener("click", event => {
            event.stopPropagation();
            this.setOpen(!this.isOpen());
        });

        this.nav?.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => this.setOpen(false));
        });

        document.addEventListener("click", event => {
            if (this.isOpen() && !event.target.closest(".header")) {
                this.setOpen(false);
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 850) this.setOpen(false);
        });
    }

    init() {
        if (!this.toggle || !this.nav) return;
        this.bindEvents();
    }
}

/**
 * Adiciona um estilo diferente ao cabeçalho quando o usuário rola a página.
 * A classe CSS "scrolled" é aplicada após ultrapassar o limite configurado.
 */
class HeaderScroll {
    constructor(selector = "header") {
        this.header = document.querySelector(selector);
        this.threshold = 50;
    }

    // Atualiza a aparência do header conforme a posição vertical da página.
    update() {
        this.header?.classList.toggle("scrolled", window.scrollY > this.threshold);
    }

    init() {
        if (!this.header) return;
        this.update();
        window.addEventListener("scroll", () => this.update(), { passive: true });
    }
}

/**
 * Gerencia o carrossel principal do site.
 * Possui navegação por botões, indicadores, teclado, gesto de arrastar no celular
 * e troca automática de slides.
 */
class Carousel {
    constructor(selector = ".hero-carousel", interval = 5000) {
        this.root = document.querySelector(selector);
        this.slides = this.root ? [...this.root.querySelectorAll(".carousel-slide")] : [];
        this.dots = this.root ? [...this.root.querySelectorAll(".carousel-dot")] : [];
        this.prevButton = this.root?.querySelector(".carousel-prev") ?? null;
        this.nextButton = this.root?.querySelector(".carousel-next") ?? null;
        this.currentIndex = 0;
        this.intervalTime = interval;
        this.timer = null;
        this.paused = false;
        this.touchStartX = 0;
    }

    // Mantém o índice do slide dentro dos limites do carrossel.
    normalizeIndex(index) {
        if (!this.slides.length) return 0;
        return (index + this.slides.length) % this.slides.length;
    }

    // Exibe o slide indicado e sincroniza os pontos de navegação.
    show(index) {
        if (!this.slides.length) return;

        this.currentIndex = this.normalizeIndex(index);
        this.slides.forEach((slide, i) => slide.classList.toggle("active", i === this.currentIndex));
        this.dots.forEach((dot, i) => dot.classList.toggle("active", i === this.currentIndex));
    }

    // Avança para o próximo slide.
    next() {
        this.show(this.currentIndex + 1);
    }

    // Retorna para o slide anterior.
    previous() {
        this.show(this.currentIndex - 1);
    }

    // Inicia a troca automática de slides no intervalo definido.
    startAutoPlay() {
        if (!this.slides.length) return;

        window.clearInterval(this.timer);
        this.timer = window.setInterval(() => {
            if (!this.paused) this.next();
        }, this.intervalTime);
    }

    // Reinicia o autoplay após uma interação manual do usuário.
    restartAutoPlay() {
        this.startAutoPlay();
    }

    // Detecta gesto horizontal no celular para avançar ou voltar slides.
    handleSwipe(endX) {
        const difference = this.touchStartX - endX;
        if (difference > 50) this.next();
        if (difference < -50) this.previous();
        if (Math.abs(difference) > 50) this.restartAutoPlay();
    }

    // Adiciona eventos aos botões anterior/próximo e aos indicadores do carrossel.
    bindControls() {
        this.nextButton?.addEventListener("click", () => {
            this.next();
            this.restartAutoPlay();
        });

        this.prevButton?.addEventListener("click", () => {
            this.previous();
            this.restartAutoPlay();
        });

        this.dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                this.show(index);
                this.restartAutoPlay();
            });
        });
    }

    // Pausa no mouse e habilita a navegação por toque em dispositivos móveis.
    bindPointerEvents() {
        this.root?.addEventListener("mouseenter", () => {
            this.paused = true;
        });

        this.root?.addEventListener("mouseleave", () => {
            this.paused = false;
        });

        this.root?.addEventListener("touchstart", event => {
            this.paused = true;
            this.touchStartX = event.changedTouches[0]?.screenX ?? 0;
        }, { passive: true });

        this.root?.addEventListener("touchend", event => {
            const touchEndX = event.changedTouches[0]?.screenX ?? this.touchStartX;
            this.handleSwipe(touchEndX);

            window.setTimeout(() => {
                this.paused = false;
            }, 3000);
        }, { passive: true });
    }

    // Permite controlar o carrossel pelas setas esquerda e direita do teclado.
    bindKeyboard() {
        if (!this.root) return;

        this.root.setAttribute("tabindex", "0");
        this.root.addEventListener("keydown", event => {
            if (event.key === "ArrowRight") {
                this.next();
                this.restartAutoPlay();
            }

            if (event.key === "ArrowLeft") {
                this.previous();
                this.restartAutoPlay();
            }
        });
    }

    init() {
        if (!this.root || !this.slides.length) return;

        this.bindControls();
        this.bindPointerEvents();
        this.bindKeyboard();
        this.show(0);
        this.startAutoPlay();
    }
}

/**
 * Exibe elementos com animação quando eles entram na área visível da tela.
 * Usa IntersectionObserver para evitar cálculos constantes durante o scroll.
 */
class RevealOnScroll {
    constructor(selector = ".reveal") {
        this.elements = [...document.querySelectorAll(selector)];
        this.observer = null;
    }

    init() {
        if (!this.elements.length) return;

        if (!("IntersectionObserver" in window)) {
            this.elements.forEach(element => element.classList.add("visible"));
            return;
        }

        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.15 });

        this.elements.forEach(element => this.observer.observe(element));
    }
}

/**
 * Anima números de elementos com a classe .counter quando aparecem na tela.
 * O valor final é informado pelo atributo data-target do elemento.
 */
class CounterAnimator {
    constructor(selector = ".counter") {
        this.counters = [...document.querySelectorAll(selector)];
        this.observer = null;
    }

    // Incrementa o número gradualmente até alcançar o valor definido em data-target.
    animate(counter) {
        const target = Number(counter.dataset.target);
        if (!Number.isFinite(target)) return;

        let current = 0;
        const increment = target / 100;

        const update = () => {
            current += increment;
            if (current < target) {
                counter.textContent = String(Math.ceil(current));
                requestAnimationFrame(update);
                return;
            }
            counter.textContent = String(target);
        };

        update();
    }

    init() {
        if (!this.counters.length) return;

        if (!("IntersectionObserver" in window)) {
            this.counters.forEach(counter => this.animate(counter));
            return;
        }

        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                this.animate(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.5 });

        this.counters.forEach(counter => this.observer.observe(counter));
    }
}

/**
 * Controla os filtros da página de produtos.
 * Mostra somente os cards pertencentes à categoria selecionada.
 */
class ProductFilter {
    constructor() {
        this.buttons = [...document.querySelectorAll(".filter-btn")];
        this.cards = [...document.querySelectorAll("#productGrid .product-card")];
    }

    // Destaca visualmente o botão do filtro atualmente selecionado.
    setActiveButton(selectedButton) {
        this.buttons.forEach(button => button.classList.toggle("active", button === selectedButton));
    }

    // Mostra os produtos da categoria escolhida e oculta os demais.
    filter(category) {
        this.cards.forEach(card => {
            const visible = category === "todos" || card.dataset.category === category;

            if (visible) {
                card.style.display = "";
                requestAnimationFrame(() => card.classList.add("show"));
            } else {
                card.classList.remove("show");
                card.style.display = "none";
            }
        });
    }

    init() {
        if (!this.buttons.length || !this.cards.length) return;

        this.buttons.forEach(button => {
            button.addEventListener("click", () => {
                this.setActiveButton(button);
                this.filter(button.dataset.filter ?? "todos");
            });
        });
    }
}

/**
 * Marca as imagens dos cards como carregadas.
 * A classe CSS "loaded" permite controlar transições e efeitos visuais.
 */
class CardImageLoader {
    constructor(selector = ".card-photo") {
        this.images = [...document.querySelectorAll(selector)];
    }

    // Adiciona a classe loaded quando a imagem foi carregada corretamente.
    markAsLoaded(image) {
        if (image.naturalWidth > 0) image.classList.add("loaded");
    }

    init() {
        this.images.forEach(image => {
            image.addEventListener("load", () => this.markAsLoaded(image));
            if (image.complete) this.markAsLoaded(image);
        });
    }
}

/**
 * Centraliza toda a integração com o WhatsApp.
 * Assim, o número e a criação dos links ficam em apenas um lugar do sistema.
 */
class WhatsAppService {
    constructor(phone = "5547997560445") {
        this.phone = phone;
    }

    // Monta a URL do WhatsApp incluindo a mensagem já codificada para a URL.
    buildUrl(message = "") {
        return `https://wa.me/${this.phone}?text=${encodeURIComponent(message)}`;
    }

    // Abre o WhatsApp em uma nova aba com a mensagem informada.
    open(message = "") {
        window.open(this.buildUrl(message), "_blank", "noopener,noreferrer");
    }
}

/**
 * Gerencia o modal de produtos e serviços.
 * Preenche imagem, título, descrição, preço e botão do WhatsApp
 * de acordo com o card selecionado.
 */
class ProductModal {
    constructor(whatsApp) {
        this.whatsApp = whatsApp;
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
            isService
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
                ? `Olá! Gostaria de saber mais e agendar o serviço de ${data.name}.`
                : `Olá! Gostaria de saber mais sobre ${data.name}.`;

            this.buyLink.href = this.whatsApp.buildUrl(message);
            this.buyLink.innerHTML = data.isService
                ? '<i class="fa-brands fa-whatsapp"></i> Quero agendar'
                : '<i class="fa-brands fa-whatsapp"></i> Quero essa joia';
        }
    }

    // Abre o modal com as informações do card selecionado.
    open(card) {
        if (!this.modal || !card) return;

        this.renderImage(card);
        this.renderContent(card);
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
                if (event.target.closest(".buy-btn")) return;
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
class PurchaseButtons {
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
                this.whatsApp.open(`Olá! Gostaria de saber mais sobre o ${productName}.`);
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

/**
 * Centraliza os links das redes sociais externas do site.
 */
class ExternalSocialLinks {
    constructor() {
        this.instagramUrl = "https://www.instagram.com/bodylili/";
        this.instagramElements = [...document.querySelectorAll(".instagram-link")];
    }

    init() {
        this.instagramElements.forEach(element => {
            element.addEventListener("click", event => {
                event.preventDefault();
                window.open(this.instagramUrl, "_blank", "noopener,noreferrer");
            });
        });
    }
}

/**
 * Controla o botão de voltar ao topo.
 * O botão aparece somente depois que o usuário rola uma determinada distância.
 */
class BackToTop {
    constructor(selector = ".back-top") {
        this.button = document.querySelector(selector);
        this.threshold = 500;
    }

    // Mostra ou esconde o botão conforme a distância rolada na página.
    updateVisibility() {
        this.button?.classList.toggle("show", window.scrollY > this.threshold);
    }

    init() {
        if (!this.button) return;

        this.updateVisibility();
        window.addEventListener("scroll", () => this.updateVisibility(), { passive: true });
        this.button.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}

/**
 * Alterna entre as seções de Joias e Serviços da página inicial.
 * Também atualiza o estado visual e os atributos de acessibilidade dos botões.
 */
class SectionSwitcher {
    constructor() {
        this.buttons = [...document.querySelectorAll(".section-shortcuts [data-show]")];
        this.products = document.getElementById("produtos");
        this.services = document.getElementById("servicos");
        this.links = [...document.querySelectorAll('a[href="#produtos"], a[href="#servicos"]')];
    }

    // Exibe a seção escolhida e, quando solicitado, rola suavemente até ela.
    show(category, shouldScroll = true) {
        if (!this.products || !this.services) return;

        const servicesActive = category === "servicos";
        this.products.hidden = servicesActive;
        this.services.hidden = !servicesActive;

        this.buttons.forEach(button => {
            const active = button.dataset.show === category;
            button.classList.toggle("is-selected", active);
            button.setAttribute("aria-pressed", String(active));
        });

        if (shouldScroll) {
            const target = servicesActive ? this.services : this.products;
            target.scrollIntoView({ behavior: "smooth" });
        }
    }

    init() {
        if (!this.products || !this.services || !this.buttons.length) return;

        this.buttons.forEach(button => {
            button.addEventListener("click", () => this.show(button.dataset.show));
        });

        this.links.forEach(link => {
            link.addEventListener("click", () => {
                const category = link.getAttribute("href")?.slice(1);
                if (category) this.show(category, false);
            });
        });

        if (window.location.hash === "#servicos") {
            this.show("servicos", false);
        }
    }
}

/**
 * Atualiza automaticamente o ano exibido no rodapé.
 * Evita a necessidade de alterar o HTML manualmente todos os anos.
 */
class AutomaticYear {
    constructor(selector = "#current-year") {
        this.element = document.querySelector(selector);
    }

    init() {
        if (this.element) this.element.textContent = String(new Date().getFullYear());
    }
}

/**
 * Classe principal da aplicação.
 * Cria os serviços compartilhados e inicializa todos os componentes do site.
 * Funciona como o ponto central da arquitetura orientada a objetos.
 */
class SiteApp {
    constructor() {
        this.whatsApp = new WhatsAppService();
        // Todos os recursos do site são registrados aqui.
        // Para adicionar um novo componente POO, basta criar a classe e incluí-la nesta lista.
        this.components = [
            new Preloader(),
            new MobileMenu(),
            new HeaderScroll(),
            new Carousel(),
            new RevealOnScroll(),
            new CounterAnimator(),
            new ProductFilter(),
            new CardImageLoader(),
            new ProductModal(this.whatsApp),
            new PurchaseButtons(this.whatsApp),
            new ExternalSocialLinks(),
            new BackToTop(),
            new SectionSwitcher(),
            new AutomaticYear()
        ];
    }

    // Inicializa todos os componentes registrados na aplicação.
    init() {
        this.components.forEach(component => component.init());
    }
}

// Ponto de entrada da aplicação: cria o site e inicializa todas as funcionalidades.
const app = new SiteApp();
app.init();
