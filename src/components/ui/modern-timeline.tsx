"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/src/lib/utils"
import { Card, CardContent } from "./card"
import { Badge } from "./badge"
import { CheckCircle, Clock, Circle, Check } from "lucide-react"

export interface TimelineItem {
  id?: string
  title: string
  description: string
  date?: string
  image?: string
  status?: "completed" | "current" | "upcoming"
  category?: string
  type?: "report" | "diagnosis" | "alert"
  risk_level?: "Low" | "Medium" | "High"
  trend?: "up" | "down" | "stable"
  reportData?: any
  onClick?: (data: any) => void
}

export interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

const getStatusConfig = (status: TimelineItem["status"], risk?: string) => {
  if (risk === "High") {
    return {
      progressColor: "bg-red-500",
      borderColor: "border-red-500/30",
      badgeBg: "bg-red-500/10",
      badgeText: "text-red-600",
      cardBg: "bg-red-50/50 dark:bg-red-950/20"
    }
  }

  const configs = {
    completed: {
      progressColor: "bg-emerald-500",
      borderColor: "border-emerald-500/20",
      badgeBg: "bg-emerald-500/10",
      badgeText: "text-emerald-600",
      cardBg: "bg-card/50"
    },
    current: {
      progressColor: "bg-blue-600 dark:bg-blue-400",
      borderColor: "border-blue-600/20 dark:border-blue-400/20",
      badgeBg: "bg-blue-100 dark:bg-blue-900/30",
      badgeText: "text-blue-800 dark:text-blue-200",
      cardBg: "bg-blue-50/30 dark:bg-blue-950/10"
    },
    upcoming: {
      progressColor: "bg-amber-500",
      borderColor: "border-amber-500/20",
      badgeBg: "bg-amber-500/10",
      badgeText: "text-amber-600",
      cardBg: "bg-amber-50/30 dark:bg-amber-950/10"
    }
  }
  
  return configs[status || "upcoming"]
}

const getStatusIcon = (status: TimelineItem["status"], risk?: string) => {
  if (risk === "High") return CheckCircle
  switch (status) {
    case "completed":
      return CheckCircle
    case "current":
      return Clock
    default:
      return Circle
  }
}

export function Timeline({ items, className }: TimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className={cn("w-full max-w-4xl mx-auto px-4 sm:px-6 py-8", className)}>
        <p className="text-center text-muted-foreground">No timeline items to display</p>
      </div>
    )
  }

  return (
    <section 
      className={cn("w-full max-w-4xl mx-auto px-4 sm:px-6 py-8", className)}
      role="list"
      aria-label="Timeline of events and milestones"
    >
      <div className="relative">
        <div 
          className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-border" 
          aria-hidden="true"
        />
        
        <motion.div
          className="absolute left-4 sm:left-6 top-0 w-px bg-primary origin-top"
          initial={{ scaleY: 0 }}
          whileInView={{ 
            scaleY: 1,
            transition: {
              duration: 1.2,
              ease: "easeOut",
              delay: 0.2
            }
          }}
          viewport={{ once: true }}
          aria-hidden="true"
        />

        <div className="space-y-8 sm:space-y-12 relative">
          {items?.map((item, index) => {
            const config = getStatusConfig(item.status, item.risk_level)
            const IconComponent = getStatusIcon(item.status, item.risk_level)
            
            return (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }
                }}
                viewport={{ once: true, margin: "-30px" }}
                role="listitem"
                aria-label={`Timeline item ${index + 1}: ${item.title}`}
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="relative flex-shrink-0">
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                      tabIndex={0}
                      role="button"
                      aria-label={item.reportData ? "View health insights" : `Icon for ${item.title}`}
                      onClick={() => item.onClick && item.onClick(item.reportData)}
                    >
                      <div className={cn(
                        "w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-background shadow-lg relative z-10 flex items-center justify-center transition-all duration-300",
                        item.risk_level === 'High' ? "bg-red-500 text-white" : 
                        item.reportData ? "bg-blue-600 text-white cursor-pointer" : "bg-muted"
                      )}>
                        {item.risk_level === 'High' ? (
                          <span className="text-xl sm:text-2xl">⚠️</span>
                        ) : item.reportData ? (
                          <span className="text-xl sm:text-2xl">📄</span>
                        ) : item.image ? (
                          <img
                            src={item.image}
                            alt={`${item.title} avatar`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <IconComponent 
                              className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground/70" 
                              aria-hidden="true"
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    className="flex-1 min-w-0"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={cn(
                      "border transition-all duration-300 hover:shadow-md relative",
                      config.cardBg,
                      config.borderColor,
                      "group-hover:border-primary/30"
                    )}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <motion.h3 
                                className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300"
                              >
                                {item.title}
                              </motion.h3>
                              {item.trend && (
                                <Badge className={cn(
                                  "px-1 py-0 h-5 flex items-center",
                                  item.trend === 'up' ? "bg-red-100 text-red-600" : 
                                  item.trend === 'down' ? "bg-emerald-100 text-emerald-600" : 
                                  "bg-blue-100 text-blue-600"
                                )}>
                                  {item.trend === 'up' ? "↑ Worsening" : item.trend === 'down' ? "↓ Improving" : "→ Stable"}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              {item.category && (
                                <span className="font-medium">{item.category}</span>
                              )}
                              {item.date && (
                                <time className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {item.date}
                                </time>
                              )}
                            </div>
                          </div>
                          
                          <Badge 
                            className={cn(
                              "w-fit text-xs font-medium border",
                              config.badgeBg,
                              config.badgeText,
                              "border-current/20"
                            )}
                          >
                            {item.risk_level ? `Risk: ${item.risk_level}` : item.status?.toUpperCase()}
                          </Badge>
                        </div>

                        <motion.p 
                          className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4"
                          initial={{ opacity: 0.8 }}
                          whileHover={{ opacity: 1 }}
                        >
                          {item.description}
                        </motion.p>

                        <div 
                          className="h-1 bg-muted rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={item.status === "completed" ? 100 : item.status === "current" ? 65 : 25}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Progress for ${item.title}`}
                        >
                          <motion.div
                            className={cn("h-full rounded-full", config.progressColor)}
                            initial={{ width: 0 }}
                            animate={{ 
                              width: item.status === "completed" ? "100%" : 
                                     item.status === "current" ? "65%" : "25%"
                            }}
                            transition={{ 
                              duration: 1.2, 
                              delay: index * 0.2 + 0.8,
                              ease: "easeOut"
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          className="absolute left-4 sm:left-6 -bottom-6 transform -translate-x-1/2"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ 
            opacity: 1, 
            scale: 1,
            transition: {
              duration: 0.4,
              delay: items.length * 0.1 + 0.3,
              type: "spring",
              stiffness: 400
            }
          }}
          viewport={{ once: true }}
          aria-hidden="true"
        >
          <div className="w-3 h-3 bg-primary rounded-full shadow-sm" />
        </motion.div>
      </div>
    </section>
  )
}
