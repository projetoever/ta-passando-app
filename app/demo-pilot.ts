"use client";

import { useCallback, useEffect, useState } from "react";
import type { RequestStatus, RouteStatus } from "@ta-passando/contracts";
import { assertRequestTransition } from "@ta-passando/domain";

export type DemoRequest = {
  id: string;
  sellerId: number;
  sellerName: string;
  customer: string;
  product: string;
  quantity: string;
  waitLabel: string;
  meeting: string;
  reference: string;
  distance: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  rating: number | null;
};

export type DemoPilotState = {
  version: 1;
  routeStatus: RouteStatus;
  activeCategories: string[];
  paymentMethods: string[];
  serviceRadius: string;
  request: DemoRequest | null;
  updatedAt: string;
};

export const requestStatusCopy: Record<
  RequestStatus,
  { label: string; customer: string; sellerAction?: string }
> = {
  pending: {
    label: "Aguardando aceite",
    customer: "O vendedor recebeu seu interesse e pode aceitar enquanto estiver na região.",
    sellerAction: "Aceitar solicitação",
  },
  accepted: {
    label: "Solicitação aceita",
    customer: "O vendedor confirmou que consegue atender. Aguarde o início do deslocamento.",
    sellerAction: "Avisar que está a caminho",
  },
  on_the_way: {
    label: "Vendedor a caminho",
    customer: "O vendedor está se aproximando do ponto seguro combinado.",
    sellerAction: "Avisar que chegou",
  },
  arrived: {
    label: "Vendedor chegou",
    customer: "Encontre o vendedor no ponto combinado e confira o produto antes de pagar.",
    sellerAction: "Concluir atendimento",
  },
  completed: {
    label: "Atendimento concluído",
    customer: "A simulação chegou ao fim. Sua avaliação ajuda a validar a experiência.",
  },
  declined: {
    label: "Vendedor não pôde atender",
    customer: "A rota não permitiu esta parada. Você pode tentar outro vendedor próximo.",
  },
  expired: {
    label: "Tempo de espera encerrado",
    customer: "A solicitação expirou sem aceite e deixou de aparecer na fila do vendedor.",
  },
  cancelled: {
    label: "Solicitação cancelada",
    customer: "A solicitação foi encerrada e o vendedor recebeu a atualização.",
  },
};

export const activeRequestStatuses: RequestStatus[] = [
  "pending",
  "accepted",
  "on_the_way",
  "arrived",
];

const STORAGE_KEY = "te-vi-na-tv:pilot-demo:v1";
const UPDATE_EVENT = "te-vi-na-tv:pilot-demo-updated";

function initialState(): DemoPilotState {
  return {
    version: 1,
    routeStatus: "active",
    activeCategories: ["Ovos frescos", "Ovos caipiras"],
    paymentMethods: ["Pix", "Cartão", "Dinheiro"],
    serviceRadius: "2 km",
    request: null,
    updatedAt: new Date().toISOString(),
  };
}

function parseState(raw: string | null): DemoPilotState {
  if (!raw) return initialState();

  try {
    const parsed = JSON.parse(raw) as Partial<DemoPilotState>;
    if (parsed.version !== 1) return initialState();
    return {
      ...initialState(),
      ...parsed,
      request: parsed.request ?? null,
    };
  } catch {
    return initialState();
  }
}

function readState(): DemoPilotState {
  if (typeof window === "undefined") return initialState();
  return parseState(window.localStorage.getItem(STORAGE_KEY));
}

function persistState(next: DemoPilotState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

export function isOpenRequest(request: DemoRequest | null): boolean {
  return Boolean(request && activeRequestStatuses.includes(request.status));
}

export function useDemoPilot() {
  const [state, setState] = useState<DemoPilotState>(initialState);

  useEffect(() => {
    const sync = () => setState(readState());
    const initialSync = window.setTimeout(sync, 0);
    window.addEventListener("storage", sync);
    window.addEventListener(UPDATE_EVENT, sync);
    return () => {
      window.clearTimeout(initialSync);
      window.removeEventListener("storage", sync);
      window.removeEventListener(UPDATE_EVENT, sync);
    };
  }, []);

  const update = useCallback((change: (current: DemoPilotState) => DemoPilotState) => {
    const next = {
      ...change(readState()),
      updatedAt: new Date().toISOString(),
    };
    persistState(next);
    setState(next);
  }, []);

  const createRequest = useCallback(
    (input: Omit<DemoRequest, "id" | "status" | "createdAt" | "updatedAt" | "rating">) => {
      const now = new Date().toISOString();
      update((current) => ({
        ...current,
        request: {
          ...input,
          id: `demo-${Date.now()}`,
          status: "pending",
          createdAt: now,
          updatedAt: now,
          rating: null,
        },
      }));
    },
    [update],
  );

  const transitionRequest = useCallback(
    (nextStatus: RequestStatus) => {
      update((current) => {
        if (!current.request) return current;
        assertRequestTransition(current.request.status, nextStatus);
        return {
          ...current,
          request: {
            ...current.request,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    [update],
  );

  const setRouteStatus = useCallback(
    (routeStatus: RouteStatus) => update((current) => ({ ...current, routeStatus })),
    [update],
  );

  const toggleCategory = useCallback(
    (category: string) =>
      update((current) => ({
        ...current,
        activeCategories: current.activeCategories.includes(category)
          ? current.activeCategories.filter((item) => item !== category)
          : [...current.activeCategories, category],
      })),
    [update],
  );

  const togglePayment = useCallback(
    (payment: string) =>
      update((current) => ({
        ...current,
        paymentMethods: current.paymentMethods.includes(payment)
          ? current.paymentMethods.filter((item) => item !== payment)
          : [...current.paymentMethods, payment],
      })),
    [update],
  );

  const rateRequest = useCallback(
    (rating: number) =>
      update((current) => ({
        ...current,
        request: current.request ? { ...current.request, rating } : null,
      })),
    [update],
  );

  const resetScenario = useCallback(() => {
    const next = initialState();
    setState(next);
    persistState(next);
  }, []);

  return {
    state,
    createRequest,
    transitionRequest,
    setRouteStatus,
    toggleCategory,
    togglePayment,
    rateRequest,
    resetScenario,
  };
}
