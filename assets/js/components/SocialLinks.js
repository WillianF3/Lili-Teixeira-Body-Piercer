/**
 * Integração com perfis de redes sociais.
 * POO: cada classe encapsula seus dados (constructor) e suas ações (métodos).
 * Arquivo ES module; exportações são importadas pelo SiteApp.
 */

/**
 * Centraliza os links das redes sociais externas do site.
 */
export class ExternalSocialLinks {
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
