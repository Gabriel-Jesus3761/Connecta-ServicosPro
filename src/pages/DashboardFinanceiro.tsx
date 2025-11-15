import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  AlertCircle,
  PieChart,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/DateRangePicker";
import { mockAppointments, mockExpenses } from "@/data/mockData";
import { formatCurrency, formatDate } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

type DateRange = { from?: Date; to?: Date };

export default function DashboardFinanceiro() {
  const { setIsMobileMenuOpen } = useOutletContext<{
    setIsMobileMenuOpen: (value: boolean) => void;
  }>();
  const today = new Date();

  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(today.getFullYear(), today.getMonth(), 1),
    to: today,
  });

  // Filtrar receitas (agendamentos concluídos) por período
  const periodRevenues = useMemo(() => {
    if (!dateRange.from) return [];

    return mockAppointments.filter((apt) => {
      if (apt.status !== "completed") return false;

      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);

      const fromDate = new Date(dateRange.from!);
      fromDate.setHours(0, 0, 0, 0);

      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        return aptDate >= fromDate && aptDate <= toDate;
      }

      return aptDate.toDateString() === fromDate.toDateString();
    });
  }, [dateRange]);

  // Filtrar despesas por período
  const periodExpenses = useMemo(() => {
    if (!dateRange.from) return [];

    return mockExpenses.filter((exp) => {
      const expDate = new Date(exp.date);
      expDate.setHours(0, 0, 0, 0);

      const fromDate = new Date(dateRange.from!);
      fromDate.setHours(0, 0, 0, 0);

      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        return expDate >= fromDate && expDate <= toDate;
      }

      return expDate.toDateString() === fromDate.toDateString();
    });
  }, [dateRange]);

  // Estatísticas financeiras
  const financialStats = useMemo(() => {
    const totalRevenue = periodRevenues.reduce(
      (sum, apt) => sum + apt.price,
      0
    );
    const totalExpenses = periodExpenses
      .filter((exp) => exp.isPaid)
      .reduce((sum, exp) => sum + exp.amount, 0);
    const pendingExpenses = periodExpenses
      .filter((exp) => !exp.isPaid)
      .reduce((sum, exp) => sum + exp.amount, 0);
    const profit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      pendingExpenses,
      profit,
      profitMargin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0,
    };
  }, [periodRevenues, periodExpenses]);

  // Despesas por categoria
  const expensesByCategory = useMemo(() => {
    const categories = new Map<
      string,
      { category: string; total: number; count: number }
    >();

    periodExpenses
      .filter((exp) => exp.isPaid)
      .forEach((exp) => {
        const existing = categories.get(exp.category) || {
          category: exp.category,
          total: 0,
          count: 0,
        };
        categories.set(exp.category, {
          ...existing,
          total: existing.total + exp.amount,
          count: existing.count + 1,
        });
      });

    return Array.from(categories.values()).sort((a, b) => b.total - a.total);
  }, [periodExpenses]);

  // Receitas por método de pagamento
  const revenuesByPaymentMethod = useMemo(() => {
    const methods = new Map<
      string,
      { method: string; total: number; count: number }
    >();

    periodRevenues.forEach((apt) => {
      if (!apt.paymentMethod) return;

      const existing = methods.get(apt.paymentMethod) || {
        method: apt.paymentMethod,
        total: 0,
        count: 0,
      };
      methods.set(apt.paymentMethod, {
        ...existing,
        total: existing.total + apt.price,
        count: existing.count + 1,
      });
    });

    return Array.from(methods.values()).sort((a, b) => b.total - a.total);
  }, [periodRevenues]);

  // Últimas transações (mix de receitas e despesas)
  const recentTransactions = useMemo(() => {
    const revenues = periodRevenues.slice(0, 5).map((apt) => ({
      id: apt.id,
      type: "revenue" as const,
      description: `${apt.service} - ${apt.clientName}`,
      amount: apt.price,
      date: apt.date,
      paymentMethod: apt.paymentMethod,
    }));

    const expenses = periodExpenses.slice(0, 5).map((exp) => ({
      id: exp.id,
      type: "expense" as const,
      description: exp.description,
      amount: exp.amount,
      date: exp.date,
      paymentMethod: exp.paymentMethod,
      isPaid: exp.isPaid,
    }));

    return [...revenues, ...expenses]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);
  }, [periodRevenues, periodExpenses]);

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      rent: "Aluguel",
      utilities: "Utilidades",
      supplies: "Suprimentos",
      salaries: "Salários",
      marketing: "Marketing",
      maintenance: "Manutenção",
      other: "Outros",
    };
    return labels[category] || category;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      pix: "PIX",
      credit: "Crédito",
      debit: "Débito",
      cash: "Dinheiro",
      boleto: "Boleto",
    };
    return labels[method] || method;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      rent: "bg-red-500",
      utilities: "bg-blue-500",
      supplies: "bg-green-500",
      salaries: "bg-purple-500",
      marketing: "bg-yellow-500",
      maintenance: "bg-orange-500",
      other: "bg-gray-500",
    };
    return colors[category] || "bg-gray-500";
  };

  return (
    <div>
      <Header
        title="Dashboard Financeiro"
        subtitle="Controle de entrada, saída e lucro da empresa"
        onMobileMenuClick={() => setIsMobileMenuOpen(true)}
      />

      <div className="p-4 md:p-8">
        {/* Filtros */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            className="w-full sm:w-auto"
          />
        </div>

        {/* Cards de Estatísticas Principais */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={item}>
            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Receita Total
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {formatCurrency(financialStats.totalRevenue)}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {periodRevenues.length} transações
                    </p>
                  </div>
                  <div className="bg-green-500 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Despesas Pagas
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {formatCurrency(financialStats.totalExpenses)}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {periodExpenses.filter((e) => e.isPaid).length} pagamentos
                      realizados
                    </p>
                  </div>
                  <div className="bg-red-500 p-3 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card
              className={`hover:shadow-lg transition-shadow duration-200 border-l-4 ${
                financialStats.profit >= 0
                  ? "border-l-gold"
                  : "border-l-orange-500"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Lucro Líquido
                    </p>
                    <h3
                      className={`text-3xl font-bold mb-2 ${
                        financialStats.profit >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(financialStats.profit)}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Margem: {financialStats.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      financialStats.profit >= 0 ? "bg-gold" : "bg-orange-500"
                    }`}
                  >
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Despesas Pendentes
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {formatCurrency(financialStats.pendingExpenses)}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {periodExpenses.filter((e) => !e.isPaid).length}{" "}
                      pagamentos pendentes
                    </p>
                  </div>
                  <div className="bg-yellow-500 p-3 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Despesas por Categoria */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-gold" />
                  Despesas por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {expensesByCategory.map((cat) => {
                    const percentage =
                      financialStats.totalExpenses > 0
                        ? (cat.total / financialStats.totalExpenses) * 100
                        : 0;

                    return (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded ${getCategoryColor(
                                cat.category
                              )}`}
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {getCategoryLabel(cat.category)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(cat.total)}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getCategoryColor(
                              cat.category
                            )}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {cat.count}{" "}
                          {cat.count === 1 ? "transação" : "transações"}
                        </p>
                      </div>
                    );
                  })}
                  {expensesByCategory.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-4">
                      Nenhuma despesa no período selecionado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Receitas por Método de Pagamento */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gold" />
                  Receitas por Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {revenuesByPaymentMethod.map((method) => {
                    const percentage =
                      financialStats.totalRevenue > 0
                        ? (method.total / financialStats.totalRevenue) * 100
                        : 0;

                    return (
                      <div key={method.method}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {getPaymentMethodLabel(method.method)}
                          </span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(method.total)}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gold"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {method.count}{" "}
                          {method.count === 1 ? "transação" : "transações"}
                        </p>
                      </div>
                    );
                  })}
                  {revenuesByPaymentMethod.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-4">
                      Nenhuma receita no período selecionado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Últimas Transações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="border-b border-gray-100">
              <CardTitle>Últimas Transações</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Forma de Pagamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTransactions.map((transaction) => (
                      <tr
                        key={`${transaction.type}-${transaction.id}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {formatDate(transaction.date)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              transaction.type === "revenue"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {transaction.type === "revenue"
                              ? "Receita"
                              : "Despesa"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {transaction.description}
                          </span>
                          {"isPaid" in transaction && !transaction.isPaid && (
                            <Badge variant="warning" className="ml-2">
                              Pendente
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {transaction.paymentMethod ? (
                            <span className="text-sm text-gray-500">
                              {getPaymentMethodLabel(transaction.paymentMethod)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-bold ${
                              transaction.type === "revenue"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "revenue" ? "+" : "-"}{" "}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Despesas Pendentes */}
        {periodExpenses.filter((e) => !e.isPaid).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <Card className="border-yellow-500 border-2">
              <CardHeader className="border-b border-yellow-100 bg-yellow-50">
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  Despesas Pendentes de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vencimento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {periodExpenses
                        .filter((e) => !e.isPaid)
                        .map((expense) => (
                          <tr key={expense.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">
                                {formatDate(expense.date)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-900">
                                  {expense.description}
                                </span>
                                {expense.recurring && (
                                  <Badge variant="outline" className="text-xs">
                                    Recorrente
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline">
                                {getCategoryLabel(expense.category)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-bold text-gray-900">
                                {formatCurrency(expense.amount)}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
