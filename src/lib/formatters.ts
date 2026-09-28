export const formatPercent = (value?: number) =>
  value === undefined ? "Não informado" : `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value)}%`;

export const formatGrade = (value?: number) =>
  value === undefined ? "Não informado" : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value);
