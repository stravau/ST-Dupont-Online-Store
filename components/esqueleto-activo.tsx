"use client";

import { useEffect } from "react";

// Quem está a mostrar um esqueleto neste momento.
//
// PARA QUE SERVE: a barra de progresso do topo precisa de saber quando a
// espera ACABOU, e no storefront a rota não serve de sinal. Há um loading.tsx
// na raiz do /[lang], portanto o App Router confirma o URL logo que tem o
// esqueleto para mostrar — muito antes de o conteúdo real chegar. Se a barra
// terminasse aí, apagava-se ao primeiro terço do caminho.
//
// O esqueleto sabe a resposta melhor do que ninguém: ele existe exactamente
// durante a espera e desaparece no instante em que o conteúdo o substitui.
// Este marcador é isso — um componente invisível que os loading.tsx montam
// para dizer "ainda cá estou", e cujo desmontar é o sinal de chegada.
//
// Contagem em módulo e não contexto de propósito: os loading.tsx são
// componentes de servidor espalhados por cinco segmentos, e obrigá-los a todos
// a viver dentro de um provider era canalização a mais para guardar um número.

let montados = 0;
const ouvintes = new Set<() => void>();

function avisar() {
  for (const f of ouvintes) f();
}

export function haEsqueleto() {
  return montados > 0;
}

export function ouvirEsqueletos(f: () => void) {
  ouvintes.add(f);
  return () => {
    ouvintes.delete(f);
  };
}

export function EsqueletoActivo() {
  useEffect(() => {
    montados++;
    avisar();
    return () => {
      montados--;
      avisar();
    };
  }, []);
  return null;
}
