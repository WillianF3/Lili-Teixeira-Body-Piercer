/**
 * Controladores de navegação: menu responsivo, cabeçalho, âncoras e botão de topo.
 * POO: cada classe encapsula seus dados (constructor) e suas ações (métodos).
 * Arquivo ES module; exportações são importadas pelo SiteApp.
 */

/**
 * Controla o menu de navegação em dispositivos móveis.
 * Responsável por abrir, fechar e atualizar os atributos de acessibilidade
 * do botão de menu.
 */
export class MobileMenu {
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
export class HeaderScroll {
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
 * Controla o botão de voltar ao topo.
 * O botão aparece somente depois que o usuário rola uma determinada distância.
 */
export class BackToTop {
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
export class SectionSwitcher {
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
export class AutomaticYear {
    constructor(selector = "#current-year") {
        this.element = document.querySelector(selector);
    }

    init() {
        if (this.element) this.element.textContent = String(new Date().getFullYear());
    }
}
