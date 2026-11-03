/**
 * Carrossel principal: slides, indicadores, gestos, teclado e autoplay.
 * POO: cada classe encapsula seus dados (constructor) e suas ações (métodos).
 * Arquivo ES module; exportações são importadas pelo SiteApp.
 */

/**
 * Gerencia o carrossel principal do site.
 * Possui navegação por botões, indicadores, teclado, gesto de arrastar no celular
 * e troca automática de slides.
 */
export class Carousel {
    constructor(selector = ".hero-carousel", interval = 6000) {
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
        this.slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === this.currentIndex);
            slide.setAttribute("aria-hidden", String(i !== this.currentIndex));
        });
        this.dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === this.currentIndex);
            dot.setAttribute("aria-current", i === this.currentIndex ? "true" : "false");
        });
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
        if (!this.slides.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        window.clearInterval(this.timer);
        this.timer = window.setInterval(() => {
            if (!this.paused && !document.hidden) this.next();
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
