import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"

interface Column<T> {
  key: keyof T
  label: string
  render?: (value: T[keyof T], row: T) => React.ReactNode
  className?: string
}

interface MobileTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyField: keyof T
  className?: string
  renderMobileCard?: (row: T, index: number) => React.ReactNode
  emptyMessage?: string
  title?: string
}

export function MobileTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  className,
  renderMobileCard,
  emptyMessage = "No data available",
  title
}: MobileTableProps<T>) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      className={cn(
                        "h-12 px-4 text-left align-middle font-medium text-muted-foreground text-sm",
                        column.className
                      )}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr 
                    key={String(row[keyField])} 
                    className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn(
                          "p-4 align-middle text-sm",
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : String(row[column.key] || "")
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {data.map((row, index) => (
            <div
              key={String(row[keyField])}
              className="p-4 hover:bg-muted/50 transition-colors"
            >
              {renderMobileCard ? (
                renderMobileCard(row, index)
              ) : (
                <div className="space-y-2">
                  {columns.map((column) => (
                    <div key={String(column.key)} className="flex flex-col space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {column.label}
                      </span>
                      <div className="text-sm">
                        {column.render
                          ? column.render(row[column.key], row)
                          : String(row[column.key] || "")
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to create responsive badge variants
export function responsiveBadge(variant?: "default" | "secondary" | "destructive" | "outline", className?: string) {
  return cn(
    "text-xs px-2 py-1 whitespace-nowrap",
    className
  )
}

// Helper function for mobile-friendly actions
export function MobileActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {children}
    </div>
  )
}