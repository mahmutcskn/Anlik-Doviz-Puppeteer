const puppeteer = require('puppeteer');
const fs = require('fs');
const { exec } = require('child_process');

(async () => {
    const browser = await puppeteer.launch({ headless: false }); 
    const page = await browser.newPage();
    
    let allGoldPrices = {};

    try {
        console.log('Fiyatlar çekiliyor...');
        await page.goto('https://canlidoviz.com/altin-fiyatlari', { waitUntil: 'networkidle0' }); 
        await new Promise(r => setTimeout(r, 5000));

        const gramAltinBuySelector = 'span[cid="32"][dt="bA"]';
        const gramAltinSellSelector = 'span[cid="32"][dt="amount"]';
        const gramAltinBuy = await page.$eval(gramAltinBuySelector, el => el.textContent);
        const gramAltinSell = await page.$eval(gramAltinSellSelector, el => el.textContent);

        const ceyrekAltinBuySelector = 'span[cid="11"][dt="bA"]';
        const ceyrekAltinSellSelector = 'span[cid="11"][dt="amount"]';
        const ceyrekAltinBuy = await page.$eval(ceyrekAltinBuySelector, el => el.textContent);
        const ceyrekAltinSell = await page.$eval(ceyrekAltinSellSelector, el => el.textContent);

        const yarimAltinBuySelector = 'span[cid="47"][dt="bA"]';
        const yarimAltinSellSelector = 'span[cid="47"][dt="amount"]';
        const yarimAltinBuy = await page.$eval(yarimAltinBuySelector, el => el.textContent);
        const yarimAltinSell = await page.$eval(yarimAltinSellSelector, el => el.textContent);

        const tamAltinBuySelector = 'span[cid="14"][dt="bA"]';
        const tamAltinSellSelector = 'span[cid="14"][dt="amount"]';
        const tamAltinBuy = await page.$eval(tamAltinBuySelector, el => el.textContent);
        const tamAltinSell = await page.$eval(tamAltinSellSelector, el => el.textContent);

        allGoldPrices = {
            gram: { buy: gramAltinBuy, sell: gramAltinSell },
            ceyrek: { buy: ceyrekAltinBuy, sell: ceyrekAltinSell },
            yarim: { buy: yarimAltinBuy, sell: yarimAltinSell },
            tam: { buy: tamAltinBuy, sell: tamAltinSell }
        };

    } catch (error) {
        console.error('Veri çekilirken bir hata oluştu:', error);
    } finally {
        if (browser) await browser.close();
    }

    if (Object.keys(allGoldPrices).length > 0) {
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Anlık Altın Fiyatları</title>
            <style>
                body { font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f4f4f4; }
                .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); text-align: center; max-width: 500px; width: 90%; margin: 1rem 0; }
                h1 { color: #333; font-size: 2em; }
                h2 { margin-top: 1.5rem; color: #007bff; }
                p { font-size: 1.2em; color: #555; margin: 0.5em 0; }
                span { font-weight: bold; color: #28a745; }
                .update-info { font-size: 0.8em; color: #777; margin-top: 2rem; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Anlık Altın Fiyatları</h1>

                <h2>Gram Altın</h2>
                <p>Alış: <span>${allGoldPrices.gram.buy} TL</span></p>
                <p>Satış: <span>${allGoldPrices.gram.sell} TL</span></p>

                <h2>Çeyrek Altın</h2>
                <p>Alış: <span>${allGoldPrices.ceyrek.buy} TL</span></p>
                <p>Satış: <span>${allGoldPrices.ceyrek.sell} TL</span></p>

                <h2>Yarım Altın</h2>
                <p>Alış: <span>${allGoldPrices.yarim.buy} TL</span></p>
                <p>Satış: <span>${allGoldPrices.yarim.sell} TL</span></p>

                <h2>Tam Altın</h2>
                <p>Alış: <span>${allGoldPrices.tam.buy} TL</span></p>
                <p>Satış: <span>${allGoldPrices.tam.sell} TL</span></p>

                <p class="update-info">Son Güncelleme: ${new Date().toLocaleString()}</p>
            </div>
        </body>
        </html>
        `;

        fs.writeFileSync('altin-fiyatlari.html', htmlContent, 'utf8');
        console.log('HTML raporu oluşturuldu: altin-fiyatlari.html');

        let command;
        if (process.platform === 'win32') {
            command = `start altin-fiyatlari.html`;
        } else if (process.platform === 'darwin') {
            command = `open altin-fiyatlari.html`;
        } else {
            command = `xdg-open altin-fiyatlari.html`;
        }

        exec(command, (err) => {
            if (err) {
                console.error(`Dosya açılırken hata oluştu: ${err}`);
                return;
            }
            console.log('Rapor varsayılan tarayıcıda açıldı.');
        });

    } else {
        console.error('Fiyat verisi alınamadı, rapor oluşturulamadı.');
    }

})();