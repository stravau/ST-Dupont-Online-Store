// Warm-up test: carrega o modelo CLIP ViT-B/32 do Xenova + testa embedding
// de uma imagem local. Se isto correr sem erro, o setup está OK.
import { pipeline, env, RawImage } from "@xenova/transformers";
import sharp from "sharp";

env.cacheDir = "C:/Users/UTILIZ~1/AppData/Local/Temp/xenova-cache";
env.allowRemoteModels = true;

console.log("A carregar CLIP ViT-B/32 (primeira vez baixa ~350MB)…");
const t0 = Date.now();
const extractor = await pipeline("image-feature-extraction", "Xenova/clip-vit-base-patch32");
console.log(`Modelo carregado em ${((Date.now() - t0) / 1000).toFixed(1)}s`);

const testPath = "c:/Users/Utilizador/ST-Dupont-Online-Store/public/products/box-12-refills/000432.webp";
console.log(`\nA gerar embedding de ${testPath}…`);

// Decode WebP com sharp para raw RGBA, empacota em RawImage (o formato
// nativo do transformers.js em Node).
const { data, info } = await sharp(testPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const img = new RawImage(new Uint8ClampedArray(data), info.width, info.height, 4);

const t1 = Date.now();
const result = await extractor(img, { pooling: "mean", normalize: true });
console.log(`Embedding em ${((Date.now() - t1) / 1000).toFixed(1)}s`);
console.log(`Dimensões: [${result.dims.join(", ")}]`);
console.log(`Norm: ${Math.sqrt(result.data.reduce((s, v) => s + v * v, 0)).toFixed(4)} (deve ser ~1.0)`);
console.log(`Primeiros 5 valores: [${Array.from(result.data.slice(0, 5)).map(v => v.toFixed(4)).join(", ")}]`);
