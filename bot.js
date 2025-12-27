// bot.js - Yangi format
class SaleeBot {
    constructor() {
        this.BOT_TOKEN = '8426398720:AAEd-mMqpc_dPNQSqmAMht67t3I16nc2b3A';
        this.CHANNEL_ID = '@salee_servis';
        this.API_URL = 'https://api.telegram.org/bot';
        console.log('✅ Salee Bot yuklandi');
    }
    
    async sendToChannel(orderData) {
        try {
            const message = this.formatChannelMessage(orderData);
            
            const response = await fetch(`${this.API_URL}${this.BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    chat_id: this.CHANNEL_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            
            const result = await response.json();
            return result.ok;
            
        } catch (error) {
            console.error('Bot xatosi:', error);
            return false;
        }
    }
    
    formatChannelMessage(order) {
        let message = '';
        
        // Header - faqat buyurtma raqami
        message += `<b>🆕 #${order.id}</b>\n\n`;
        
        // Mijoz ma'lumotlari (ID SIZ)
        message += `<b>👤 Mijoz:</b> ${order.customerName}\n`;
        message += `<b>📱 Telegram:</b> ${order.telegramUsername}\n`;
        message += `<b>🎮 O'yin ID:</b> ${order.gameId}\n\n`;
        
        // Mahsulotlar RO'YXATI narxlari bilan
        message += `<b>📦 Mahsulotlar:</b>\n`;
        
        order.items.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            // Har bir mahsulotni alohida ko'rsatish
            message += `▫️ <b>${item.name}</b>\n`;
            message += `   Narxi: ${item.price.toLocaleString('uz-UZ')} UZS\n`;
            message += `   Soni: ${item.quantity} ta\n`;
            message += `   Summa: ${itemTotal.toLocaleString('uz-UZ')} UZS\n\n`;
        });
        
        // Jami summa
        message += `<b>💰 JAMI:</b> ${order.totalAmount.toLocaleString('uz-UZ')} UZS\n`;
        
        // Sana (oddiy formatda)
        const date = new Date(order.date);
        const time = date.toLocaleTimeString('uz-UZ', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        message += `<b>⏰ Vaqt:</b> ${time}\n`;
        
        // Xizmat nomi (pastki qismda)
        message += `<i>⚡ Salee Servis</i>`;
        
        return message;
    }
}

window.saleeBot = new SaleeBot();