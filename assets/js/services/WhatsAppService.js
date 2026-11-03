/**
 * Serviço centralizado para formar e abrir URLs de contato WhatsApp.
 * POO: cada classe encapsula seus dados (constructor) e suas ações (métodos).
 * Arquivo ES module; exportações são importadas pelo SiteApp.
 */

/**
 * Centraliza toda a integração com o WhatsApp.
 * Assim, o número e a criação dos links ficam em apenas um lugar do sistema.
 */
export class WhatsAppService {
    constructor(phone = "5547997560445") {
        this.phone = phone;
    }

    // Monta a URL do WhatsApp incluindo a mensagem já codificada para a URL.
    buildUrl(message = "") {
        return `https://wa.me/${this.phone}?text=${encodeURIComponent(message)}`;
    }

    // Uma única fonte de textos para o modal e os botões de compra.
    productMessage(name, color = '') {
        const colorLabel = { dourado: 'dourada', prateado: 'prateada' }[color] ?? '';
        return `Olá! Tenho interesse na joia ${name}${colorLabel ? ` na cor ${colorLabel}` : ''}. Pode confirmar a disponibilidade e me orientar sobre a compra?`;
    }

    serviceMessage(name) {
        return `Olá! Gostaria de saber mais e agendar o serviço de ${name}.`;
    }

    // Abre o WhatsApp em uma nova aba com a mensagem informada.
    open(message = "") {
        window.open(this.buildUrl(message), "_blank", "noopener,noreferrer");
    }
}
