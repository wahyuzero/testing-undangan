/**
 * Simple Toast Notification Library
 * Usage: Toast.show('Message', 'type');
 * Types: success, error, warning, info
 */

const Toast = {
    init() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);

        // Add styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .toast {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-left: 4px solid #7c9885;
                padding: 16px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 300px;
                transform: translateX(120%);
                transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                pointer-events: auto;
                font-family: 'Poppins', sans-serif;
                font-size: 14px;
                color: #333;
            }
            .toast.show {
                transform: translateX(0);
            }
            .toast-success { border-color: #48bb78; }
            .toast-error { border-color: #f56565; }
            .toast-warning { border-color: #ed8936; }
            .toast-info { border-color: #4299e1; }
            
            .toast-icon { font-size: 18px; }
            .toast-success .toast-icon { color: #48bb78; }
            .toast-error .toast-icon { color: #f56565; }
            .toast-warning .toast-icon { color: #ed8936; }
            .toast-info .toast-icon { color: #4299e1; }

            .dark .toast {
                background: rgba(30, 30, 40, 0.95);
                color: #f0f0f0;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
        `;
        document.head.appendChild(style);
    },

    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Icons
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-times-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';

        toast.innerHTML = `
            <i class="fas ${icon} toast-icon"></i>
            <span>${message}</span>
        `;

        this.container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto dismiss
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }
};

window.Toast = Toast;
