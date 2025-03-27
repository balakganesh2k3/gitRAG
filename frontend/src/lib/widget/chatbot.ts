interface ChatbotConfig {
  containerId: string;
  repositories: string[];
  theme?: "light" | "dark";
  // Add new configuration options
  apiKey?: string;
  maxTokens?: number;
  allowedDomains?: string[];
  accessToken?: string;
  permissions?: {
    allowCode: boolean;
    allowDocs: boolean;
    allowIssues: boolean;
  };
}

class GitRAGWidget {
  private config: ChatbotConfig;
  private container: HTMLElement | null = null;
  private accessToken: string | null = null;

  constructor(config: ChatbotConfig) {
    this.config = config;
    this.validateConfig();
    this.init();
  }

  private validateConfig() {
    // Validate domain
    const currentDomain = window.location.hostname;
    if (this.config.allowedDomains && !this.config.allowedDomains.includes(currentDomain)) {
      throw new Error('Unauthorized domain');
    }
  }

  private async init() {
    this.container = document.getElementById(this.config.containerId);
    if (!this.container) {
      console.error(`Container #${this.config.containerId} not found`);
      return;
    }

    await this.loadStyles();
    this.renderWidget();
    this.setupEventListeners();
  }

  private async loadStyles() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/widget/styles.css";
    document.head.appendChild(link);
  }

  private renderWidget() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="gitrag-widget ${this.config.theme || 'light'}">
        <div class="gitrag-header">
          <h3>Repository Assistant</h3>
        </div>
        <div class="gitrag-messages"></div>
        <div class="gitrag-input">
          <input type="text" placeholder="Ask a question..." />
          <button>Send</button>
        </div>
      </div>
    `;
  }

  private setupEventListeners() {
    const input = this.container?.querySelector("input");
    const button = this.container?.querySelector("button");

    if (!input || !button) return;

    const handleSend = async () => {
      const message = input.value.trim();
      if (!message) return;

      input.value = "";
      await this.sendMessage(message);
    };

    button.addEventListener("click", handleSend);
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSend();
    });
  }

  private async sendMessage(message: string) {
    try {
      const response = await fetch("/api/widget/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.accessToken}`,
          "X-API-Key": this.config.apiKey || ''
        },
        body: JSON.stringify({
          message,
          repositories: this.config.repositories,
          permissions: this.config.permissions
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      this.appendMessage("user", message);
      this.appendMessage("assistant", data.response);
    } catch (error) {
      console.error("Failed to send message:", error);
      this.appendMessage("system", "Sorry, an error occurred. Please try again.");
    }
  }

  private appendMessage(role: "user" | "assistant" | "system", content: string) {
    const messages = this.container?.querySelector(".gitrag-messages");
    if (!messages) return;

    const messageEl = document.createElement("div");
    messageEl.className = `gitrag-message ${role}`;
    messageEl.textContent = content;
    messages.appendChild(messageEl);
    messages.scrollTop = messages.scrollHeight;
  }
}

// Export for use in embed code
;(window as any).GitRAGWidget = GitRAGWidget;
