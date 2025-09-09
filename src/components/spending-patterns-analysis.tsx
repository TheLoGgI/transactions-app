"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2, MapPin, TrendingUp, Users, DollarSign } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { LoadingState, EmptyState } from "./loading-states";

interface GeographicSpending {
  city: string;
  country: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
  merchants: string[];
}

interface CategorySpending {
  categoryCode: string;
  categoryName: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
  color: string;
}

interface SpendingFrequency {
  merchantName: string;
  frequency: number;
  averageDaysBetween: number;
  lastTransaction: string;
  totalSpent: number;
}

interface SpendingPatternsAnalysisProps {
  query: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export function SpendingPatternsAnalysis({ query }: SpendingPatternsAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'geographic' | 'category' | 'frequency'>('geographic');

  const { data: geoData, error: geoError, isLoading: geoLoading } = useSWR<GeographicSpending[], unknown>(
    `/api/analysis/spending-patterns/geographic?${query}`,
    fetcher
  );

  const { data: categoryData, error: categoryError, isLoading: categoryLoading } = useSWR<CategorySpending[], unknown>(
    `/api/analysis/spending-patterns/categories?${query}`,
    fetcher
  )

  const { data: frequencyData, error: frequencyError, isLoading: frequencyLoading } = useSWR<SpendingFrequency[], unknown>(
    `/api/analysis/spending-patterns/frequency?${query}`,
    fetcher
  );

  const renderGeographicView = () => {
    if (geoLoading) {
      return (
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">Loading geographic data...</p>
              <p className="text-xs text-muted-foreground">
                Analyzing spending by location
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (geoError || !geoData || geoData.length === 0) {
      return (
        <EmptyState 
          title="No geographic data available"
          description="No location-based spending data found for the selected period"
          height="h-[400px]"
        />
      );
    }

    return (
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={geoData.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="city" 
              className="text-xs fill-muted-foreground"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number) => [
                value.toLocaleString("da-DK", { style: "currency", currency: "DKK" }),
                "Total Spent"
              ]}
              labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey="totalAmount" fill="#0088FE" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {geoData.slice(0, 6).map((location) => (
            <Card key={`${location.city}-${location.country}`} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">{location.city}</span>
                </div>
                <Badge variant="outline">{location.country}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Spent:</span>
                  <span className="font-medium">
                    {location.totalAmount.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Transactions:</span>
                  <span>{location.transactionCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>% of Total:</span>
                  <span>{location.percentage.toFixed(1)}%</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {location.merchants.length} merchant(s)
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderCategoryView = () => {
    if (categoryLoading) {
      return (
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">Loading category data...</p>
              <p className="text-xs text-muted-foreground">
                Analyzing spending by merchant categories
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (categoryError || !categoryData || categoryData.length === 0) {
      return (
        <EmptyState 
          title="No category data available"
          description="No category-based spending data found for the selected period"
          height="h-[400px]"
        />
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="totalAmount"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [
                  value.toLocaleString("da-DK", { style: "currency", currency: "DKK" }),
                  "Total Spent"
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-3">
          {categoryData.map((category, index) => (
            <div key={category.categoryCode} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div>
                  <div className="font-medium">{category.categoryName}</div>
                  <div className="text-sm text-muted-foreground">
                    {category.transactionCount} transactions
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {category.totalAmount.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {category.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFrequencyView = () => {
    if (frequencyLoading) {
      return (
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">Loading frequency data...</p>
              <p className="text-xs text-muted-foreground">
                Analyzing shopping frequency patterns
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (frequencyError || !frequencyData || frequencyData.length === 0) {
      return (
        <EmptyState 
          title="No frequency data available"
          description="No recurring spending patterns found for the selected period"
          height="h-[400px]"
        />
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {frequencyData.slice(0, 9).map((merchant) => (
            <Card key={merchant.merchantName} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{merchant.merchantName}</span>
                  <Badge variant="secondary">
                    {merchant.frequency}x
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Spent:</span>
                    <span className="font-medium">
                      {merchant.totalSpent.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Days Between:</span>
                    <span>{merchant.averageDaysBetween} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Visit:</span>
                    <span>{new Date(merchant.lastTransaction).toLocaleDateString("da-DK")}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Spending Patterns Analysis
        </CardTitle>
        <CardDescription>
          Analyze spending patterns by location, category, and frequency
        </CardDescription>
        
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setActiveTab('geographic')}
            disabled={geoLoading}
            className={`px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 ${
              activeTab === 'geographic' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <MapPin className="inline h-4 w-4 mr-1" />
            Geographic
            {geoLoading && <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />}
          </button>
          <button
            onClick={() => setActiveTab('category')}
            disabled={categoryLoading}
            className={`px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 ${
              activeTab === 'category' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <DollarSign className="inline h-4 w-4 mr-1" />
            Categories
            {categoryLoading && <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />}
          </button>
          <button
            onClick={() => setActiveTab('frequency')}
            disabled={frequencyLoading}
            className={`px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 ${
              activeTab === 'frequency' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Users className="inline h-4 w-4 mr-1" />
            Frequency
            {frequencyLoading && <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'geographic' && renderGeographicView()}
        {activeTab === 'category' && renderCategoryView()}
        {activeTab === 'frequency' && renderFrequencyView()}
      </CardContent>
    </Card>
  );
}
