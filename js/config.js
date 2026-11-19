/**
 * ====================================================================
 * UNIQUE REELS — Central Brand & WhatsApp Configuration
 * ====================================================================
 * Update your WhatsApp number and branding details here in one single place.
 * Note: Phone numbers are kept strictly in the background and NOT displayed
 * visually on buttons or UI elements as requested.
 */

const CONFIG = {
  // Your WhatsApp number (digits only with country code, e.g. "917307141956"):
  whatsappNumber: "917307141956",

  brand: {
    name: "Unique Reels",
    tagline: "Stop Reposting. Start Standing Out.",
    supportingText: "Your content should be as unique as your brand. Get custom-made videos designed just for you.",
    supportHours: "Available 7 Days a Week",
    socials: {
      instagram: "https://www.instagram.com/uniquereels.studio?jplx=YTR2bmpuY3U4OGR6",
      youtube: "https://youtube.com",
      facebook: "https://facebook.com"
    }
  },

  // WhatsApp Pre-filled message templates
  messages: {
    defaultOrder: "Hello Unique Reels, I want to order a custom video.",
    customQuote: "Hello Unique Reels, I want to get a custom quote for my brand.",
    videoInquiry: "Hello Unique Reels, I loved your portfolio video and want a similar custom reel for my page.",
    consultation: "Hello Unique Reels, I want to discuss video concepts for my social media.",
    faqInquiry: "Hello Unique Reels, I have a question about your custom reel creation service."
  },

  /**
   * Helper function to build standard WhatsApp URL
   * @param {string} messageKey - Key from CONFIG.messages
   * @param {string|null} customText - Optional override text
   * @returns {string} - WhatsApp URL
   */
  getWhatsAppUrl(messageKey = "defaultOrder", customText = null) {
    const text = customText || this.messages[messageKey] || this.messages.defaultOrder;
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(text)}`;
  }
};

// Freeze to avoid accidental mutations
if (typeof Object.freeze === "function") {
  Object.freeze(CONFIG);
  Object.freeze(CONFIG.brand);
  Object.freeze(CONFIG.messages);
}
