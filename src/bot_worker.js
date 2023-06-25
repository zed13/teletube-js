import { Worker } from "worker_threads";
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


function runBotService() {
    const worker = new Worker(`${__dirname}/bot.js`);

    worker.on("exit", (code) => {
        if (code != 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
        }
    });
}


export { runBotService };