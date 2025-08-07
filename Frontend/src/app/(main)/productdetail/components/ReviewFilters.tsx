import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Star } from 'lucide-react'

interface ReviewFiltersProps {
  selectedFilter: string
  onFilterChange: (filter: string) => void
}

export function ReviewFilters({ selectedFilter, onFilterChange }: ReviewFiltersProps) {
  const filters = [
    { key: "all", label: "Tất Cả" },
    { key: "photos", label: "Có Hình Ảnh", icon: Camera },
    { key: "5", label: "5", icon: Star },
    { key: "4", label: "4", icon: Star },
    { key: "3", label: "3", icon: Star },
    { key: "2", label: "2", icon: Star },
    { key: "1", label: "1", icon: Star },
  ]

  return (
    <Card className="review-card">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon
            return (
              <Button
                key={filter.key}
                variant={selectedFilter === filter.key ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange(filter.key)}
                className={selectedFilter === filter.key ? "shopee-orange" : ""}
              >
                {Icon && <Icon className="w-3 h-3 mr-1" />}
                {filter.label}
                {Icon === Star && <span className="ml-1">★</span>}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
