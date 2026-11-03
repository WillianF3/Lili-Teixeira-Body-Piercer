/** Orquestra o catálogo, as interações e os efeitos, nesta ordem. */
import { Preloader, CounterAnimator, CardImageLoader } from "../components/Animations.js";
import { MobileMenu, HeaderScroll, BackToTop, SectionSwitcher, AutomaticYear } from "../components/Navigation.js";
import { Carousel } from "../components/Carousel.js";
import { ProductFilter, ProductModal, PurchaseButtons } from "../components/Catalog.js?v=14";
import { ProductVariantSelector } from "../components/ProductVariants.js?v=14";
import { ExternalSocialLinks } from "../components/SocialLinks.js";
import { WhatsAppService } from "../services/WhatsAppService.js?v=14";
import { ProductCatalogService } from "../services/ProductCatalogService.js?v=14";
import { EffectsApp } from "../effects/EffectsApp.js?v=13";
import { Chatbot } from "../components/Chatbot.js?v=15";

export class SiteApp {
    constructor() {
        this.preloader = new Preloader();
        this.chatbot = new Chatbot();
        this.catalog = new ProductCatalogService();
        this.effects = new EffectsApp();
        this.whatsApp = new WhatsAppService();
        this.variants = new ProductVariantSelector();
        this.componentFactories = [
            () => new MobileMenu(),
            () => new HeaderScroll(),
            () => new Carousel(),
            () => new CounterAnimator(),
            () => new ProductFilter(),
            () => new CardImageLoader(),
            () => this.variants,
            () => new ProductModal(this.whatsApp, this.variants),
            () => new PurchaseButtons(this.whatsApp),
            () => new ExternalSocialLinks(),
            () => new BackToTop(),
            () => new SectionSwitcher(),
            () => new AutomaticYear()
        ];
    }

    async init() {
        // Registra o preloader uma única vez e busca o catálogo antes dos cards.
        this.preloader.init();
        this.chatbot.init();
        await this.catalog.init();
        // Após o fetch, os controladores atualizam suas referências ao DOM.
        for (const factory of this.componentFactories) factory().init();
        this.effects.init();
    }
}
