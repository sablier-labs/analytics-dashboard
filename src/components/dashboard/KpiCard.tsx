import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils/format";

type KpiCardProps = {
  title: string;
  value: number;
  previousValue?: number;
  format?: "number" | "currency" | "percentage";
  icon?: React.ReactNode;
  subtitle?: string;
};

export function KpiCard({
  title,
  value,
  previousValue,
  format = "number",
  icon,
  subtitle,
}: KpiCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return formatCurrency(val);
      case "percentage":
        return formatPercentage(val);
      default:
        return formatNumber(val);
    }
  };

  const changePercent = previousValue ? ((value - previousValue) / previousValue) * 100 : null;

  const changeVariant = changePercent
    ? changePercent > 0
      ? "success"
      : changePercent < 0
        ? "error"
        : "default"
    : "default";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon && <div className="text-sablier-500">{icon}</div>}
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {changePercent !== null && (
            <Badge variant={changeVariant}>
              {changePercent > 0 ? "+" : ""}
              {changePercent.toFixed(1)}%
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold text-gray-900">{formatValue(value)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
